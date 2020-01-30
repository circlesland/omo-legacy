// /**
//  * The QuantListener is one of the core features it listen to the DOM an then apply the magic of resolving depencies
//  */
export default class QuantListener {
  private loadedQuanta: string[];
  private head: HTMLHeadElement;

  constructor() {
    this.loadedQuanta = [];
    this.head = document.getElementsByTagName("head")[0];
    this.loadAlreadyExistingQuanta();
    this.subscribeNodeAdded();
  }

  private async loadQuant(scriptElement: HTMLScriptElement): Promise<void> {
    const quantname = scriptElement.getAttribute("src");
    if (quantname == null || this.loadedQuanta.includes(quantname)) { return; };

    const quant = this.getQuantOrHash(quantname);
    if (quant === undefined) { return };

    // this.loadedQuanta.push(hash);
    // let blob = await window.omo.textile.ipfs.cat(hash);
    // script.innerText = await blob.text();
    const script = document.createElement("script");
    script.type = "module";
    script.setAttribute("data-quant", quantname);

    const response = await omo.ipfs.cat("QmXBnvcCpUCm37BuzpySMQ1Wj1mGJaDYn3As3NmfqhDgXX");
    script.innerText = `omo.quantum.register(${response.toString()},'${quantname}')`;
    // script.innerText = 'omo.quantum.register(class Monacos extends   omo.quantum.quanta.omo.quantum.quant["0.1.0"] {      static get properties() {    return { name: { type: String } }; } constructor() { super();    this.name = "World";}  render() {   return html`<p>Hello, ${this.name}!</p>`;}});';

    // constructor() { super(); this.code = ""; }    async initAsync() { await super.initAsync(); } render() { return omo.html `Monacos: ${this.code}`;} static get model() { return { code: {type: "string" } }; } static get properties() { return super.properties; } static get styles() {return [omo.normalize, omo.css ``];}});';
    this.head.append(script);
    scriptElement.setAttribute("loaded", "true");

  }
  private getQuantOrHash(src: string): any {
    const splitted = src.split('-');
    if (splitted.length !== 4) {
      console.error("In alpha only quants with full identifier are accepted. Please use name like: author-project-name-version. Your name was: ", src);
      return undefined;
    }
    console.log("BREAK");
    const author = splitted[0];
    const project = splitted[1];
    const name = splitted[2];

    const version = splitted[3].split('.');
    if (version.length !== 3) {
      console.error("In alpha only version with full identifier are accepted. Please use version like: major.minor.patch Your version was: ", splitted[3]);
      return undefined;
    }
    const major = Number.parseInt(version[0], 10);
    const minor = Number.parseInt(version[1], 10);
    const patch = Number.parseInt(version[2], 10);
    return omo.quantum.get(author, project, name, major, minor, patch);
  }

  private loadAlreadyExistingQuanta(): void {
    const unloadedQuanta = this.head.querySelectorAll<HTMLScriptElement>(
      "script[type='quant']:not([loaded])"
    );
    unloadedQuanta.forEach(element => {
      this.loadQuant(element);
    });
  }

  private subscribeNodeAdded(): void {
    const observer = new MutationObserver(this.OnHeadNodeInserted.bind(this));
    observer.observe(this.head, { attributes: true, childList: true });
    // this.head.addEventListener(
    //   "DOMNodeInserted",
    //   this.OnHeadNodeInserted.bind(this),
    //   false
    // );
  }

  // TODO use right typescript type
  private OnHeadNodeInserted(mutationslist: any /*MutationRecord[]*/): void {
    console.log(Object.values(mutationslist));
    mutationslist.forEach((mutation: any) => {
      mutation.addedNodes.forEach((node: any) => {
        if (node.nodeName.toLowerCase() !== "script") {
          return;
        }
        if (node["type"] !== "quant") {
          return;
        }
        console.log("LOADQUANT", node);
        this.loadQuant(node);
      })
    });
    // const scriptNode = event.target;
    // if (scriptNode.tagName && scriptNode.tagName.toLowerCase() !== "script") {
    //   return;
    // }
    // if (scriptNode.type.toLowerCase() !== "quant") { return; }
    // this.loadQuant(scriptNode);
  }
}
