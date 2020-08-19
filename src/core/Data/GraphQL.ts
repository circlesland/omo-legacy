import {
  GraphQLSchema,
  printSchema,
  graphql,
  subscribe,
  parse,
  ExecutionResult,
  GraphQLString,
  GraphQLObjectType,
  Thunk,
  GraphQLBoolean
} from "graphql";
import { Quant } from "./Entities/Quant";
import { QuantRegistry } from "../Quant/QuantRegistry";
import { ModelHelper } from "./ModelHelper";
import { makeExecutableSchema } from '@graphql-tools/schema';
import { SyncedThread } from "../Textile/SyncedThread";
import { JSONSchema } from "@textile/hub";
import Observable from "zen-observable";
import { StopWatch } from "../StopWatch";

export class GraphQL {
  // private quanta: Quant[];
  // private thread: SyncedThread;
  private graphQLSchema: GraphQLSchema;
  modelHelper: ModelHelper;
  registry: QuantRegistry;

  private constructor(registry: QuantRegistry, schema: GraphQLSchema) {
    // this.quanta = quanta;
    // this.thread = thread;
    this.graphQLSchema = schema;
    this.modelHelper = registry.modelHelper;
    this.registry = registry;
  }

  static async init(registry: QuantRegistry): Promise<GraphQL> {
    StopWatch.start("threads");
    var quanta = registry.modelHelper.quanta;
    StopWatch.stop("threads");

    StopWatch.start("schema");
    var schema = await this.updateGraphQLSchema(quanta, registry);
    StopWatch.stop("schema");

    StopWatch.start("graphql");
    var graphql = new GraphQL(registry, schema);
    StopWatch.stop("graphql");

    // await quantum.subscribeChanges(ModelQuant.pubsub, quant);
    // graphql.subscribeQuantaUpdate(quantum);
    return graphql;
  }

  //     // private async subscribeQuantaUpdate(quantum: Quantum) {
  //     //     await quantum.subscribe(async quantArray => {
  //     //         this.quanta = quantArray;
  //     //         this.updateGraphQLSchema();
  //     //         await quantum.subscribeChanges(ModelQuant.pubsub, this.quanta);
  //     //     })
  //     // }

  getSchema(): GraphQLSchema {
    return this.graphQLSchema;
  }

  printSchema(): string {
    return printSchema(this.graphQLSchema);
  }

  async execute(query) {
    const result = await graphql(this.getSchema(), query);

    if (result.errors) {
      console.error("An error occurred while executing '" + query + "':");
      throw result.errors;
    }

    return result;
  }

  /**
   * @param query example await o.graphql.query('Books {_id name}')
   */
  async query(query) {
    const result = await graphql(this.getSchema(), `query { ${query}}`);

    if (result.errors) {
      console.error("An error occurred while executing '" + query + "':");
      throw result.errors;
    }

    return result;
  }

  /**
   *
   * @param query example await o.graphql.mutation('addBook(name:"testbuch"){_id name}')
   */
  async mutation(query)
  {
    const result = await graphql(this.getSchema(), `mutation { ${query} }`);
    if (result.errors) {
      console.error("An error occurred while executing '" + query + "':");
      throw result.errors;
    }

    return result;
  }

  private static async updateGraphQLSchema(quanta: Quant[], registry: QuantRegistry): Promise<GraphQLSchema> {
    StopWatch.start("modelHelper");
    let modelHelper = registry.modelHelper;
    StopWatch.stop("modelHelper");

    StopWatch.start("typeDefs");
    var typeDefs: any = modelHelper.getGraphQLTypeDefs();
    StopWatch.stop("typeDefs");

    StopWatch.start("resolvers");
    var resolvers: any = await modelHelper.getGraphQLResolvers(registry);
    StopWatch.stop("resolvers");
    return makeExecutableSchema({ typeDefs, resolvers });
  }

  async* concat(initialValue: any, iterable: AsyncIterableIterator<any>) {
    yield initialValue;
    for await (let element of iterable) {
      yield element;
    }
  }

  subscribe(query:string): Observable<any> {
    return new Observable(observer => {
      this.query(query).then(queryResult => {
        observer.next(queryResult);

        this.getSubscription(`subscription { ${query}}`).then(
          subscription => {
            (async () => {
              for await (let value of subscription) {
                observer.next(value);
              }
            })();
          }
        );
      });
    });
  }

  private async getSubscription(query) {
    return (await subscribe({
      schema: this.getSchema(),
      document: parse(query),
      rootValue: "data",
    })) as AsyncIterableIterator<ExecutionResult>;
  }
}
