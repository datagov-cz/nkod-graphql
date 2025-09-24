const express = require("express");
const {graphqlHTTP} = require("express-graphql");
const graphql = require("graphql");
const schemaDefinition = require("./schema");
const {logger} = require("./logging");
const configuration = require("./configuration");
const {loadData} = require("./database-adapter");
const {setDatabaseData} = require("./database");
const reload = require("./reload");

// We allow only one reload at a time.
let reloadInProgress = false;

(async function initializeServer() {
  const app = express();
  addGraphQlApi(app);
  addMaintenanceApi(app);
  await initializeDatabase()
  startServer(app);
})();

function addGraphQlApi(app) {
  const schema = new graphql.GraphQLSchema({
    "query": schemaDefinition
  });
  app.use("/graphql", graphqlHTTP({
    "schema": schema,
    "graphiql": true
  }));
}

function addMaintenanceApi(app) {
  const router = express.Router();
  if (configuration.reloadToken !== undefined
    && configuration.reloadToken !== "") {
    router.get("/reload", onReload);
  } else {
    logger.info("Reload disabled.")
  }
  app.use("/api", router);
}

async function onReload(req, res) {
  if (req.query.token !== configuration.reloadToken) {
    res.status(401);
    res.send("");
    return;
  }
  if (reloadInProgress) {
    res.status(503);
  } else {
    reloadInProgress = true;
    try {
      await reload();
      res.status(200);
    } catch (error) {
      res.status(500);
    }
    reloadInProgress = false;
  }
  res.send("");
}

async function initializeDatabase() {
  try {
    const database = await loadData(configuration.nkodFile);
    setDatabaseData(database);
  } catch (error) {
    logger.warning("Can't load database for first time. Starting with no data.",
      {"error": error.stack});
  }
}

function startServer(app) {
  app.listen(configuration.port, () => {
    logger.info("Server is now running.", {"port": configuration.port});
  });
}
