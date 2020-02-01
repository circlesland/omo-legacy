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

  public getMeta(src: string): any {
    const splitted = src.split('-');

    const author = splitted[0];
    const project = splitted[1];
    const name = splitted[2];

    if (splitted.length !== 4) {
      console.error("In alpha only quants with full identifier are accepted. Please use name like: author-project-name-version. Your name was: ", src);
      return { author, project, name, major: 0, minor: 0, patch: 1 }
    }

    const version = splitted[3].split('.');
    if (version.length !== 3) {
      console.error("In alpha only version with full identifier are accepted. Please use version like: major.minor.patch Your version was: ", splitted[3]);
      return undefined;
    }
    const major = Number.parseInt(version[0], 10);
    const minor = Number.parseInt(version[1], 10);
    const patch = Number.parseInt(version[2], 10);
    return { author, project, name, major, minor, patch }
  }

  private async loadQuant(scriptElement: HTMLScriptElement): Promise<void> {
    const quantname = scriptElement.getAttribute("src");
    if (quantname == null || this.loadedQuanta.includes(quantname)) { return; };

    const meta = this.getMeta(quantname);
    const code = await this.loadQuantFromStore(meta.author, meta.project, meta.name, meta.major, meta.minor, meta.patch);
    const data = `omo.quantum.register(${code},'${meta.author}','${meta.project}','${meta.name}',${meta.major},${meta.minor},${meta.patch});`;
    const node = document.createTextNode(data);

    const script = document.createElement("script");
    script.type = "module";
    script.setAttribute("data-quant", quantname);
    script.append(node);

    this.head.append(script);
    scriptElement.setAttribute("loaded", "true");
  }
  private async loadQuantFromStore(author: string, project: string, name: string, major: number, minor: number, patch: number): Promise<any> {
    return await omo.quantum.loadFromThread(author, project, name, major, minor, patch);
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
