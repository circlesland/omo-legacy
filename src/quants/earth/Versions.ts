import DragableQuant from '../../kernel/quants/DragableQuant';

export default class Versions extends DragableQuant {
  constructor() {
    super();
  }
  public render(): void {
    return omo.html`
    <div class="h-full px-8 py-6 bg-gray-200 w-1/5 text-right">
         <p class="mt-8 uppercase text-gray-600 text-xs font-semibold">
          Versions
        </p>
        <ul class="mt-2 overflow-y-scroll">
         <li
            class="px-2 py-2 mb-1"
          >
            
            <p class="font-semibold text-lg text-primary leading-tight truncate">
              LATEST
            </p>
            <p class="text-xs text-gray-600">adsfljhiuasdljkfassdsasdjlfh</p>
            <p class="text-sm text-gray-800">
                my last commit message
            </p>
          </li>
          <li
            class="px-2 py-2 mb-1 hover:bg-primary hover:rounded-xl hover:text-white"
          >
           
            <p class="font-semibold text-base leading-tight truncate">
              20200201_184415
            </p>
            <p class="text-xs text-gray-600">oijasdfnlknaslmdsfllsaoiaslas</p>
            <p class="text-sm text-gray-800">
                my commit message with normal length
            </p>
          </li>
          <li
            class="px-2 py-2 mb-1 hover:bg-primary hover:rounded-xl hover:text-white"
          >
            <p class="font-semibold leading-tight truncate">
              SNAPSHOT_NAME
            </p>
            <p class="text-xs text-gray-600 truncate">etrkljadsaiuhaksdfmasdlfjhlakd</p>  
            <p class="text-sm text-gray-800">
                my very long commit message is going forever here and there
            </p>
                
          </li>
          <li
            class="px-2 py-2 mb-1 hover:bg-primary hover:rounded-xl hover:text-white"
          >
            <p class="font-semibold leading-tight truncate">
              20200201_161523
            </p>
            <p class="text-xs text-gray-600 truncate">etrkljadsaiuhaksdfmasdlfjhlakd</p>  
            <p class="text-sm text-gray-800">
                i just edited the first time
            </p>
                
          </li>
          <li
            class="px-2 py-2 mb-1 hover:bg-primary hover:rounded-xl hover:text-white"
          >
            <p class="font-semibold leading-tight truncate">
              CREATED_QUANT
            </p>
            <p class="text-xs text-gray-600 truncate">etrkljadsaiuhaksdfmasdlfjhlakd</p>  
            <p class="text-sm text-gray-800">
                congratulations to your very first earth quant
            </p>
                
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
