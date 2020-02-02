import DragableQuant from '../../kernel/quants/DragableQuant';

export default class SplitView extends DragableQuant {
  static get properties(): any {
    return super.properties;
  }
  static get model(): any {
    return {
      columns: {
        type: 'array'
      },
      rows: {
        type: 'array'
      }
    };
  }

  public rows: any[];
  public columns: any[];
  constructor() {
    super();
    this.autosave = false;
    if (this.rows === undefined) {
      this.rows = this.array(1);
    }
    if (this.columns === undefined) {
      this.columns = this.array(1);
    }
  }
  public setColumns(count: number): void {
    this.columns = this.array(count);
  }
  public setRows(count: number): void {
    this.rows = this.array(count);
  }
  public render(): void {
    return omo.html`
            <style>
            .splitView{
                display:grid;
                grid-template-columns: ${this.columns.map(
                  (_col: any) => omo.html` 1fr`
                )};
                grid-template-rows: ${this.rows.map(
                  (_row: any) => omo.html` 1fr`
                )};
            }
            </style>
            <div>
                <label>columns</label>
                <input type = "number" value = "${
                  this.columns.length
                }" @change="${this.updateColumns}" >
                <label>rows </label>
                <input type = "number" value = "${this.rows.length}" @change="${
      this.updateRows
    }" >
      </div>
      <div class="splitView" >
          ${this.rows.map(
            (row: any) =>
              omo.html`${this.columns.map(
                (column: any) =>
                  omo.html`<div><slot name="slot-${row}-${column}"></slot></div>`
              )}`
          )}
      </div>
    `;
  }
  public async initAsync(): Promise<void> {
    super.initAsync();
  }
  public array(length): any[] {
    const arr = [];
    for (let i = 0; i < length; i++) {
      arr.push(i);
    }
    return arr;
  }
  // public updated(changedProperties: any): void {
  //   super.updated(changedProperties);
  //   console.log("HBUINSKFJHBVH")
  //   changedProperties.forEach((_oldValue, propName) => {
  //     switch (propName) {
  //       case 'columns':
  //         if (this.columns === undefined || this.columns.length <= 0) {
  //           this.columns = this.array(1);
  //         }
  //         break;
  //       case 'rows':
  //         if (this.rows === undefined || this.rows.length <= 0) {
  //           this.rows = this.array(1);
  //         }
  //         break;
  //     }
  //   });
  // }
  private updateColumns(event: Event): void {
    this.columns = this.array(
      Number.parseInt((event.target as HTMLInputElement).value, 10)
    );
  }
  private updateRows(event: Event): void {
    this.rows = this.array(
      Number.parseInt((event.target as HTMLInputElement).value, 10)
    );
  }
  static get styles() {
    return [
      omo.theme,
      omo.css/*css*/ `
        :host{
            height:100%;
            display:grid;
            grid-template-rows:auto 1fr
            }
        `
    ];
  }
}
