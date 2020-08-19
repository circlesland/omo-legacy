import { Quant } from "./Entities/Quant";
import { ModelQuant } from "./ModelQuant";
import { SyncedThread } from "../Textile/SyncedThread";
import { QuantRegistry } from "../Quant/QuantRegistry";

export class ModelHelper {
  async getGraphQLResolvers(quantRegistry: QuantRegistry): Promise<any> {
    var query: any = {};
    var subscription: any = {};
    var mutation: any = {};
    var typeResolvers: any = {};

    for (let modelQuant of this.modelQuanta) {
      await modelQuant.addQueryResolver(query, quantRegistry);
      await modelQuant.addMutationResolver(mutation, quantRegistry);
      await modelQuant.addSubscriptionResolver(subscription, quantRegistry);
      await modelQuant.addTypeResolver(typeResolvers, quantRegistry);
    }

    var resolvers = {
      Query: query,
      Subscription: subscription,
      Mutation: mutation
    }

    for (let key of Object.keys(typeResolvers)) {
      resolvers[key] = typeResolvers[key];
    }
    return resolvers;
  }

  modelQuanta: ModelQuant[];
  quanta: Quant[];

  constructor(quanta: Quant[]) {
    this.modelQuanta = [];
    for (let quant of quanta) {
      this.modelQuanta.push(ModelQuant.byQuant(quant));
    }

    for (let modelQuant of this.modelQuanta) {
      modelQuant.UpdateRelations(this.modelQuanta);
    }

    this.quanta = quanta.map(
      x => {
        var schema = (this.modelQuanta.find(m => m.collectionName == x.collectionName) as ModelQuant).toJsonSchema();
        x.jsonSchema = JSON.stringify(schema);
        return x;
      });
  }

  getGraphQLTypeDefs() {
    var typedef = "";
    var query = "";
    var mutation = "";
    var subscription = "";

    for (let modelQuant of this.modelQuanta) {
      typedef += modelQuant.toGraphQlTypeDefs();
      query += modelQuant.getGraphQlQuery();
      mutation += modelQuant.getGraphQlMutation();
      subscription += modelQuant.getGraphQlSubscription();
    }
    return `
        ${typedef}
        type Query {
            ${query}
        }
        type Mutation {
            ${mutation}
        }
        type Subscription {
            ${subscription}
        }`;
  }
}
