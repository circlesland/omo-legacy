export class Omosapiens
{
  static async deleteOmosapien(id)
  {
    return await window.o.graphQL.mutation(`deleteOmosapien(_id:"${id}") {name}`);
  }

  static async createNewOmosapien(name: string, safeAddress: string, odentityId: string)
  {
    console.log(`createNewOmosapien(name: ${name}, safeAddress:  ${safeAddress}, odentityId:  ${odentityId})`)
    const newOmosapien = (await window.o.graphQL.mutation(
      `addOmosapien(name:"${name}" safeAddress:"${safeAddress}" odentityId:"${odentityId}") {_id name safeAddress odentityId}`
    ));
    return !newOmosapien.data ? null : newOmosapien.data.addOmosapien;
  }
}
