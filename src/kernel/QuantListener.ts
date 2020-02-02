// /**
//  * The QuantListener is one of the core features it listen to the DOM an then apply the magic of resolving depencies
//  */
export default class QuantListener {
  public loadedQuanta: string[];
  private head: HTMLHeadElement;

  constructor() {
    this.loadedQuanta = [];
    this.head = document.getElementsByTagName("head")[0];
    this.loadAlreadyExistingQuanta();
    this.subscribeNodeAdded();
  }
  public getMeta(src: string): any {
    const splitted = src.split('-');

    const author = splitted[0];
    const project = splitted[1];
    const name = splitted[2];
    let version = "latest";

    if (splitted.length < 3) {
      throw Error("Only quants with full identifier are accepted. Please use name like: author-project-name-version or author-project-name Your name was: " + src);
    }

    if (splitted.length === 4) {
      version = splitted[3];
    }

    return { author, project, name, version }
  }
  public async ReplaceVersion(author: string, project: string, name: string, version: string, codeCid: string): Promise<void> {
    const quantname = omo.quantum.getQuantName(author, project, name, version);
    const code = await omo.ipfs.cat(codeCid);
    this.addOrUpdateScriptElement(code, author, project, name, version, quantname);
  }
  private async loadQuant(scriptElement: HTMLScriptElement): Promise<void> {
    const quantname = scriptElement.getAttribute("src");
    if (quantname == null || this.loadedQuanta.includes(quantname)) { return; };

    const meta = this.getMeta(quantname);
    const code = await this.loadQuantFromStore(meta.author, meta.project, meta.name, meta.version);

    this.addOrUpdateScriptElement(code, meta.author, meta.project, meta.name, meta.version, quantname);

    scriptElement.setAttribute("loaded", "true");
  }
  private addOrUpdateScriptElement(code: any, author: string, project: string, name: string, version: string, quantname: string): void {
    const data = `omo.quantum.register(${code},'${author}','${project}','${name}','${version}');`;
    const node = document.createTextNode(data);
    const script = document.createElement("script");
    script.type = "module";
    script.setAttribute("data-quant", quantname);
    script.append(node);
    this.head.append(script);
  }

  private async loadQuantFromStore(author: string, project: string, name: string, version: string): Promise<any> {
    return omo.quantum.loadFromThread(author, project, name, version);
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
        this.loadQuant(node);
      })
    });
  }
}
