export class Messages {
  static async sendMessage(chatroomId: string, text: string) {
    if (!window.o.odentity.current)
      throw new Error("No current odentity.");

    const currentIdentity = window.o.odentity.current._id;

    const newMessage = await window.o.graphQL.mutation(
      `addMessage(name: "${currentIdentity}",text: "${text}", date: "${Date.now() / 1000}", chatroomId: "${chatroomId}"){_id}`
    );
    const id = !newMessage.data ? null : newMessage.data.addMessage._id;
    return id;
  }
}
