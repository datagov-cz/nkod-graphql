FROM node:24.8.0-slim

WORKDIR /opt/nkod-graphql

# First install dependencies to keep them in a cache
COPY package*.json ./
RUN npm ci --only=production

# Now copy all the rest.
COPY . .

# We do not need to use root.
USER 1000

#
ENV NKOD_GRAPHQL_PORT=${NKOD_GRAPHQL_PORT-8080}
ENV NKOD_GRAPHQL_FILE=${NKOD_GRAPHQL_FILE-data/data.json}
ENV NKOD_GRAPHQL_QUERY_LIMIT=${NKOD_GRAPHQL_QUERY_LIMIT-100000}
ENV NKOD_GRAPHQL_LOG_LEVEL=${NKOD_GRAPHQL_LOG_LEVEL-info}
ENV NKOD_GRAPHQL_TOKEN=${NKOD_GRAPHQL_TOKEN}

EXPOSE ${NKOD_GRAPHQL_PORT-8080}

# Run the server.
CMD [ "node", "--max-old-space-size=4096", "server/server.js" ]
