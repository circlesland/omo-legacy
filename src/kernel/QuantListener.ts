// /**
//  * The QuantListener is one of the core features it listen to the DOM an then apply the magic of resolving depencies
//  */
export default class QuantListener {
  //   loadedQuanta: string[];
  //   head: HTMLHeadElement;
  //   constructor() {
  //     this.loadedQuanta = [];
  //     this.head = document.getElementsByTagName("head")[0];
  //     this.subscribeNodeAdded();
  //     this.loadAlreadyExistingQuanta();
  //   }
  //   async loadQuant(scriptElement: HTMLScriptElement) {
  //     let script = document.createElement("script");
  //     script.type = "module";
  //     let hash = scriptElement.getAttribute("src");
  //     if (hash == null || this.loadedQuanta.includes(hash)) return; // already loaded
  //     this.loadedQuanta.push(hash);
  //     let blob = await window.omo.textile.ipfs.cat(hash);
  //     script.innerText = await blob.text();
  //     this.head.append(script);
  //     scriptElement.setAttribute("loaded", "true");
  //   }
  //   loadAlreadyExistingQuanta() {
  //     let unloadedQuanta = this.head.querySelectorAll(
  //       "script[type='quant']:not([loaded])"
  //     );
  //     unloadedQuanta.forEach(element => {
  //       this.loadQuant(element);
  //     });
  //   }
  //   subscribeNodeAdded() {
  //     this.head.addEventListener(
  //       "DOMNodeInserted",
  //       this.OnHeadNodeInserted.bind(this),
  //       false
  //     );
  //   }
  //   OnHeadNodeInserted(event) {
  //     let scriptNode = event.target;
  //     if (scriptNode.tagName && scriptNode.tagName.toLowerCase() != "script")
  //       return;
  //     if (scriptNode.type.toLowerCase() != "quant") return;
  //     this.loadQuant(scriptNode);
  //   }
}
