import { Client } from '@textile/threads-client';
// import Logger from "./Logger";
import { css, html } from 'lit-element';
import * as moment from 'moment';
import Language from './language/Language';
import { dragStyle } from './quants/DragStyle';
import { normalize } from './quants/Normalize';
import { theme } from './quants/Theme';
import { QuantStore } from './QuantStore';

export class QuantumKernel {
  // logger: Logger;
  public quantum: QuantStore;
  public html: any;
  public css: any;
  public normalize: any;
  public dragStyle: any;
  public theme: any;
  public client: Client;
  public storeId: string;
  public ipfs: any;
  public ready: boolean;
  public moment: any;

  constructor() {
    this.ready = false;
    // this.logger = new Logger();
    Language.init();
    this.quantum = new QuantStore();

    this.html = html;
    this.css = css;
    this.normalize = normalize;
    this.dragStyle = dragStyle;
    this.theme = theme;
    this.moment = moment;

    // this.quanta['Quant'] = DragableQuant;
    // window.customElements.define('omo-quant', DragableQuant);
    // this.quanta.load(DragableQuant);

    // this.client = new Client("http://localhost:7006");
    this.client = new Client('http://81.169.194.192:7006');
    const urlParams = new URLSearchParams(window.location.search);
    const storeId = urlParams.get('storeId');
    this.storeId = storeId == null ? '' : storeId;
    if (this.storeId === '') {
      this.client.newStore().then(result => {
        window.location.search += `storeId=${result.id}`;
      });
    }
    this.startClient();
  }

  public async startClient(): Promise<void> {
    // For local usage
    // let IPFS = require('ipfs');
    // this.ipfs = await IPFS.create();
    const ipfsClient = require('ipfs-http-client');
    this.ipfs = await ipfsClient({
      host: '81.169.194.192',
      // host: 'localhost',
      port: '5001',
      protocol: 'http'
    });

    await this.client.start(this.storeId);
    await this.quantum.initAsync();
    this.ready = true;
  }

  // public quant(quant: any, author = "omo", project = "quantum"): void {
  //   // quant.name.toParamCase();
  //   // const quantName = quant.name.toLowerCase().startsWith('omo')
  //   //   ? quant.name.toParamCase()
  //   //   : `omo${quant.name}`.toParamCase();
  //   this.quantum.storeQuant(author, project, quant.name, quant);
  // }

  // public initQuantsRecursive(childNodes: NodeListOf<any>): void {
  //   childNodes.forEach(childNode => {
  //     if (childNode.init) {
  //       childNode.init();
  //     }
  //     this.initQuantsRecursive(childNode.childNodes);
  //   });
  // }
}
