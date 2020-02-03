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
