import { Dreams as DreamsQueries } from "../../../queries/omo/dreams/dreams";
import { Omosapiens } from "../../../queries/omo/odentity/omosapiens";

export class Dreams {
  static async deleteDream(id) {
    return await window.o.graphQL.mutation(`deleteDream(_id:"${id}") {name}`);
  }

  static async createNewDream(
    name: string,
    description: string,
    cityName: string,
    safeAddress: string
  ) {
    if (!window.o.odentity.current)
      throw new Error("No current odentity");

    const omosapien = await Omosapiens.byOdentityId(window.o.odentity.current._id);
    console.log("createNewDream mutation: omosapien:", omosapien);

    const newDream = await window.o.graphQL.mutation(
      `addDream(name:"${name}" description:"${description}" city:"${cityName}" safeAddress:"${safeAddress}" leap: "1", creatorId: "${omosapien._id}") { _id name leap description safeAddress creatorId }`
    );
    return !newDream.data ? null : newDream.data.addDream;
  }

  static startCampaign(id: string, videoHash: string, price: string) {
    return window.o.graphQL.mutation(`updateDream(_id:"${id}",videoHash:"${videoHash}", price:"${price}"){_id}`);
  }
  static async newCommitment(dreamId: string, omosapienId: string) {
    if (!dreamId || dreamId == "")
      throw new Error("No dreamId was supplied");

    const newSubscription = await window.o.graphQL.mutation(`addStream(state: "commitment", creatorId: "${omosapienId}", dreamId: "${dreamId}") {_id}`);
    if (!newSubscription.data) {
      throw new Error("Couldn't create a new commitment.");
    }
    return newSubscription.data.addStream._id;
  }

  static async newReservation(dreamId: string, omosapienId: string) {
    if (!dreamId || dreamId == "")
      throw new Error("No dreamId was supplied");

    const newSubscription = await window.o.graphQL.mutation(`addStream(state: "reservation", creatorId: "${omosapienId}", dreamId: "${dreamId}") {_id}`);
    if (!newSubscription.data) {
      throw new Error("Couldn't create a new reservation.");
    }
    return newSubscription.data.addStream._id;
  }

  static async newSubscription(dreamId: string, omosapienId: string) {
    if (!dreamId || dreamId == "")
      throw new Error("No dreamId was supplied");

    const newSubscription = await window.o.graphQL.mutation(`addStream(state: "subscription", creatorId: "${omosapienId}", dreamId: "${dreamId}") {_id}`);
    if (!newSubscription.data) {
      throw new Error("Couldn't create a new subscription.");
    }
    return newSubscription.data.addStream._id;
  }
}
