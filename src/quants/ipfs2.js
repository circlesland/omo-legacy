omo.quant(
  class IpfsTwo extends omo.quanta.Quant {

    get styles() {
      return [
        omo.normalize,
        omo.css`
        :host{
          background:green;
        }`
      ];
    }

    render() {
      return this.dataTable();
    }

    static get model() {
      return {
        name: {
          type: "string"
        },
        lastname: {
          type: "string"
        },
        street: {
          type: "string"
        },
        age: {
          type: "number"
        },
        omo: {
          type: "boolean"
        }

      };
    }

    constructor() {
      super();
      this.status = "connecting to IPFS"
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
