import { Client } from '@textile/threads-client';
// import Logger from "./Logger";
import { css, html } from 'lit-element';
import Language from './language/Language';
import DragableQuant from './quants/DragableQuant';
import { dragStyle } from './quants/DragStyle';
import { normalize } from './quants/Normalize';
import { theme } from './quants/Theme';

export class QuantumKernel {
  // logger: Logger;
  public quanta: any;
  public html: any;
  public css: any;
  public normalize: any;
  public dragStyle: any;
  public ready: any;
  public theme: any;
  public client: Client;
  public storeId: string;
  public ipfs: any;
  constructor() {
    // this.logger = new Logger();
    Language.init();
    this.quanta = [];
    this.html = html;
    this.css = css;
    this.normalize = normalize;
    this.dragStyle = dragStyle;
    this.theme = theme;

    this.quanta['Quant'] = DragableQuant;
    window.customElements.define('omo-quant', DragableQuant);

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
      port: '5001',
      protocol: 'http'
    });
    await this.client.start(this.storeId);
    this.initQuantsRecursive(document.childNodes);
  }

  public quant(quant: any): void {
    quant.name.toParamCase();
    const quantName = quant.name.toLowerCase().startsWith('omo')
      ? quant.name.toParamCase()
      : `omo${quant.name}`.toParamCase();
    this.quanta[quant.name] = quant;
    console.log('YEAH', quant.properties);
    window.customElements.define(quantName, quant);
  }

  public initQuantsRecursive(childNodes: NodeListOf<any>): void {
    childNodes.forEach(childNode => {
      if (childNode.init) {
        childNode.init();
      }
      this.initQuantsRecursive(childNode.childNodes);
    });
  }
}
