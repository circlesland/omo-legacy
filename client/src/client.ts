import {ApolloLink, split} from "apollo-link";
import {InMemoryCache, NormalizedCacheObject} from "apollo-cache-inmemory";
import ApolloClient, {DefaultOptions} from "apollo-client";
import {HttpLink} from "apollo-link-http";
import {WebSocketLink} from "apollo-link-ws";
import {getMainDefinition} from 'apollo-utilities';
import ws from "ws";

export const isBrowser = typeof window !== "undefined";

export class Client
{
  private readonly _host: string;
  private readonly _defaultOptions: DefaultOptions;

  private _link?: ApolloLink;
  private _client?: ApolloClient<NormalizedCacheObject>;
  private _initialized = false;

  private _jwt?:string;

  public constructor(host: string)
  {
    this._host = host;

    this._defaultOptions = {
      watchQuery: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'ignore',
      },
      query: {
        fetchPolicy: 'no-cache',
        errorPolicy: 'all',
      },
    };
  }

  public async connect()
  {
    const httpLink = new HttpLink({
      fetch: fetch,
      uri: 'http://' + this._host,
      headers: {
        authorization: this._jwt
      }
    });

    const connectionParams = {
      authorization: this._jwt,
      clientTimezoneOffset: new Date().getTimezoneOffset()
    };

    const wsImpl = !isBrowser ?  ws : WebSocket;
    const subscriptionLink = new WebSocketLink({
      webSocketImpl: wsImpl,
      uri: 'ws://' + this._host + '/graphql',
      options: {
        reconnect: true,
        connectionParams: connectionParams
      }
    });

    this._link = split(
      ({query}) =>
      {
        const {kind, operation} = <any>getMainDefinition(query);
        return kind === 'OperationDefinition' && operation === 'subscription';
      },
      subscriptionLink,
      httpLink
    );

    this._client = new ApolloClient({
      link: this._link,
      cache: new InMemoryCache(),
      defaultOptions: this._defaultOptions
    });

    if (this._jwt !== undefined)
    {
      //await this.subscribeToEvents();

      this._initialized = true;
      console.log("Connected. Token is: " + this._jwt);
      return;
    }

    //this._session = await this.createSession();
    //console.log("Got the session. Initializing an authorized connection.");

    await this.connect();
  }

  /*
  private async subscribeToEvents()
  {
    if (!this._session)
      throw new Error("No session. Call connect() first.");

    const session = this._session;

    return new Promise<void>((resolve, reject) =>
    {
      this._eventsSubscription = this.client.subscribe<NewEventSubscriptionVariables>({
        query: NewEvent
      }).subscribe(next =>
      {
        const newEvent = <SchemaType>(<any>next.data).event;
        this._clientEventBroker.publishDirect(session.owner, newEvent);
      });

      resolve();
    });
  }
   */
}