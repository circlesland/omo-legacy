import {
  GraphQLSchema,
  printSchema,
  graphql,
  subscribe,
  parse,
  ExecutionResult
} from "graphql";
import { Quant } from "./quant";
import { QuantRegistry } from "../quant/quantRegistry";
import { ModelHelper } from "./modelHelper";
import { makeExecutableSchema } from '@graphql-tools/schema';
import Observable from "zen-observable";
import { StopWatch } from "../stopWatch";

export class GraphQL {
  private graphQLSchema: GraphQLSchema;
  modelHelper: ModelHelper;
  registry: QuantRegistry;

  private constructor(registry: QuantRegistry, schema: GraphQLSchema) {
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

    return graphql;
  }

  getSchema(): GraphQLSchema {
    return this.graphQLSchema;
  }

  printSchema(): string {
    return printSchema(this.graphQLSchema);
  }

  async execute(query:string) {
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
  async query(query:string) {
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
  async mutation(query:string)
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

  private async getSubscription(query:string) {
    return (await subscribe({
      schema: this.getSchema(),
      document: parse(query),
      rootValue: "data",
    })) as AsyncIterableIterator<ExecutionResult>;
  }
}
