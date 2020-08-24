import {
  MutationResolvers,
  QueryResolvers,
  SubscriptionResolvers
} from "../generated/graphql";
import {ConnectionContext} from "./connectionContext";

export class ApolloResolvers
{
  readonly subscriptionResolvers: SubscriptionResolvers;
  readonly queryResolvers: QueryResolvers;
  readonly mutationResolvers: MutationResolvers;

  constructor()
  {
    this.mutationResolvers = {
    };

    this.subscriptionResolvers = {
    };

    this.queryResolvers = {
    }
  }
}