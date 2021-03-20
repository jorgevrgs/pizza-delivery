/**
 * @module helpers.service
 */

const https = require("https");

let services = {};

services.sendTwilioSms = function (phone, msg) {
  return new Promise((resolve, reject) => {
    // Validate parameters
    phone =
      typeof phone == "string" && phone.trim().length == 10
        ? phone.trim()
        : false;

    msg =
      typeof msg == "string" &&
      msg.trim().length > 0 &&
      msg.trim().length <= 1600
        ? msg.trim()
        : false;

    if (phone && msg) {
      // Configure the request payload
      const payload = {
        From: config.credentials.twilio.fromPhone,
        To: "+1" + phone,
        Body: msg,
      };
      const stringPayload = querystring.stringify(payload);

      // Configure the request details
      const requestDetails = {
        protocol: "https:",
        hostname: "api.twilio.com",
        method: "POST",
        path:
          "/2010-04-01/Accounts/" +
          config.credentials.twilio.accountSid +
          "/Messages.json",
        auth: `${config.credentials.twilio.accountSid}:${config.credentials.twilio.authToken}`,
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Content-Length": Buffer.byteLength(stringPayload),
        },
      };

      // Instantiate the request object
      const req = https.request(requestDetails, function (res) {
        // Grab the status of the sent request
        const status = res.statusCode;
        // Callback successfully if the request went through
        if (status == 200 || status == 201) {
          resolve(true);
        } else {
          reject("Status code returned was " + status);
        }
      });

      // Bind to the error event so it doesn't get thrown
      req.on("error", function (e) {
        reject(e);
      });

      // Add the payload
      req.write(stringPayload);

      // End the request
      req.end();
    } else {
      reject("Given parameters were missing or invalid");
    }
  });
};

module.exports = services;
