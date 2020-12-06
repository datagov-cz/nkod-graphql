const graphql = require("graphql");
const database = require("./database");

const textType = new graphql.GraphQLObjectType({
  "name": "LanguageString",
  "fields": {
    "cs": {"type": graphql.GraphQLString},
    "en": {"type": graphql.GraphQLString}
  },
});

const publisherType = new graphql.GraphQLObjectType({
  "name": "Publisher",
  "fields": {
    "iri": {"type": graphql.GraphQLID},
    "title": {"type": textType},
  },
});

const temporalCoverageType = new graphql.GraphQLObjectType({
  "name": "TemporalCoverage",
  "fields": {
    "startDate": {"type": graphql.GraphQLString},
    "endDate": {"type": graphql.GraphQLString},
  },
});

const contactPointType = new graphql.GraphQLObjectType({
  "name": "ContactPoint",
  "fields": {
    "name": {"type": textType},
    "email": {"type": graphql.GraphQLString},
  },
});

const termsOfUse = new graphql.GraphQLObjectType({
  "name": "TermsOfUse",
  "fields": {
    "copyrighted_work": {"type": graphql.GraphQLString},
    "author": {"type": textType},
    "copyrighted_database": {"type": graphql.GraphQLString},
    "database_author": {"type": textType},
    "sui_generis_database_rights": {"type": graphql.GraphQLString},
    "personal_data": {"type": graphql.GraphQLString},
  },
});

const dataService = new graphql.GraphQLObjectType({
  "name": "DataService",
  "fields": {
    "iri": {"type": graphql.GraphQLID},
    "title": {"type": textType},
    "endpointURL": {"type": graphql.GraphQLString},
    "endpointDescription": {"type": graphql.GraphQLString},
  },
});

const distributionType = new graphql.GraphQLObjectType({
  "name": "Distribution",
  "fields": {
    "iri": {"type": graphql.GraphQLID},
    "termsOfUse": {"type": termsOfUse}, // podmínky_užití
    "accessURL": {"type": graphql.GraphQLString},
    "format": {"type": graphql.GraphQLString},
    "mediaType": {"type": graphql.GraphQLString},
    "conformsTo": {"type": graphql.GraphQLString},
    "compressFormat": {"type": graphql.GraphQLString},
    "packageFormat": {"type": graphql.GraphQLString},
    "title": {"type": textType},
    "accessService": {"type": dataService},
  },
});

const distributionFilter = new graphql.GraphQLInputObjectType({
  "name": "DistributionFilter",
  "fields": {
    "format": {"type": graphql.GraphQLString},
    "mediaType": {"type": graphql.GraphQLString},
    "conformsTo": {"type": graphql.GraphQLString},
    "compressFormat": {"type": graphql.GraphQLString},
    "packageFormat": {"type": graphql.GraphQLString},
    "hasAccessService": {"type": graphql.GraphQLBoolean},
  }
});

const datasetType = new graphql.GraphQLObjectType({
  "name": "Dataset",
  "fields": {
    "iri": {"type": graphql.GraphQLID},
    "title": {"type": textType},
    "description": {"type": textType},
    "publisher": {
      "type": publisherType,
      "resolve": (source) => {
        return database.selectPublisher(source);
      },
    },
    "theme": { // téma, koncept_euroVoc
      "type": graphql.GraphQLList(graphql.GraphQLString),
    },
    "accrualPeriodicity": {"type": graphql.GraphQLString},
    "keyword": {
      "type": graphql.GraphQLList(textType),
    },
    "spatial": { // geografické_území, prvek_rúian
      "type": graphql.GraphQLList(graphql.GraphQLString),
    },
    "temporal": {"type": temporalCoverageType},
    "contactPoint": {"type": contactPointType},
    "documentation": {"type": graphql.GraphQLString}, // foaf:page
    "conformsTo": {
      "type": graphql.GraphQLList(textType),
    },
    "spatialResolutionInMeters": {"type": graphql.GraphQLFloat},
    "temporalResolution": {"type": graphql.GraphQLString},
    "isPartOf": {"type": graphql.GraphQLString},
    "distribution": {
      "type": graphql.GraphQLList(distributionType),
      "args": {
        "filters": {"type": graphql.GraphQLList(distributionFilter)},
      },
      "resolve": (source, params) => {
        return database.selectDistributionsForDataset(source, params);
      },
    },
  }
});

const datasetFilter = new graphql.GraphQLInputObjectType({
  "name": "DatasetsFilter",
  "fields": {
    "theme": {"type": graphql.GraphQLList(graphql.GraphQLString)},
    "publisherIri": {"type": graphql.GraphQLString},
    "accrualPeriodicity": {"type": graphql.GraphQLString},
    "spatial": {"type": graphql.GraphQLList(graphql.GraphQLString)},
    "temporalStartDate": {"type": graphql.GraphQLString},
    "temporalEndDate": {"type": graphql.GraphQLString},
    "contactPointEmail": {"type": graphql.GraphQLString},
    "conformsTo": {"type": graphql.GraphQLList(graphql.GraphQLString)},
    "isPartOf": {"type": graphql.GraphQLString},
  }
});

const paginationType = new graphql.GraphQLObjectType({
  "name": "Pagination",
  "fields": {
    "totalCount": {"type": graphql.GraphQLInt},
  }
});

const datasetsContainerType = new graphql.GraphQLObjectType({
  "name": "DatasetContainer",
  "fields": {
    "data": {"type": graphql.GraphQLList(datasetType)},
    "pagination": {"type": paginationType},
  }
});

const queryType = new graphql.GraphQLObjectType({
  "name": "Query",
  "fields": {
    "dataset": {
      "type": datasetType,
      "args": {
        "iri": {"type": graphql.GraphQLID},
      },
      "resolve": (source, params) => {
        return database.selectDataset(params);
      },
    },
    "datasets": {
      "type": datasetsContainerType,
      "args": {
        "filters": {"type": graphql.GraphQLList(datasetFilter)},
        "offset": {"type": graphql.GraphQLInt},
        "limit": {"type": graphql.GraphQLInt},
      },
      "resolve": (source, params) => {
        return database.selectDatasets(params);
      },
    },
    "datasetsWithDistribution": {
      "type": datasetsContainerType,
      "args": {
        "filters": {"type": graphql.GraphQLList(distributionFilter)},
        "offset": {"type": graphql.GraphQLInt},
        "limit": {"type": graphql.GraphQLInt},
      },
      "resolve": (source, params) => {
        return database.selectDatasetsWithDistribution(params);
      },
    },
  }
});

module.exports = queryType;
