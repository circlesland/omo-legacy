import DragableQuant from '../../kernel/quants/DragableQuant';

export default class ViewsChooser extends DragableQuant {
  constructor() {
    super();
  }
  public render(): void {
    return omo.html`
    <div class="h-full px-8 py-6 bg-gray-200 w-1/5 text-right">
    <p class="uppercase text-gray-600 text-xs font-semibold">Views</p>
    <ul class="">
        <li
        class="px-2 py-1 font-semibold text-base bg-primary text-white leading-tight truncate"
        >
        omo-earth-preview
        </li>
        <li
        class="px-2 py-1 font-semibold text-base hover:bg-primary hover:text-white leading-tight truncate"
        >
        omo-earth-code
        </li>
        <li
        class="px-2 py-1 font-semibold text-base hover:bg-primary hover:text-white leading-tight truncate"
        >
        omo-earth-schema
        </li>
    </ul>
    </div>
    `;
  }
  static get properties(): any {
    return super.properties;
  }
  static get model(): any {
    return {};
  }
  static get styles() {
    return [omo.theme];
  }
}
