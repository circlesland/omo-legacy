omo.quant(
  class TableView extends omo.quanta.Quant {

    static get styles() {
      return [
        omo.theme,
        omo.dragStyle,
        omo.css `
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
        `
      ];
    }

    constructor() {
      super();
      this.active = "";
    }

    render() {
      return omo.html `
        ${this.table}
      `;
    }

    set active(value) {
      let quant = omo.quanta[value];
      if (quant == undefined) return;
      this.quantConstructor = quant;

      this.updateTable()
    }

    async updateTable() {
      await this.quantConstructor.Init();
      this.quant = new this.quantConstructor();

      let entities = (await omo.client.modelFind(omo.storeId, this.quantConstructor._modelName, {})).entitiesList;
      let properties = this.quantConstructor._model;
      console.log(properties);
      await Promise.all(Object.keys(properties).map(async (key) => {
        let prop = properties[key];
        if (prop.type == "relation") {
          await prop.quant.Init();
          prop.options = (await window.omo.client.modelFind(window.omo.storeId, prop.quant._modelName, {})).entitiesList;
        }
        properties[key] = prop;
      }))

      this.table = omo.html `
      <table class="border table-auto">
        <thead>
          <tr>
            ${this.renderHeader(properties)}
          </tr>
        </thead>
        <tbody>
          ${entities.map(entity => this.renderRow(entity,properties))}
          ${this.renderAdd()}
        </tbody>
      </table>      
      `;
    }

    renderHeader(properties) {
      return window.omo.html `
        <th class="bg-gray-100 text-left text-gray-600 text-xs px-4 py-2 border-b uppercase">actions</th>
        ${Object.keys(properties).map(
          (header) => header == "ID" ? '' : window.omo.html`
            <th class="bg-gray-100 text-left text-gray-600 text-xs px-4 py-2 border-b uppercase">${header}</th>
          `
        )}
        
      `;
    }

    renderRow(entry, properties) {
      return window.omo.html `
          <tr>
            <td class="border-b px-4 py-1">
              ${this.renderActions(entry.ID)}
            </td>
            ${Object.keys(properties).map((name) => 
              name == "ID" ? omo.html`` : omo.html`
              <td class="text-gray-600 border-b px-4 py-2">
                ${this.renderColumn(properties, name, entry)}
              </td>`
            )}
          </tr>
      `;
    }

    renderColumn(properties, name, entry) {
      let pattern = properties[name].pattern ? properties[name].pattern : ".*";
      console.log(pattern);
      switch (properties[name].type) {
        case "boolean":
          return window.omo.html `
          <input name="${name}" type="checkbox" ?checked="${entry[name]}" data-id="${entry.ID}" @change="${this.changed}" @focus="${this.updatePreview}">`;
        case "date":
        case "number":
        case "email":
        case "password":
        case "file":
        case "color":
        case "month":
        case "search":
        case "tel":
        case "url":
        case "week":
        case "datetime-local":
          console.log(properties[name]);
          return this.renderInput(properties[name].type, name, entry[name], entry.ID, properties[name].disabled, properties[name].required, pattern, properties[name].onError);
        case "relation":
          return this.renderRelation(name, entry[name], entry.ID, properties[name].options, properties[name].display);
        case "formular":
            let formular = entry[name] ?entry[name].replace(/this/g,"entry"):'';
            return omo.html`
                <div class="formular">
                    <p>${eval('`'+formular+'`')}</p>
                    ${this.renderInput(properties[name].type, name, entry[name], entry.ID, properties[name].disabled, properties[name].required, pattern, properties[name].onError)}
                </div>
            `;
        default:
          return this.renderInput("text", name, entry[name], entry.ID, properties[name].disabled, properties[name].required, pattern, properties[name].onError);
      }
    }

    renderRelation(name, value, id, options, display) {
      console.log("RENDER RELATION", value)
      console.log(options);
      return omo.html `
      <select data-name="${name}" data-id="${id}" @change="${(e) => { this.selectChanged(e);}}">
        <option value="">Bitte ${name} auswählen</option>
        ${
          options.map(option=>omo.html`
            <option value="${option.ID}" ?selected="${value && value.id==option.ID}">${option[display] ? option[display] :  option.ID}</option>
          `)
        }
      </select>
      `
    }

    async selectChanged(event) {
      let target = event.target;
      let index = target.selectedIndex;
      let foreignId = target.options[index].value;
      let itemId = target.dataset.id;
      let name = target.dataset.name;

      let entity = (await omo.client.modelFindByID(omo.storeId, this.quantConstructor._modelName, itemId)).entity;
      if (foreignId == "")
        delete entity[name];
      else
        entity[name] = {
          id: foreignId
        };
      await omo.client.modelSave(omo.storeId, this.quantConstructor._modelName, [entity]);
      console.log("Model Saved", entity);
    }

    renderAdd() {
      return window.omo.html `<tr><td class="px-4 py-2"><button class="border text-green-400 border-green-400 rounded-full px-2" @click="${this.createNew}">add row</button></td></tr>`;
    }

    async createNew() {
      var instance = new this.quantConstructor();
      await instance.initAsync();
      await this.updateTable();
      this.focusId(instance.entityId);
    }

    async duplicate(event) {
      var entity = (await omo.client.modelFindByID(omo.storeId, this.quantConstructor._modelName, event.target.dataset["id"])).entity;
      entity.ID = null;
      var newEntity = (await omo.client.modelCreate(omo.storeId, this.quantConstructor._modelName, [entity])).entitiesList[0];
      await this.updateTable();
      this.focusId(newEntity.ID);
    }

    focusId(entityId) {
      var input = this._root.querySelector(`input[data-id='${entityId}']:not([disabled])`);
      input.focus();
    }

    renderActions(id) {
      return id != undefined ? window.omo.html `
        <div class="py-1 px-2">
          <button class="border text-red-400 border-red-400 rounded-full px-2" @click="${this.delete}" data-id="${id}">delete</button>
          <!-- <button class="border text-green-400 border-green-400 rounded-full px-2" @click="${this.duplicate}" data-id="${id}">duplicate</button> -->
        </div>` :
        window.omo.html `<span></span>`
    }

    async delete(event) {
      console.log(event.target)
      await omo.client.modelDelete(omo.storeId, this.quantConstructor._modelName, [event.target.dataset["id"]]);
      await this.updateTable();
    }

    renderInput(type, name, value, id, disabled = false, required = false, pattern = "", error = "") {
      if (value == undefined) value = null;
      return window.omo.html `
        <input name="${name}" type="${type}" placeholder="${name}" pattern="${pattern}" .value="${value}" ?disabled="${disabled}" ?required="${required}" data-id="${id}"  @change="${this.changed}" @focus="${this.updatePreview}" data-error="${error}">
      `
    }

    async changed(event) {

      let target = event.target;
      target.setCustomValidity("");
      if (!target.checkValidity()) {
        target.setCustomValidity(target.dataset.error);
        target.reportValidity();
        return;
      }


      let name = target.name;
      let value = target.value;
      if (target.type == "checkbox") value = target.checked;
      if (target.type == "number") value = Number(value);

      let entity = (await omo.client.modelFindByID(omo.storeId, this.quantConstructor._modelName, target.dataset["id"])).entity;
      entity[name] = value;
      await omo.client.modelSave(omo.storeId, this.quantConstructor._modelName, [entity]);
      console.log("Model Saved", entity);
    }

    // updatePreview(event){
    //   let entityId = event.target.dataset["id"];
    //   let div = this._root.getElementById("preview");
    //   div.innerText="";

    //   let quant = new this.quantConstructor();
    //   quant.entityId = entityId;
    //   quant.initAsync();
    //   div.append(quant);
    // }


    static get model() {
      return {
        active: {
          type: "string"
        },
        table: {
          type: "object"
        }
      };
    }

    static get properties() {
      return super.properties;
    }
    async initAsync() {
      super.initAsync();
    }


  }
);