import DesignerContext from './DesignerContext';

export default class SplitView extends DesignerContext {
  static get properties(): any {
    return super.properties;
  }

  public render(): void {
    return omo.html`
    <style>
    :host .splitView{
      display:grid;
      grid-template-rows: ${this.selectedViews.map(
      () => omo.html` ${(1 / this.selectedViews.length) * 100}%`
    )};
    }
    </style>
    <div class="actions"></div>
    <div class="splitView">
      ${this.selectedViews.map(view => omo.html`<slot name="${view}"></slot>`)}
    </div>
    `;
  }

  public updated(changedProperties: any): void {
    super.updated(changedProperties);
    changedProperties.forEach((_oldValue, propName) => {
      switch (propName) {
        case 'selectedViews':
          this.addChildren();
          this.updateProperties();
          break;
        default:
          this.updateProperties();
      }
    });
  }

  public addChildren(): void {
    this.clear();
    this.selectedViews.forEach(view => {
      const newElem: HTMLElement = view === 'default'
        ? document.createElement(this.quantName)
        : document.createElement(view);
      newElem.slot = view;
      if (view.startsWith("omo-earth-codeeditor")) {
        newElem.addEventListener(
          'quantSaved',
          () => { alert("saved"); this.dispatchEvent(new CustomEvent('quantSaved')) },
          false
        );
      }
      this.append(newElem);
    });
  }

  public updateProperties(): void {
    this.selectedViews.forEach(view => {
      const viewProperties = this.availableViews.filter(x => x.view === view)[0]
        .properties;

      if (viewProperties) {
        this.childNodes.forEach(node => {
          if (node.nodeName.toLowerCase() === view.toLowerCase() && node.nodeType === Node.ELEMENT_NODE) {
            Object.keys(viewProperties).forEach(key =>
              (node as HTMLElement).setAttribute(key, this[viewProperties[key]])
            );
          }
        })
      }
    });
  }

  static get styles(): any[] {
    return [
      omo.css/*css*/ `
        :host{
            height:100%;
            display:grid;
            grid-template-rows: auto 1fr;
            }
        `
    ];
  }
}
