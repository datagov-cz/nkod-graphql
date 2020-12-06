const {parentPort} = require("worker_threads");
const {logger} = require("./logging");
const {loadData} = require("./database-adapter");
const configuration = require("./configuration");

/**
 * Implements database reload functionality.
 */
(function work() {
  let database;
  try {
    database = loadData(configuration.nkodFile);
  } catch (error) {
    logger.error("Can't load database for first time.", {"error": error.stack});
    // We still want the server to start and for example wait for reload.
  }
  parentPort.postMessage({"data": database})
})();
