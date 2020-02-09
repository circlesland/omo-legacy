import DragableQuant from '../../kernel/quants/DragableQuant';

export default class Data extends DragableQuant {
  constructor() {
    super();
  }
  public render(): void {
    return omo.html`
        <div class="">
          <p class="mt-8 uppercase text-gray-600 text-xs font-semibold">
            Quanta Data
          </p>
          <ul class="mt-2">
            <li class="px-2 py-1 mb-1 hover:bg-primary hover:rounded-xl hover:text-white">
              <p class="font-semibold text-base leading-tight truncate">
                Todos
              </p>
              <p class="text-xs text-gray-600">
                omo-earth-todos
              </p>
            </li>
            <li class="px-2 py-1 mb-1 hover:bg-primary hover:rounded-xl hover:text-white">
              <p class="font-semibold text-base hover:text-white leading-tight truncate">
                People
              </p>
              <p class="text-xs text-gray-600">omo-earth-people</p>
            </li>
            <li class="px-2 py-1 mb-1 hover:bg-primary hover:rounded-xl hover:text-white">
              <p class="font-semibold text-base leading-tight truncate">
                Milestones
              </p>
              <p class="text-xs text-gray-600">omo-earth-milestones</p>
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
