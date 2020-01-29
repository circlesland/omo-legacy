omo.quant(
  class TableView extends omo.quanta.Quant {
    public quantConstructor: any;
    public quant: any;
    public table: any;

    static get styles(): any[] {
      return [
        omo.theme,
        omo.dragStyle,
        omo.css`
        :host{
          overflow:scroll;
        }
        .formular{
            position:relative;
        }
        .formular *{
            transition: .4s opacity;
        }
        .formular p{
            position:absolute;
            top:0;
            left:0;
            bottom:0;
            right:0;
            z-index:-1;
        }
        .formular input{
            opacity:0;
        }
         .formular:hover input{
            opacity:1;
        }
        .formular:hover p{
            opacity:0;
        }
        input:focus{
            opacity:1;
        }
        `
      ];
    }

    constructor() {
      super();
      this.active = 'test';
    }

    public render(): any {
      return omo.html`
        <button class="border text-red-400 border-red-400 rounded-full px-2" @click="${this.showView}">Show</button>

        ${this.table}
      `;
    }

    set active(value: string) {
      const quant = omo.quanta[value];
      if (quant === undefined) {
        return;
      }
      this.quantConstructor = quant;

      this.updateTable();
    }

    public async updateTable(): Promise<void> {
      await this.quantConstructor.Init();
      this.quant = new this.quantConstructor();

      const entities = (
        await omo.client.modelFind(
          omo.storeId,
          this.quantConstructor._modelName,
          {}
        )
      ).entitiesList;
      const properties = {};
      Object.keys(this.quantConstructor.schemaProperties).forEach(
        key => (properties[key] = this.quantConstructor._model[key])
      );
      await Promise.all(
        Object.keys(properties).map(async key => {
          const prop = properties[key];
          if (prop.type === 'relation') {
            await prop.quant.Init();
            prop.options = (
              await omo.client.modelFind(omo.storeId, prop.quant._modelName, {})
            ).entitiesList;
          }
          properties[key] = prop;
        })
      );

      this.table = omo.html`
      <table class="border table-auto">
        <thead>
          <tr>
            ${this.renderHeader(properties)}
          </tr>
        </thead>
        <tbody>
          ${entities.map(entity => this.renderRow(entity, properties))}
          ${this.renderAdd()}
        </tbody>
      </table>      
      `;
    }

    public renderHeader(properties: any): any {
      return omo.html`
        <th class="bg-gray-100 text-left text-gray-600 text-xs px-4 py-2 border-b uppercase">actions</th>
        ${Object.keys(properties).map(header =>
          header === 'ID'
            ? ''
            : omo.html`
            <th class="bg-gray-100 text-left text-gray-600 text-xs px-4 py-2 border-b uppercase">${header}</th>
          `
        )}
      `;
    }

    public renderRow(entry: any, properties: any): any {
      return omo.html`
          <tr>
            <td class="border-b px-4 py-1">
              ${this.renderActions(entry.ID)}
            </td>
            ${Object.keys(properties).map(name =>
              name === 'ID'
                ? omo.html``
                : omo.html`
              <td class="text-gray-600 border-b px-4 py-2">
                ${this.renderColumn(properties, name, entry)}
              </td>`
            )}
          </tr>
      `;
    }

    public renderColumn(properties: any, name: string, entry: any): any {
      const pattern = properties[name].pattern
        ? properties[name].pattern
        : '.*';
      switch (properties[name].type) {
        case 'boolean':
          return omo.html`
          <input name="${name}" type="checkbox" ?checked="${entry[name]}" data-id="${entry.ID}" @change="${this.changed}" @focus="${this.updatePreview}">`;
        case 'date':
        case 'number':
        case 'email':
        case 'password':
        case 'file':
        case 'color':
        case 'month':
        case 'search':
        case 'tel':
        case 'url':
        case 'week':
        case 'datetime-local':
          return this.renderInput(
            properties[name].type,
            name,
            entry[name],
            entry.ID,
            properties[name].disabled,
            properties[name].required,
            pattern,
            properties[name].onError
          );
        case 'relation':
          return this.renderRelation(
            name,
            entry[name],
            entry.ID,
            properties[name].options,
            properties[name].display
          );
        case 'formular':
          const formular = entry[name]
            ? entry[name].replace(/this/g, 'entry')
            : '';
          return omo.html`
                <div class="formular">
                    <p>${
                      // tslint:disable-next-line: no-eval
                      eval('`' + formular + '`')
                    }
                    </p>
                    ${this.renderInput(
                      properties[name].type,
                      name,
                      entry[name],
                      entry.ID,
                      properties[name].disabled,
                      properties[name].required,
                      pattern,
                      properties[name].onError
                    )}
                </div>
            `;
        default:
          return this.renderInput(
            'text',
            name,
            entry[name],
            entry.ID,
            properties[name].disabled,
            properties[name].required,
            pattern,
            properties[name].onError
          );
      }
    }

    public renderRelation(
      name: string,
      value: any,
      id: string,
      options: any[],
      display: any
    ): any {
      return omo.html`
      <select data-name="${name}" data-id="${id}" @change="${(e: any) => {
        this.selectChanged(e);
      }}">
        <option value="">Bitte ${name} auswählen</option>
        ${options.map(
          option => omo.html`
            <option value="${option.ID}" ?selected="${value &&
            value.id === option.ID}">${
            option[display] ? option[display] : option.ID
          }</option>
          `
        )}
      </select>
      `;
    }

    public async selectChanged(event: any): Promise<void> {
      const target = event.target;
      const index = target.selectedIndex;
      const foreignId = target.options[index].value;
      const itemId = target.dataset.id;
      const name = target.dataset.name;

      const entity = (
        await omo.client.modelFindByID(
          omo.storeId,
          this.quantConstructor._modelName,
          itemId
        )
      ).entity;
      if (foreignId === '') {
        delete entity[name];
      } else {
        entity[name] = {
          id: foreignId
        };
      }
      await omo.client.modelSave(
        omo.storeId,
        this.quantConstructor._modelName,
        [entity]
      );
      console.log('Model Saved', entity);
    }

    public renderAdd(): any {
      return omo.html`<tr><td class="px-4 py-2"><button class="border text-green-400 border-green-400 rounded-full px-2" @click="${this.createNew}">add row</button></td></tr>`;
    }

    public async createNew(): Promise<any> {
      const instance = new this.quantConstructor();
      await instance.initAsync();
      await this.updateTable();
      this.focusId(instance.entityId);
    }

    public async duplicate(event: any): Promise<void> {
      const entity = (
        await omo.client.modelFindByID(
          omo.storeId,
          this.quantConstructor._modelName,
          event.target.dataset['id']
        )
      ).entity;
      entity.ID = null;
      const newEntity = (
        await omo.client.modelCreate(
          omo.storeId,
          this.quantConstructor._modelName,
          [entity]
        )
      ).entitiesList[0];
      await this.updateTable();
      this.focusId(newEntity.ID);
    }

    public focusId(entityId: string): void {
      const input = this.root.querySelector(
        `input[data-id='${entityId}']:not([disabled])`
      );
      input.focus();
    }

    public renderActions(id: string): any {
      return id !== undefined
        ? omo.html`
        <div class="py-1 px-2">
          <button class="border text-red-400 border-red-400 rounded-full px-2" @click="${this.delete}" data-id="${id}">delete</button>
          <button class="border text-red-400 border-red-400 rounded-full px-2" @click="${this.openItemView}" data-id="${id}">ItemView</button>
          <button class="border text-red-400 border-red-400 rounded-full px-2" @click="${this.showView}" data-id="${id}">Show</button>
          <!-- <button class="border text-green-400 border-green-400 rounded-full px-2" @click="${this.duplicate}" data-id="${id}">duplicate</button> -->
        </div>`
        : omo.html`<span></span>`;
    }

    public async openItemView(e: any): Promise<void> {
      const newQuant = new omo.quanta.ItemView();
      newQuant.show(this.quantConstructor, e.target.dataset['id']);
      await newQuant.init();
      this.parentNode.replaceChild(newQuant, this);
    }

    public async showView(e: any): Promise<void> {
      const newQuant = new this.quantConstructor();
      newQuant.ID = e.target.dataset['id'];
      await newQuant.init();
      this.parentNode.replaceChild(newQuant, this);
    }

    public async delete(event: any): Promise<void> {
      console.log(event.target);
      await omo.client.modelDelete(
        omo.storeId,
        this.quantConstructor._modelName,
        [event.target.dataset['id']]
      );
      await this.updateTable();
    }

    public renderInput(
      type: any,
      name: any,
      value: any,
      id: any,
      disabled = false,
      required = false,
      pattern = '',
      error = ''
    ): any {
      return omo.html`
        <input name="${name}" type="${type}" placeholder="${name}" pattern="${pattern}" .value="${
        value === undefined ? null : value
      }" ?disabled="${disabled}" ?required="${required}" data-id="${id}"  @change="${
        this.changed
      }" @focus="${this.updatePreview}" data-error="${error}">
      `;
    }

    public async changed(event: any): Promise<void> {
      const target = event.target;
      target.setCustomValidity('');
      if (!target.checkValidity()) {
        target.setCustomValidity(target.dataset.error);
        target.reportValidity();
        return;
      }

      const name = target.name;
      let value = target.value;
      if (target.type === 'checkbox') {
        value = target.checked;
      }
      if (target.type === 'number') {
        value = Number(value);
      }

      const entity = (
        await omo.client.modelFindByID(
          omo.storeId,
          this.quantConstructor._modelName,
          target.dataset['id']
        )
      ).entity;
      entity[name] = value;
      await omo.client.modelSave(
        omo.storeId,
        this.quantConstructor._modelName,
        [entity]
      );
      console.log('Model Saved', entity);
    }

    static get model(): any {
      return {
        active: {
          type: 'string'
        },
        table: {
          type: 'property'
        }
      };
    }

    static get properties(): any {
      return super.properties;
    }

    public async initAsync(): Promise<void> {
      super.initAsync();
    }
  }
);
