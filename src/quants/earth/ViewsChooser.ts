import DesignerContext from './DesignerContext';

export default class ViewsChooser extends DesignerContext {
  constructor() {
    super();
  }
  public render(): void {
    return omo.html`
    <div class="h-full px-8 py-6 bg-gray-200 w-1/5 text-right">
      <p class="uppercase text-gray-600 text-xs font-semibold">Views</p>
      <ul class="">
        ${this.availableViews.map(view => {
          const selected = this.selectedViews.includes(view.view);
          const selectedClass = selected ? 'bg-primary text-white' : '';
          return omo.html`
        <li @click="${() =>
          this.viewSelected(
            view.view
          )}" class="px-2 py-1 font-semibold text-base hover:bg-primary hover:text-white leading-tight truncate ${selectedClass}">
          ${view.display}</li>
        `;
        })}
      </ul>
    </div>
    `;
  }
  static get properties(): any {
    return super.properties;
  }
  static get styles(): any[] {
    return [omo.theme];
  }
  private viewSelected(view: string): void {
    this.selectedViews = this.selectedViews.includes(view)
      ? this.selectedViews.filter(item => item !== view)
      : [...this.selectedViews, view];
    this.dispatchEvent(new CustomEvent('selectedViewsChanged'));
  }
}
