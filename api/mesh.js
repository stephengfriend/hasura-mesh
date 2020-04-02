// These are required to get the now cli to bundle them
import "@graphql-mesh/graphql"
import "@graphql-mesh/openapi"

import { getMesh, processConfig } from "@graphql-mesh/runtime";
import { ApolloServer } from "apollo-server-micro";

// In a production environment we would want to secure this endpoint
export default async (req, res) => {

  // Literal config object replaces .meshrc.yaml for serverless
  const parsedConfig = await processConfig({
    "sources": [
      {
        "name": "Weather",
        "handler": {
          "openapi": {
            "source": "https://api.apis.guru/v2/specs/weatherbit.io/2.0.0/swagger.json"
          }
        }
      },
      {
        "name": "Location",
        "handler": {
          "graphql": {
            "endpoint": "https://api.everbase.co/graphql"
          }
        }
      }
    ]
  });

  const { schema, contextBuilder: context } = await getMesh(parsedConfig);

  return new ApolloServer({
    schema,
    context,
    introspection: true, // Required for Hasura Remote Schema introspection
    playground: true, // Optional: Default is `false` in production
  }).createHandler({ path: "/api/mesh" })(req, res);
};

export const config = {
  api: {
    bodyParser: false
  }
};
