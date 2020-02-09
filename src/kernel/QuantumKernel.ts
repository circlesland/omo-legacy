// import Logger from "./Logger";
import { css, html } from 'lit-element';
import * as moment from 'moment';
import Language from './language/Language';
import { dragStyle } from './quants/DragStyle';
import { normalize } from './quants/Normalize';
import { theme } from './quants/Theme';
import { QuantStore } from './QuantStore';
import ThreadsClientInterface from './ThreadsClientInterface';

export class QuantumKernel {
  // logger: Logger;
  public quantum: QuantStore;
  public html: any;
  public css: any;
  public normalize: any;
  public dragStyle: any;
  public theme: any;
  public textileThreads: ThreadsClientInterface;
  public storeId: string;
  public ipfs: any;
  public ready: boolean;
  public moment: any;

  constructor() {
    console.debug("start creating kernel");
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

    this.textileThreads = new ThreadsClientInterface();
    // TODO implement with data
    // const urlParams = new URLSearchParams(window.location.search);
    // const storeId = urlParams.get('storeId');
    // this.storeId = storeId == null ? '' : storeId;
    // if (this.storeId === '') {
    //   this.textileThreads.newStore().then(result => {
    //     window.location.search += `storeId=${result.id}`;
    //   });
    // }
    this.startClient();
  }

  public async startClient(): Promise<void> {
    // TODO change
    // For local usage
    // let IPFS = require('ipfs');
    // this.ipfs = await IPFS.create();
    const ipfsClient = require('ipfs-http-client');
    this.ipfs = await ipfsClient({
      // host: '81.169.194.192',
      host: 'localhost',
      port: '5001',
      protocol: 'http'
    });

    await this.textileThreads.start();
    await this.quantum.initAsync();
    this.ready = true;
  }
}
