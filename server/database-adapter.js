const fs = require("fs");
const {logger} = require("./logging");
const JsonStream = require('JSONStream')

async function loadData(filePath) {
  logger.info("Loading data ...");

  const stream = fs.createReadStream(filePath)
      .pipe(JsonStream.parse("*"));

  return new Promise((accept, reject) => {
    const newDatasets = [];
    const newPublishers = {};
    const newDistributions = {};

    stream.on("data", function(dataset) {
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

    stream.on("end", function() {
      logger.info("Data ready.");
      accept({
        "datasets": newDatasets,
        "publishers": newPublishers,
        "distributions": newDistributions,
      });
    });

    stream.on("error", reject);

  });
}

module.exports = {
  "loadData": loadData,
};
