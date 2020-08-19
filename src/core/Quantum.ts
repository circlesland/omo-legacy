import { Odentity } from "./Odentity";
import { Threads } from "./Textile/Threads";
import { QuantRegistry } from "./Quant/QuantRegistry";
import { GraphQL } from "./Data/GraphQL";
import { Seeder } from "./Data/Seeder";
import { LocalThread } from "./Textile/LocalThread";
import { throwError } from "rxjs";
import { RemoteThread } from "./Textile/RemoteThread";
import { StopWatch } from "./StopWatch";
import CirclesCore from "@circles/core";
import Web3 from "web3";
import { EventBroker } from "./Events/EventBroker";
// import { KeyInfo, Client, ThreadID } from "@textile/hub";

export class Quantum {
  readonly circlesCore: CirclesCore;
  readonly eventBroker: EventBroker;
  readonly web3: Web3;

  readonly odentity: Odentity;
  readonly graphQL: GraphQL;
  readonly quantRegistry: QuantRegistry;
  readonly threads: Threads;

  readonly isAdmin: boolean = true;

  private constructor(threads: Threads, odentity: Odentity, quantRegistry: QuantRegistry, graphQL: GraphQL, web3: Web3, circlesCore: CirclesCore, eventBroker: EventBroker) {
    this.threads = threads;
    this.odentity = odentity;
    this.quantRegistry = quantRegistry;
    this.graphQL = graphQL;

    this.web3 = web3;
    this.circlesCore = circlesCore;
    this.eventBroker = eventBroker;
  }

  async publishShellEventAsync(event: any) {
    const t = this.eventBroker.tryGetTopic("omo", "shell");
    if (!t)
      throw new Error("Topic 'shell' doesn't exist in namespace 'omo'");
    await t.publish(event);
  }
  // async getclient() {
  //   let remoteAuth: KeyInfo = {
  //     key: process.env.USER_API_KEY || '',
  //     secret: process.env.USER_API_SECRET || ''
  //   };
  //   return await Client.withKeyInfo(remoteAuth);
  // }

  // async getQThread() {
  //   return ThreadID.fromString("bafk2cgsww3quqhlgd6w47pvsolldhmo5l2bxi272pcv6vsahedfz7xq");
  // }

  // async cleanDreams() {
  //   let client = await this.getclient();
  //   console.log("threads", client.listThreads());
  // }

  static async leap(): Promise<Quantum> {
    StopWatch.start("threads");
    var threads = new Threads();
    StopWatch.stop("threads");

    var odentity = await Odentity.init(threads);

    StopWatch.start("registry");
    var quantRegistry = await QuantRegistry.init(threads, true);
    StopWatch.stop("registry");

    StopWatch.start("graphQL");
    var graphQL = await GraphQL.init(quantRegistry);
    StopWatch.stop("graphQL");

    if (odentity.current != null)
      quantRegistry.syncAllCollections();

    const provider = new Web3.providers.WebsocketProvider(
      !process.env.ETHEREUM_NODE_WS ? "-" : process.env.ETHEREUM_NODE_WS,
      {
        timeout: 30000,
        reconnect: {
          auto: true,
          delay: 5000,
          maxAttempts: 5,
          onTimeout: false
        },
        clientConfig: {
          keepalive: true,
          keepaliveInterval: 60000
        }
      }
    );

    const web3 = new Web3();
    web3.setProvider(provider);

    const circlesCore = new CirclesCore(web3, {
      apiServiceEndpoint: process.env.API_SERVICE_EXTERNAL,
      graphNodeEndpoint: process.env.GRAPH_NODE_EXTERNAL,
      hubAddress: process.env.HUB_ADDRESS,
      proxyFactoryAddress: process.env.PROXY_FACTORY_ADDRESS,
      relayServiceEndpoint: process.env.RELAY_SERVICE_EXTERNAL,
      safeMasterAddress: process.env.SAFE_ADDRESS,
      subgraphName: process.env.SUBGRAPH_NAME
    });


    const eventBroker = new EventBroker();
    eventBroker.createTopic("omo", "safe");
    eventBroker.createTopic("omo", "shell");

    return new Quantum(threads, odentity, quantRegistry, graphQL, web3, circlesCore, eventBroker);
  }
}
