import Observable from "zen-observable";

export class Rooms
{
  static rooms()
  {
    return new Observable<any>(o => {
      window.o.graphQL.subscribe("ChatRooms{_id,name,dreamId}").subscribe(rooms => {
        const publicRooms = rooms.data.ChatRooms.filter(o => !o.dreamId)
        console.log("Stand-alone chat rooms: ", publicRooms);
        o.next(publicRooms);
      })
    });
  }
}
