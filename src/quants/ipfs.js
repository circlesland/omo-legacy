export default class { }

omo.quant(
  class Ipfs extends omo.quanta.Quant {
    static get styles() {
      return [
        omo.normalize,
        omo.css``
      ];
    }

    render() {
      return omo.html`
      <h1>${this.status}</h1>
      <h2>ID: ${this.id}</h2>
      <h2>Agent version: ${this.agentVersion}</h2>
      `;
    }


    static get properties() {
      return {
        status: {
          type: "string"
        },
        id: {
          type: "array"
        },
        agentVersion: {
          type: "array"
        }
      };
    }

    constructor() {
      super();
      this.status = "connecting to IPFS"
      this.name = "IPFS"
    }
    async initAsync() {
      console.log("init async ipfs");
      await super.initAsync();
      let result = await omo.ipfs.id();
      this.agentVersion = result.agentVersion;
      this.id = result.id;
      this.status = "Connected ;)"
    }
  }
);
