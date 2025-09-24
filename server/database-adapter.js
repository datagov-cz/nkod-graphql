const fs = require("fs");
const {logger} = require("./logging");
const JsonStream = require('JSONStream')

async function loadData(filePath) {
  logger.info("Loading data ...");

  return new Promise((accept, reject) => {
    const stream = fs.createReadStream(filePath);
    stream.on("error", reject);
    const jsonStream = read.pipe(JsonStream.parse("*"));
    jsonStream.on("error", reject);

    const newDatasets = [];
    const newPublishers = {};
    const newDistributions = {};

    jsonStream.on("data", (dataset) => {
      // Extract publisher.
      const publisher = dataset["publisher"];
      newPublishers[publisher["iri"]] = publisher;
      dataset["publisher"] = publisher["iri"];
      // Extract distributions.
      dataset["distribution"].forEach((distribution => {
        newDistributions[distribution["iri"]] = distribution;
      }));
      dataset["distribution"] = dataset["distribution"]
          .map(distribution => distribution["iri"]);
      newDatasets.push(dataset);
    });

    jsonStream.on("end", ()  => {
      logger.info("Data ready.", {datasets: newDatasets.length});
      accept({
        "datasets": newDatasets,
        "publishers": newPublishers,
        "distributions": newDistributions,
      });
    });

  });
}

module.exports = {
  "loadData": loadData,
};
