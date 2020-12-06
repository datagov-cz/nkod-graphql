const winston = require("winston");
const configuration = require("./configuration");

const logger = (function createLogger() {

  const logger = winston.createLogger({
    "level": configuration.logLevel,
    "format": winston.format.combine(
      winston.format.timestamp(),
      winston.format.json()
    ),
    "transports": [
      new winston.transports.Console,
    ],
  });

  // Do not exit after the uncaught exception.
  logger.exitOnError = false;

  return logger;
}());

function measureTime(name, callback) {
  return function () {
    const start = process.hrtime.bigint();
    const result = callback(...arguments);
    const end = process.hrtime.bigint();
    const durationInMillisecond = Math.floor(Number(end - start) / 1000000);
    logger.debug("measureTime", {
      "durationInMillisecond": durationInMillisecond,
      "method": name
    })
    return result;
  };
}

module.exports = {
  "logger": logger,
  "measureTime": measureTime,
}
