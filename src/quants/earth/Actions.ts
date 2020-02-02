import DragableQuant from '../../kernel/quants/DragableQuant';

export default class Actions extends DragableQuant {
  constructor() {
    super();
  }
  public render(): void {
    return omo.html`
        <div class="bg-gray-100 px-4 py-2">
            <tr>
                <td class="px-1 py-2"><button class="px-3 border-2 text-green-400 border-green-400 rounded-sm hover:bg-green-400 uppercase font-semibold">action 1</button></td>
                <td class="px-1 py-2"><button class="border-2 text-gray-500 border-gray-500 px-3 rounded-sm hover:bg-green-400 uppercase font-semibold">action 2</button></td>
                <td class="px-1 py-2"><button class="border-2 text-gray-500 border-gray-500 px-3 rounded-sm hover:bg-green-400 uppercase font-semibold">action 3</button></td>
                <td class="px-1 py-2"><button class="border-red-400 border-2 text-red-800 bg-red-400 px-3 rounded-sm uppercase font-semibold">action 4</button></td>
            </tr>
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
