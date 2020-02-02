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
        <li class="px-2 py-1 font-semibold text-base bg-primary text-white leading-tight truncate">
          Code
        </li>
        <li class="px-2 py-1 font-semibold text-base hover:bg-primary hover:text-white leading-tight truncate">
          Preview
        </li>
        <li class="px-2 py-1 font-semibold text-base hover:bg-primary hover:text-white leading-tight truncate">
          Table
        </li>
        <li class="px-2 py-1 font-semibold text-base hover:bg-primary hover:text-white leading-tight truncate">
          Kanban
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
  static get styles(): any[] {
    return [omo.theme];
  }
}
