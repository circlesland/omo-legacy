import Observable from "zen-observable";
import { Dream } from "../../../schema/omo/dreams/dream";

export class Dreams {
  static readonly allFields =
    "_id name description safeAddress leap city creatorId price subscriptions {_id state creator{ _id name safeAddress odentityId} } creator{ _id odentityId}";

  /**
   * Gets all dreams and optionally filters for the dream-state
   */
  static all(leap?: number) {
    const sub = window.o.graphQL.subscribe(
      "Dreams{" + Dreams.allFields + "}"
    );

    return new Observable(s => {
      sub.subscribe(o => {
        if (o.error)
          throw new o.error;

        let allDreams = o.data.Dreams;
        if (leap) {
          allDreams = allDreams.filter(o => this.calcLevel(o.subscriptions.length).leap == leap);
        }
        s.next(allDreams);
      });
    });
  }


  static byId(id: string) {
    return window.o.graphQL.query(`DreamById(_id:"${id}"){${Dreams.allFields}}`);
  }

  static streamsByDreamId(dreamId: string) {
    //return window.o.graphQL.query(`DreamById(_id:"${id}"){${Dreams.allFields}}`);
  }

  static calcLevel(targetSum: number): {
    leap: number,
    level: number
  } {
    let sum = 0;
    let prev1 = 0;
    let prev2 = 1;
    let i = 1;
    while (sum <= targetSum) {
      let fib = prev1 + prev2;
      if (i == 1) {
        prev1 = 0;
        prev2 = 1;
      }
      else if (i == 2) {
        prev1 = 1;
        prev2 = 1;
      }
      else {
        prev1 = prev2;
        prev2 = fib;
      }
      sum += fib;
      i++;
    }

    return {
      leap: Math.ceil((i - 1) / 5),
      level: i - 1
    }
  }
}
