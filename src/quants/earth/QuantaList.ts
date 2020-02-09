import DesignerContext from './DesignerContext';

export default class QuantaList extends DesignerContext {
  static get properties(): any {
    return super.properties;
  }
  static get model(): any {
    return {};
  }

  public render(): void {
    return omo.html` 
      <p class="uppercase text-gray-600 text-xs font-semibold">Quanta</p>
      <ul class="">
          ${this.quanta.map((quant: any) => {
            const quantName = omo.quantum.getQuantName(
              quant.author,
              quant.project,
              quant.name,
              quant.version
            );
            const active =
              quantName === this.quantName ? 'bg-primary text-white' : '';
            return omo.html`         
              <li @click="${this.selectQuant}" class="px-2 py-1 font-semibold text-base ${active} hover--bg-primary hover--text-white leading-tight truncate">${quantName}</li>
          `;
          })}
      </ul>
    `;
  }

  public selectQuant(event: Event): void {
    this.quantName =
      this.quantName === event.srcElement['innerText']
        ? undefined
        : event.srcElement['innerText'];
    this.dispatchEvent(new CustomEvent('quantSelected'));
  }

  static get styles(): any[] {
    return [omo.theme];
  }
}
