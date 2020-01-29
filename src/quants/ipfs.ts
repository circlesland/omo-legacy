omo.quant(
  class Ipfs extends omo.quanta.Quant {
    public status: string;
    public agentVersion: string;
    public peerId: string;

    static get styles(): any[] {
      return [
        omo.normalize,
        omo.css``
      ];
    }

    constructor() {
      super();
      this.status = "connecting to IPFS";
      this.agentVersion = "";
      this.peerId = "";
    }

    public render(): any {
      return omo.html`
      <h1>${this.status}</h1>
      <h2>ID: ${this.peerId}</h2>
      <h2>Agent version: ${this.agentVersion}</h2>
      `;
    }

    static get model(): any {
      return {
        agentVersion: {
          type: "string"
        },
        peerId: {
          type: "string"
        },
        status: {
          type: "string"
        }
      };
    }

    static get properties() {
      return super.properties;
    }

    public async initAsync(): Promise<void> {
      console.log("init async ipfs");
      await super.initAsync();
      const result = await omo.ipfs.id();
      this.agentVersion = result.agentVersion;
      this.peerId = result.id;
      this.status = "Connected ;)"
    }
  }
);
