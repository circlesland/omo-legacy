omo.quant(
  class Inspire extends omo.quanta.Quant {
    public static get styles(): any {
      return [
        omo.theme,
        omo.css`
        :host{
        }
        .toggle {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
          width: 62px;
          height: 32px;
          display: inline-block;
          position: relative;
          border-radius: 50px;
          overflow: hidden;
          outline: none;
          border: none;
          cursor: pointer;
          background-color: #707070;
          transition: background-color ease 0.3s;
        }
        
        .toggle:before {
          content: "";
          display: block;
          position: absolute;
          z-index: 2;
          width: 28px;
          height: 28px;
          background: #fff;
          left: 2px;
          top: 2px;
          border-radius: 50%;
          font: 10px/28px Helvetica;
          text-transform: uppercase;
          font-weight: bold;
          text-indent: -22px;
          word-spacing: 37px;
          color: #fff;
          text-shadow: -1px -1px rgba(0,0,0,0.15);
          white-space: nowrap;
          box-shadow: 0 1px 2px rgba(0,0,0,0.2);
          transition: all cubic-bezier(0.3, 1.5, 0.7, 1) 0.3s;
        }
        
        .toggle:checked {
          background-color: #4CD964;
        }
        
        .toggle:checked:before {
          left: 32px;
        }
        `
      ];
    }

    public render(): any {
      return omo.html`
      toggle:<br>

      <input class="toggle" type="checkbox" />

      <br> 

      taildwind card: <br>

      <div class="max-w-sm rounded overflow-hidden shadow-lg">
        <div class="px-6 py-4">
          <div class="font-bold text-xl mb-2">Card title</div>
          <p class="text-gray-700 text-base">
            Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla! Maiores et perferendis eaque, exercitationem praesentium nihil.
          </p>
        </div>
        <div class="px-6 py-4">
          <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">#state</span>
          <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700 mr-2">#open</span>
          <span class="inline-block bg-gray-200 rounded-full px-3 py-1 text-sm font-semibold text-gray-700">#closed</span>
        </div>
      </div>

      sidecard
      
      <div class="max-w-sm w-full lg:max-w-full lg:flex">
        <div class="h-48 lg:h-auto lg:w-48 flex-none bg-cover rounded-t lg:rounded-t-none lg:rounded-l text-center overflow-hidden" style="background-image: url('/img/card-left.jpg')" title="Woman holding a mug">
        </div>
        <div class="border-r border-b border-l border-gray-400 lg:border-l-0 lg:border-t lg:border-gray-400 bg-white rounded-b lg:rounded-b-none lg:rounded-r p-4 flex flex-col justify-between leading-normal">
          <div class="mb-8">
            <p class="text-sm text-gray-600 flex items-center">
              <svg class="fill-current text-gray-500 w-3 h-3 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M4 8V6a6 6 0 1 1 12 0v2h1a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-8c0-1.1.9-2 2-2h1zm5 6.73V17h2v-2.27a2 2 0 1 0-2 0zM7 6v2h6V6a3 3 0 0 0-6 0z" />
              </svg>
              Members only
            </p>
            <div class="text-gray-900 font-bold text-xl mb-2">Can coffee make you a better developer?</div>
            <p class="text-gray-700 text-base">Lorem ipsum dolor sit amet, consectetur adipisicing elit. Voluptatibus quia, nulla! Maiores et perferendis eaque, exercitationem praesentium nihil.</p>
          </div>
          <div class="flex items-center">
            <img class="w-10 h-10 rounded-full mr-4" src="/img/jonathan.jpg" alt="Avatar of Jonathan Reinink">
            <div class="text-sm">
              <p class="text-gray-900 leading-none">Jonathan Reinink</p>
              <p class="text-gray-600">Aug 18</p>
            </div>
          </div>
        </div>
      </div>

      `;
    }
  }
);
