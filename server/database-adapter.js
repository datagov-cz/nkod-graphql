const fs = require("fs");
const {logger} = require("./logging");

function loadData(filePath) {
  logger.info("Loading data ...");
  const contentAsString = fs.readFileSync(filePath);
  logger.info("Converting to JSON ...");
  const content = JSON.parse(contentAsString);
  logger.info("Parsing data ...");
  const newDatasets = [];
  const newPublishers = {};
  const newDistributions = {};
  for (const dataset of content) {
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
  }
  logger.info("Data ready.");
  //
  return {
    "datasets": newDatasets,
    "publishers": newPublishers,
    "distributions": newDistributions,
  };
}

module.exports = {
  "loadData": loadData,
};
