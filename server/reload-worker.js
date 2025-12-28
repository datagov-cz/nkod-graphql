const {parentPort} = require("worker_threads");
const {logger} = require("./logging");
const {loadData} = require("./database-adapter");
const configuration = require("./configuration");

/**
 * Implements database reload functionality.
 */
(async function work() {
  try {
    const database = await loadData(configuration.nkodFile);
    // We set the state only on success.
    parentPort.postMessage({"data": database})
  } catch (error) {
    logger.error("Can't load database.", {"error": error.stack});
    // We still want the server to start and for example wait for reload.
  }
})();
