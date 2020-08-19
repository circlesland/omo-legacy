import Observable from "zen-observable";

export class Omosapiens
{
  static subscribeAll()
  {
    const sub = window.o.graphQL.subscribe("Omosapiens{_id,name,safeAddress,odentityId}");

    return new Observable(s =>
    {
      sub.subscribe(o =>
      {
        s.next(o.data.Omosapiens);
      });
    });
  }

  static subscribeBySafeAddress(safeAddress:string)
  {
    const sub = window.o.graphQL.subscribe("Omosapiens{_id,name,safeAddress,odentityId}");

    return new Observable(s =>
    {
      sub.subscribe(o =>
      {
        if (o.error)
          throw new o.error;
        console.log("Omosapien query result: ", o);
        s.next(o.data.Omosapiens.filter(p => p.safeAddress == safeAddress));
      });
    });
  }

  static async bySafeAddress(safeAddress:string) {
    const omosapiens = await window.o.graphQL.query("Omosapiens{_id name safeAddress odentityId}");
    if (!omosapiens.data){
      throw new Error("Couldn't query the list of Omosapiens");
    }
    const filteredOmosapien = omosapiens.data.Omosapiens.filter(p => (!p.safeAddress ? "" : p.safeAddress).toLowerCase() == safeAddress.toLowerCase());
    return filteredOmosapien && filteredOmosapien.length == 1 ? filteredOmosapien[0] : null;
  }

  static async byOdentityId(odentityId:string) {
    const omosapiens = await window.o.graphQL.query("Omosapiens{_id name safeAddress odentityId}");
    if (!omosapiens.data){
      throw new Error("Couldn't query the list of Omosapiens");
    }
    const filteredOmosapien = omosapiens.data.Omosapiens.filter(p => (!p.odentityId ? "" : p.odentityId).toLowerCase() == odentityId.toLowerCase());
    if (filteredOmosapien.length > 1)
    {
      console.warn("There is more than one Omosapien for odentity '" + odentityId + "'");
    }
    return filteredOmosapien && filteredOmosapien.length >= 1 ? filteredOmosapien[filteredOmosapien.length -1] : null;
  }

  static async byId(omosapienId:string) {
    const omosapiens = await window.o.graphQL.query("OmosapienById(_id:\"" + omosapienId + "\") {_id name safeAddress odentityId}");
    if (!omosapiens.data){
      throw new Error("Couldn't query the list of Omosapiens");
    }
    return omosapiens.data.OmosapienById;
  }
}
