module.exports = {
  security: {
    hashingSecret: "test-secret",
  },
  maxChecks: 5,
  http: {
    port: 3000,
  },
  https: {
    port: 3001,
  },
  credentials: {
    twilio: {
      accountSid: "ACb32d411ad7fe886aac54c665d25e5c5d",
      authToken: "9455e3eb3109edc12e3d8c92768f7a67",
      fromPhone: "+15005550006",
    },
  },
};
