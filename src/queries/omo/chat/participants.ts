import Observable from "zen-observable";

export class Participants {
  static onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
  }

  static participants(roomId: string) {
    return new Observable<any>(o => {
      window.o.graphQL.subscribe(`Messages{name Chatroom{_id}}`)
        .subscribe(messages => {
          const msg = messages.data.Messages
            .filter(o => o.Chatroom._id == roomId)
            .map(x => x.name)
            .filter(this.onlyUnique);
          o.next(msg);
        })
    });
  }
}
