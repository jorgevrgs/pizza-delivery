/*
 * Worker-related tasks
 *
 */

// Dependencies node
const https = require("https");
const http = require("http");
const url = require("url");

// Dependencies lib
const helpers = require("./helpers");
const _db = require("./database");

// Instantiate the worker module object
let workers = {};

// Lookup all checks, get their data, send to validator
workers.gatherAllChecks = async function () {
  try {
    // Get all the checks
    const checks = await _db.list("checks");

    checks.forEach(async (check) => {
      const originalCheckData = await _db.read("checks", check);

      // Pass it to the check validator, and let that function continue the function or log the error(s) as needed
      workers.validateCheckData(originalCheckData);
    });
  } catch (error) {
    helpers.log.error(error);
  }
};

// Sanity-check the check-data,
workers.validateCheckData = function (originalCheckData) {
  originalCheckData =
    typeof originalCheckData === "object" && originalCheckData !== null
      ? originalCheckData
      : {};

  originalCheckData.id =
    typeof originalCheckData.id === "string" &&
    originalCheckData.id.trim().length === 20
      ? originalCheckData.id.trim()
      : false;

  originalCheckData.userPhone =
    typeof originalCheckData.userPhone === "string" &&
    originalCheckData.userPhone.trim().length === 10
      ? originalCheckData.userPhone.trim()
      : false;

  originalCheckData.protocol =
    typeof originalCheckData.protocol === "string" &&
    ["http", "https"].indexOf(originalCheckData.protocol) > -1
      ? originalCheckData.protocol
      : false;

  originalCheckData.url =
    typeof originalCheckData.url === "string" &&
    originalCheckData.url.trim().length > 0
      ? originalCheckData.url.trim()
      : false;

  originalCheckData.method =
    typeof originalCheckData.method === "string" &&
    ["post", "get", "put", "delete"].indexOf(originalCheckData.method) > -1
      ? originalCheckData.method
      : false;

  originalCheckData.successCodes =
    typeof originalCheckData.successCodes === "object" &&
    originalCheckData.successCodes instanceof Array &&
    originalCheckData.successCodes.length > 0
      ? originalCheckData.successCodes
      : false;

  originalCheckData.timeoutSeconds =
    typeof originalCheckData.timeoutSeconds === "number" &&
    originalCheckData.timeoutSeconds % 1 === 0 &&
    originalCheckData.timeoutSeconds >= 1 &&
    originalCheckData.timeoutSeconds <= 5
      ? originalCheckData.timeoutSeconds
      : false;

  // Set the keys that may not be set (if the workers have never seen this check before)
  originalCheckData.state =
    typeof originalCheckData.state === "string" &&
    ["up", "down"].indexOf(originalCheckData.state) > -1
      ? originalCheckData.state
      : "down";

  originalCheckData.lastChecked =
    typeof originalCheckData.lastChecked === "number" &&
    originalCheckData.lastChecked > 0
      ? originalCheckData.lastChecked
      : false;

  // If all checks pass, pass the data along to the next step in the process
  if (
    originalCheckData.id &&
    originalCheckData.userPhone &&
    originalCheckData.protocol &&
    originalCheckData.url &&
    originalCheckData.method &&
    originalCheckData.successCodes &&
    originalCheckData.timeoutSeconds
  ) {
    workers.performCheck(originalCheckData);
  } else {
    // If checks fail, log the error and fail silently
    helpers.log.debug(
      "workers",
      "Error: one of the checks is not properly formatted. Skipping."
    );
  }
};

// Perform the check, send the originalCheck data and the outcome of the check process to the next step in the process
workers.performCheck = function (originalCheckData) {
  // Prepare the intial check outcome
  let checkOutcome = {
    error: false,
    responseCode: false,
  };

  // Mark that the outcome has not been sent yet
  let outcomeSent = false;

  // Parse the hostname and path out of the originalCheckData
  const parsedUrl = new URL(
    originalCheckData.protocol + "://" + originalCheckData.url
  );

  const hostName = parsedUrl.hostname;
  const path = parsedUrl.path; // Using path not pathname because we want the query string

  // Construct the request
  const requestDetails = {
    protocol: originalCheckData.protocol + ":",
    hostname: hostName,
    method: originalCheckData.method.toUpperCase(),
    path: path,
    timeout: originalCheckData.timeoutSeconds * 1000,
  };

  // Instantiate the request object (using either the http or https module)
  const _moduleToUse = originalCheckData.protocol === "http" ? http : https;
  const req = _moduleToUse.request(requestDetails, function (res) {
    // Grab the status of the sent request
    const status = res.statusCode;

    // Update the checkOutcome and pass the data along
    checkOutcome.responseCode = status;
    if (!outcomeSent) {
      workers.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  // Bind to the error event so it doesn't get thrown
  req.on("error", function (e) {
    // Update the checkOutcome and pass the data along
    checkOutcome.error = { error: true, value: e };
    if (!outcomeSent) {
      workers.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  // Bind to the timeout event
  req.on("timeout", function () {
    // Update the checkOutcome and pass the data along
    checkOutcome.error = { error: true, value: "timeout" };
    if (!outcomeSent) {
      workers.processCheckOutcome(originalCheckData, checkOutcome);
      outcomeSent = true;
    }
  });

  // End the request
  req.end();
};

// Process the check outcome, update the check data as needed, trigger an alert if needed
// Special logic for accomodating a check that has never been tested before (don't alert on that one)
workers.processCheckOutcome = async function (originalCheckData, checkOutcome) {
  // Decide if the check is considered up or down
  const state =
    !checkOutcome.error &&
    checkOutcome.responseCode &&
    originalCheckData.successCodes.indexOf(checkOutcome.responseCode) > -1
      ? "up"
      : "down";

  // Decide if an alert is warranted
  const alertWarranted =
    originalCheckData.lastChecked && originalCheckData.state !== state
      ? true
      : false;

  // Log the outcome
  const timeOfCheck = Date.now();
  workers.log(
    originalCheckData,
    checkOutcome,
    state,
    alertWarranted,
    timeOfCheck
  );

  // Update the check data
  let newCheckData = originalCheckData;
  newCheckData.state = state;
  newCheckData.lastChecked = Date.now();

  // Save the updates
  try {
    await _db.update("checks", newCheckData.id, newCheckData);

    if (alertWarranted) {
      workers.alertUserToStatusChange(newCheckData);
    } else {
      helpers.log.debug(
        "workers",
        "Check outcome has not changed, no alert needed"
      );
    }
  } catch (error) {
    helpers.log.error(error);
  }
};

// Alert the user as to a change in their check status
workers.alertUserToStatusChange = async function (newCheckData) {
  const msg = `Alert: Your check for ${newCheckData.method.toUpperCase()} ${
    newCheckData.protocol
  }://${newCheckData.url} is currently ${newCheckData.state}`;

  try {
    await helpers.service.sendTwilioSms(newCheckData.userPhone, msg);

    helpers.log.debug(
      "workers",
      "Success: User was alerted to a status change in their check, via sms: ",
      msg
    );
  } catch (error) {
    helpers.log.debug(
      "workers",
      "Error: Could not send sms alert to user who had a state change in their check",
      err
    );
  }
};

// Send check data to a log file
workers.log = async function (
  originalCheckData,
  checkOutcome,
  state,
  alertWarranted,
  timeOfCheck
) {
  // Form the log data
  const logData = {
    check: originalCheckData,
    outcome: checkOutcome,
    state: state,
    alert: alertWarranted,
    time: timeOfCheck,
  };

  // Convert the data to a string
  const logString = JSON.stringify(logData);

  // Determine the name of the log file
  const logFileName = originalCheckData.id;

  // Append the log string to the file
  try {
    await helpers.logger.append(logFileName, logString);

    helpers.log.debug("workers", "Logging to file succeeded");
  } catch (error) {
    helpers.log.error("workers.log", error);
    helpers.log.debug("workers", "Logging to file failed");
  }
};

// Timer to execute the worker-process once per minute
workers.loop = function () {
  setInterval(function () {
    workers.gatherAllChecks();
  }, 1000 * 60);
};

// Rotate (compress) the log files
workers.rotateLogs = async function () {
  try {
    // List all the (non compressed) log files
    const logs = await helpers.logger.list();
    logs.forEach(async (logName) => {
      // Compress the data to a different file
      const logId = logName.replace(".log", "");
      const newFileId = logId + "-" + Date.now();

      await helpers.logger.compress(logId, newFileId);

      // Truncate the log
      await helpers.logger.truncate(logId);

      helpers.log.debug("workers", "Success truncating logfile");
    });
  } catch (error) {
    helpers.log.debug(
      "workers",
      "Error compressing one of the log files.",
      error
    );
  }
};

// Timer to execute the log-rotation process once per day
workers.logRotationLoop = function () {
  setInterval(function () {
    workers.rotateLogs();
  }, 1000 * 60 * 60 * 24);
};

// Init script
workers.init = function () {
  // Send to console, in yellow
  helpers.log.success("Background workers are running");

  // Execute all the checks immediately
  workers.gatherAllChecks();

  // Call the loop so the checks will execute later on
  workers.loop();

  // Compress all the logs immediately
  workers.rotateLogs();

  // Call the compression loop so checks will execute later on
  workers.logRotationLoop();
};

// Export the module
module.exports = workers;
