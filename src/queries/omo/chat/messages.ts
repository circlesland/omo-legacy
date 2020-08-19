import Observable from 'zen-observable';

export class Messages {
  static sub: Observable<any> | null = null;

  static messagesByRoom(roomId: string) {
    if (this.sub == null)
      this.sub = window.o.graphQL.subscribe(
        "Messages{_id, text, name, date, ChatRoom{_id}}"
      );

    const rId = roomId;
    return new Observable(s => {
      const oida = rId;
      if (this.sub)
        this.sub.subscribe(o => {
          if (o.error)
            throw new o.error;
          const filteredForRoom = o.data.Messages.filter(p => !p.ChatRoom ? false : p.ChatRoom._id == oida);
          console.log("Messages received", filteredForRoom);

          s.next(filteredForRoom);
        });
    });
  }
}
