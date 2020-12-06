const {measureTime} = require("./logging");
const {logger} = require("./logging");
const configuration = require("./configuration");

let DATABASE = {
  "datasets": [],
  "publishers": {},
  "distributions": {},
};

function setDatabaseData(data) {
  DATABASE = data;
  //
  logger.error("New database data.", {
    "datasetCount": DATABASE.datasets.length,
    "publisherCount": DATABASE.publishers.length,
    "distributionCount": DATABASE.distributions.length,
  });
}

function selectDataset(params) {
  for (const dataset of DATABASE.datasets) {
    if (dataset.iri === params.iri) {
      return dataset;
    }
  }
  return undefined;
}

function selectDatasets(params) {
  const filters = constructFilters(params, createDatasetFilter);
  const result = [];
  for (const dataset of DATABASE.datasets) {
    if (anyOfIsTrue(filters, dataset)) {
      result.push(dataset);
    }
  }
  return withPagination(params, result);
}

function constructFilters(params, factoryFunction) {
  if (params.filters === undefined) {
    return [acceptAll];
  }
  const result = [];
  for (const filter of params.filters) {
    result.push(factoryFunction(filter));
  }
  return result;
}

function acceptAll() {
  return true;
}

function anyOfIsTrue(callbacks, params) {
  for (const callback of callbacks) {
    if (callback(params)) {
      return true;
    }
  }
  return false;
}

function createDatasetFilter(params) {
  const filters = [];
  if (params.theme !== undefined) {
    filters.push((dataset) => isSubArray(dataset.theme, params.theme));
  }
  if (params.publisherIri !== undefined) {
    filters.push((dataset) => dataset.publisher === params.publisherIri);
  }
  if (params.accrualPeriodicity !== undefined) {
    filters.push((dataset) =>
      dataset.accrualPeriodicity === params.accrualPeriodicity);
  }
  if (params.spatial !== undefined) {
    filters.push((dataset) => isSubArray(dataset.spatial, params.spatial));
  }
  if (params.temporalStartDate !== undefined) {
    filters.push((dataset) =>
      dataset.temporal
      && dataset.temporal.startDate === params.temporalStartDate);
  }
  if (params.temporalEndDate !== undefined) {
    filters.push((dataset) =>
      dataset.temporal
      && dataset.temporal.endDate === params.temporalEndDate);
  }
  if (params.contactPointEmail !== undefined) {
    filters.push((dataset) =>
      dataset.accrualPeriodicity === params.accrualPeriodicity);
  }
  if (params.conformsTo !== undefined) {
    filters.push((dataset) =>
      isSubArray(dataset.conformsTo, params.conformsTo));
  }
  if (params.isPartOf !== undefined) {
    filters.push((dataset) => dataset.isPartOf === params.isPartOf);
  }
  return (dataset) => allOfAreTrue(filters, dataset);
}

function isSubArray(array, subArray) {
  if (array === undefined) {
    return false;
  }
  for (const item of subArray) {
    if (!array.includes(item)) {
      return false
    }
  }
  return true;
}

function allOfAreTrue(callbacks, params) {
  for (const callback of callbacks) {
    if (!callback(params)) {
      return false;
    }
  }
  return true;
}

function withPagination(params, items) {
  const limit = Math.min(
    getOrDefault(params, "limit", 10),
    configuration.queryLimit);
  const offset = Math.max(
    getOrDefault(params, "offset", 0),
    0);
  return {
    "data": items.slice(offset, offset + limit),
    "pagination": {
      "totalCount": items.length,
    }
  }
}

function getOrDefault(params, key, defaultValue) {
  if (params[key] === undefined) {
    return defaultValue;
  }
  return params[key];
}

function selectDistributionsForDataset(dataset, params) {
  const filters = constructFilters(params, createDistributionFilter);
  const result = [];
  for (const iri of dataset.distribution) {
    const distribution = DATABASE.distributions[iri];
    for (const filter of filters) {
      if (filter(distribution)) {
        result.push(distribution);
        break;
      }
    }
  }
  return result;
}

function createDistributionFilter(params) {
  const filters = [];
  if (params.format !== undefined) {
    filters.push((distribution) =>
      distribution.format === params.format);
  }
  if (params.mediaType !== undefined) {
    filters.push((distribution) =>
      distribution.mediaType === params.mediaType);
  }
  if (params.conformsTo !== undefined) {
    filters.push((distribution) =>
      distribution.conformsTo === params.conformsTo);
  }
  if (params.compressFormat !== undefined) {
    filters.push((distribution) =>
      distribution.compressFormat === params.compressFormat);
  }
  if (params.packageFormat !== undefined) {
    filters.push((distribution) =>
      distribution.packageFormat === params.packageFormat);
  }
  if (params.hasAccessService !== undefined) {
    filters.push((distribution) => {
      if (params.hasAccessService) {
        return distribution.accessService !== undefined;
      } else {
        return distribution.accessService === undefined;
      }
    });
  }
  return (params) => allOfAreTrue(filters, params);
}

function selectPublisher(dataset) {
  return DATABASE.publishers[dataset.publisher];
}

function selectDatasetsWithDistribution(params) {
  const filters = constructFilters(params, createDistributionFilter);
  const distributions = new Set();
  for (const distribution of Object.values(DATABASE.distributions)) {
    if (anyOfIsTrue(filters, distribution)) {
      distributions.add(distribution.iri);
    }
  }
  const result = [];
  for (const dataset of DATABASE.datasets) {
    for (const iri of dataset.distribution) {
      if (distributions.has(iri)) {
        result.push(dataset);
        break;
      }
    }
  }
  return withPagination(params, result);
}

module.exports = {
  "setDatabaseData": setDatabaseData,
  "selectDataset": selectDataset,
  "selectDatasets": measureTime("datasets", selectDatasets),
  "selectDistributionsForDataset": selectDistributionsForDataset,
  "selectPublisher": selectPublisher,
  "selectDatasetsWithDistribution": measureTime(
    "datasetsWithDistribution", selectDatasetsWithDistribution),
};
