import {ApolloServer} from "apollo-server";
import {ApolloResolvers} from "./api/apolloResolvers";
import {ConnectionContext} from "./api/connectionContext";

const {importSchema} = require('graphql-import')

export class Main
{
  private readonly _apolloServer: ApolloServer;
  private readonly _apolloResolvers: ApolloResolvers;

  constructor()
  {
    this._apolloResolvers = new ApolloResolvers();

    const apiSchemaPath = 'src/api/api-schema.graphql'; // TODO: Put in config
    const apiSchemaTypeDefs = importSchema(apiSchemaPath);

    this._apolloServer = new ApolloServer({
      context: ConnectionContext.create,
      typeDefs: apiSchemaTypeDefs,
      resolvers: {
        Mutation: this._apolloResolvers.mutationResolvers,
        Subscription: this._apolloResolvers.subscriptionResolvers,
        Query: this._apolloResolvers.queryResolvers
      }
    });
  }

  async run()
  {
    await this._apolloServer.listen();
  }
}

new Main()
  .run()
  .then(() => "Running");