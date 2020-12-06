const {Worker} = require("worker_threads");
const {logger} = require("./logging");
const path = require("path");
const {setDatabaseData} = require("./database");

/**
 * Implements database reload functionality.
 */
function reload() {
  const scriptPath = path.join(__dirname, "reload-worker.js");
  const worker = new Worker(scriptPath);
  return new Promise((accept, reject) => {
    worker.on("message", (message) => {
      setDatabaseData(message.data);
    });
    worker.on("error", (error) => {
      logger.error("Reload failed.", {"error": error.stack});
      reject();
    });
    worker.on("exit", (code) => {
      if (code === 0) {
        logger.error("Reload finished.");
        accept();
      } else {
        logger.error("Reload failed.", {"code": code});
        reject();
      }
    });
  });
}

module.exports = reload;
