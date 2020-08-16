import { Threads } from "./textile/threads";
import { QuantRegistry } from "./quant/quantRegistry";
import { GraphQL } from "./data/graphQL";
import { StopWatch } from "./stopWatch";

export class Adapter {
    readonly graphQL: GraphQL;
    readonly quantRegistry: QuantRegistry;
    readonly threads: Threads;

    private constructor(threads: Threads, quantRegistry: QuantRegistry, graphQL: GraphQL) {
        this.threads = threads;
        this.quantRegistry = quantRegistry;
        this.graphQL = graphQL;
    }

    static async create(): Promise<Adapter> {
        StopWatch.start("threads");
        var threads = new Threads();
        StopWatch.stop("threads");

        StopWatch.start("registry");
        var quantRegistry = await QuantRegistry.init(threads, true);
        StopWatch.stop("registry");

        StopWatch.start("graphQL");
        var graphQL = await GraphQL.init(quantRegistry);
        StopWatch.stop("graphQL");

        quantRegistry.syncAllCollections();

        return new Adapter(threads, quantRegistry, graphQL);
    }
}
