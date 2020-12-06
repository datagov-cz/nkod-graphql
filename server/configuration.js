module.exports = {
  "port": process.env.NKOD_GRAPHQL_PORT || 8032,
  "nkodFile": process.env.NKOD_GRAPHQL_FILE || "./data/data.json",
  "queryLimit": process.env.NKOD_GRAPHQL_QUERY_LIMIT || 10000,
  "logLevel": process.env.NKOD_GRAPHQL_LOG_LEVEL || "debug",
  "reloadToken":  process.env.NKOD_GRAPHQL_TOKEN || "change-me",
};