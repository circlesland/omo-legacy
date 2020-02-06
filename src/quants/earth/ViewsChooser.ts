import DesignerContext from './DesignerContext';

export default class ViewsChooser extends DesignerContext {
  public prop4: number[];
  constructor() {
    super();
    // this.availableViews = [1, 2, 3];
  }
  public render(): void {
    return omo.html`
    <div class="h-full px-8 py-6 bg-gray-200 w-1/5 text-right">
      <p class="uppercase text-gray-600 text-xs font-semibold">Views</p>
      <ul class="">
    
      ${this.availableViews.map(item => {
        const selected = this.selectedViews.includes(item.view);
        const selectedClass = selected ? 'bg-primary text-white' : '';
        return omo.html`
        <li @click="${() =>
          this.viewSelected(
            item.view
          )}" class="px-2 py-1 font-semibold text-base hover:bg-primary hover:text-white leading-tight truncate ${selectedClass}">
          ${item.display}</li>
        `;
      })}
        </ul>
    </div>
    `;
  }

  static get model(): any {
    return super.model;
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
