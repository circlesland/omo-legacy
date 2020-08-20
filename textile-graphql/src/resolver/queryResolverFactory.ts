import {SyncedCollection} from "../textile/syncedCollection";
import { Instance } from "@textile/threads-store";

export async function createQueryResolver<T extends Instance>(collection:SyncedCollection<T>) : Promise<(context:any, data:any) => Promise<T[]>> {
  return async function(context:any, data:any) {
    const returnValue:T[] = [];
    console.log("Deine mudda oida! Hier, hast n leeres Array ;)", returnValue);
    return returnValue;
  }
}