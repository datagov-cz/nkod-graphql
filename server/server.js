const express = require("express");
const { graphqlHTTP } = require("express-graphql");
const graphql = require("graphql");
const schemaDefinition = require("./schema");
const { logger } = require("./logging");
const configuration = require("./configuration");
const { loadData } = require("./database-adapter");
const { setDatabaseData } = require("./database");
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
  if (configuration.reloadToken === "") {
    logger.warn("Reload disabled as there is no reload token.");
  } else {
    router.get("/reload", onReload);
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
    res.send({
      "message": "Reload in progress",
    });
  } else {
    reloadInProgress = true;
    try {
      await reload();
      res.status(200);
      res.send({});
    } catch (error) {
      res.status(500);
      res.send({
        "message": "Reload has failed."
      });
      logger.error("Reload has failed.", { error });
    }
    reloadInProgress = false;
  }
}

async function initializeDatabase() {
  const file = configuration.nkodFile;
  try {
    const database = await loadData(file);
    setDatabaseData(database);
  } catch (error) {
    logger.warn("Can't load data on startup.", { file, error: error.message });
  }
}

function startServer(app) {
  const server = app.listen(configuration.port, () => {
    logger.info("Server is now running.", {
      host: server.address().address,
      port: configuration.port,
    });
  });
}
