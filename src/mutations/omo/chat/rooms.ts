export class Rooms
{
  static async createNewRoom(name: string, dreamId?:string)
  {
    let newRoom:any;
    if (dreamId)
    {
      newRoom = (await window.o.graphQL.mutation(
        `addChatRoom(name:"${name}" dreamId: "${dreamId}") {_id name dreamId}`
      ));
    } else {
      newRoom = (await window.o.graphQL.mutation(
        `addChatRoom(name:"${name}") {_id name}`
      ));
    }
    return !newRoom.data ? null : newRoom.data.addChatRoom;
  }

  static async deleteRoom(id)
  {
    return await window.o.graphQL.mutation(`deleteChatRoom(_id:"${id}") {name}`);
  }
}
