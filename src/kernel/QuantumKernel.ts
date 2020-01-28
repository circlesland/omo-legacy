import { Client } from "@textile/threads-client";
// import Logger from "./Logger";
import Language from "./language/Language";
import { html, css } from "lit-element";
import { normalize } from "./quants/Normalize";
import { dragStyle } from "./quants/DragStyle";
import { theme } from "./quants/Theme";
import DragableQuant from "./quants/DragableQuant";

export class QuantumKernel {
  // logger: Logger;
  quanta: any;
  html: any;
  css: any;
  normalize: any;
  dragStyle: any;
  ready: any;
  theme: any;
  client: Client;
  storeId: string;
  ipfs: any;
  constructor() {
    // this.logger = new Logger();
    Language.init();
    this.quanta = [];
    this.html = html;
    this.css = css;
    this.normalize = normalize;
    this.dragStyle = dragStyle;
    this.theme = theme;
    this.quanta["Quant"] = DragableQuant;
    // this.client = new Client("http://localhost:7006");
    this.client = new Client("https://81.169.194.192:7006");

    let urlParams = new URLSearchParams(window.location.search);
    let storeId = urlParams.get("storeId");
    this.storeId = storeId == null ? "" : storeId;
    if (this.storeId == "") {
      this.client.newStore().then(result => {
        window.location.search += `storeId=${result.id}`;
      });
    }
    this.startClient();
  }

  async startClient() {
    // For local usage
    // let IPFS = require('ipfs');
    // this.ipfs = await IPFS.create();
    let ipfsClient = require("ipfs-http-client");
    this.ipfs = await ipfsClient({
      host: "81.169.194.192",
      port: "5001",
      protocol: "https"
    });
    await this.client.start(this.storeId);
    this.initQuantsRecursive(document.childNodes);
  }

  quant(quant: any) {
    quant.name.toParamCase();
    var quantName = quant.name.toLowerCase().startsWith("omo")
      ? quant.name.toParamCase()
      : `omo${quant.name}`.toParamCase();
    this.quanta[quant.name] = quant;
    console.log("YEAH", quant.properties);
    window.customElements.define(quantName, quant);
  }

  initQuantsRecursive(childNodes: NodeListOf<any>) {
    childNodes.forEach(childNode => {
      if (childNode.init) childNode.init();
      this.initQuantsRecursive(childNode.childNodes);
    });
  }

  //     async create(modelName:string){
  //         const store = await this.client.newStore();
  //         this.storeid = store.id;
  //         await this.client.registerSchema(store.id, modelName, schema);
  //         this.client.start(this.storeid);

  //         console.log(this.client);
  //     }
  //     async start(){
  //         // this.client.start()
  //     }
  //     async allEntries(modelName:string) {

  //         const found = await this.client.modelFind(this.storeid, modelName, {})
  //         console.log('found:', found.entitiesList.length)
  //         this.folders = found.entitiesList.map((entity) => entity).map((obj) => {
  //   return console.log(obj)
  // })

  //         // this.client.listen(this.storeid,"test","",this.callback);
  //     }

  //     async filterByName(modelName:string){
  //         let query = new Query();
  //         query.orderBy("name");
  //         let found =await this.client.modelFind(this.storeid,modelName,query)
  //         this.folders = found.entitiesList.map((entity) => entity).map((obj) => {
  //             return console.log(obj)});
  //     }

  //     async addModel(modelName:string,name:string){
  //         // console.log(uuidv1());
  //         const created = await this.client.modelCreate(this.storeid, modelName, [{
  //             name: name
  //           }])
  //     }

  //     async delete(modelName:string,id:string){
  // await        this.client.modelDelete(this.storeid,modelName,[id]);
  //     }

  //     async change(modelName:string,id:string, newName:string){
  //         var entity = await this.client.modelFindByID(this.storeid,modelName,id);
  // entity.entity.name = newName;
  // await this.client.modelSave(this.storeid,modelName,[entity.entity])
  //     }

  //     async listen(id:string){
  //         this.client.listen(this.storeid,"test",id,(obj)=>{console.log("Listen to: ",obj)});
  //     }

  //     async listen2(){
  //         this.client.listen(this.storeid,"test","",(obj)=>{console.log("Listen2 to: ",obj)});
  //     }

  //     foo(storeid: string, arg1: string, arg2: string, foo: any) {
  //         throw new Error("Method not implemented.");
  //     }
  // }

  // const schema = {
  //     $schema: 'http://json-schema.org/draft-04/schema#',
  //     $ref: '#/definitions/test',
  //     definitions: {
  //       test: {
  //         required: [
  //           'ID',
  //           'name',
  //         ],
  //         properties: {
  //           ID: {
  //             type: 'string'
  //           },
  //           name: {
  //             type: 'string'
  //           }
  //         },
  //         additionalProperties: false,
  //         type: 'object'
  //       }
  //     }
}
