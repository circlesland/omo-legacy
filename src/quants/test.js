omo.quant(
  class Test extends omo.quanta.Quant {

    static get styles() {
      return [
        omo.normalize,
        omo.css`
        :host{
          display:grid;
          grid-template-columns: 1fr 3fr;
          grid-template-rows: auto; 
          grid-column-gap: 10px;
          height:100%;
        }
        .left{
          display:flex;
          flex-direction:column;
        }
       a{
         padding: 1em 0;
         text-align:center;
          color:blue;
          cursor:pointer;
        }
         a:hover{
          text-decoration:underline;
        }

        .right{
          border-left: 1px solid darkgrey;
          padding-left: 1em;
          overflow:auto;
        }
        .row{
          display:flex;
          align-items:center;
          border:solid 1px gray;
        }
        .row * + *{
          margin-left:1em;
        }
        .row +.row{
          margin-top:1em;
        }

        `
      ];
    }

    render() {
      return omo.html`
        <div class="left">
          <a @click="${this.tasksClicked}">Tasks</a>
          <a @click="${this.personsClicked}">Persons</a>
        </div>
        <div class="right">
          ${
          this.activeView == "persons"
          ? omo.html`<h1>Personen</h1>${this.persons.map(
          p => omo.html`
          <div class="row" data-id="${p.ID}">
            <input @keyup="${this.personChanged}" value="${p.name}" />
          </div>
          `,
          this
          )}<div class="row">neu <input @keyup="${this.keyUp}">`
            : ""
            }
            ${
            this.activeView == "tasks"
            ? omo.html`<h1>Tasks</h1>${this.tasks.map(
            t =>
            omo.html`<div class="row" data-id="${
                        t.ID
                        }"><input type="checkbox" ?checked="${t.state}" @change="${(
                          e
                        ) => {
                          this.changed(e);
                        }}" />
              <input @keyup="${this.taskChanged}" value="${t.name}" />
              <select @change="${(e) => {
                          this.selectChanged(e);
                        }}">
                <option value="">Bitte auswählen</option>
                ${this.persons.map(
                p =>
                omo.html`<option value="${p.ID}" ?selected="${
                              t.assigned == undefined ? false : t.assigned.ID == p.ID
                              }">${p.name}</option>`,
                this
                )}
              </select>`,
              this
              )}
            </div>
            <div class="row">neu <input @keyup="${this.keyUp}">`
              : ""
              }
            </div>
      `;
    }

    static get properties() {
      return {
        activeView: {
          type: "string"
        },
        tasks: {
          type: "array"
        },
        persons: {
          type: "array"
        }
      };
    }

    constructor() {
      super();
      this.activeView = "tasks";
      this.schema = {
        $schema: "http://json-schema.org/draft-04/schema#",
        $ref: "#/definitions/task",
        definitions: {
          task: {
            required: ["ID", "name", "state"],
            properties: {
              ID: {
                type: "string"
              },
              state: {
                type: "boolean"
              },
              name: {
                type: "string"
              },
              assigned: {
                $ref: "#/definitions/person",
                type: "object"
              }
            },
            additionalProperties: false,
            type: "object"
          },
          person: {
            required: ["ID", "name"],
            properties: {
              ID: {
                type: "string"
              },
              name: {
                type: "string"
              }
            },
            additionalProperties: false,
            type: "object"
          }
        }
      };
      this.schemaPerson = {
        $schema: "http://json-schema.org/draft-04/schema#",
        $ref: "#/definitions/person",
        definitions: {
          person: {
            required: ["ID", "name"],
            properties: {
              ID: {
                type: "string"
              },
              name: {
                type: "string"
              }
            },
            additionalProperties: false,
            type: "object"
          }
        }
      };
      this.tasks = [];
      this.persons = [];
    }

    personsClicked() {
      this.activeView = "persons";
    }
    tasksClicked() {
      this.activeView = "tasks";
    }
    async changed(e) {
      let target = e.target;
      let id = target.parentNode.dataset.id;
      let entity = await omo.client.modelFindByID(
        omo.storeId,
        "tasks",
        id
      );
      entity.entity.state = target.checked;
      await omo.client.modelSave(omo.storeId, "tasks", [
        entity.entity
      ]);
      // this.updateTasks();
    }

    async selectChanged(e) {
      let target = e.target;
      let index = target.selectedIndex;
      let personId = target.options[index].value;
      let taskId = target.parentNode.dataset.id;
      let task = await omo.client.modelFindByID(
        omo.storeId,
        "tasks",
        taskId
      );
      let person = await omo.client.modelFindByID(
        omo.storeId,
        "person",
        personId
      );
      task.entity.assigned = person.entity;
      await omo.client.modelSave(omo.storeId, "tasks", [
        task.entity
      ]);
    }

    async addTask(name, state) {
      console.log("addtask");
      // for (let i = 0; i < 10000; i++)
      await omo.client.modelCreate(omo.storeId, "tasks", [
        {
          name: name,//+ "_" + i,
          state: state
        }
      ]);
    }

    async addPerson(name) {
      console.log("addperson");

      await omo.client.modelCreate(omo.storeId, "person", [
        {
          name: name
        }
      ]);
      // this.updatePersons();
    }

    keyUp(event) {
      if (event.key === "Enter") {
        if (this.activeView == "tasks") this.addTask(event.target.value, false);
        else this.addPerson(event.target.value);
        event.target.value = "";
      }
    }

    async personChanged(event) {
      if (event.key === "Enter") {
        let target = event.target;
        let person = await omo.client.modelFindByID(
          omo.storeId,
          "person",
          target.parentNode.dataset.id
        );
        person.entity.name = target.value;
        await omo.client.modelSave(omo.storeId, "person", [
          person.entity
        ]);
      }
    }

    async taskChanged(event) {
      if (event.key === "Enter") {
        let target = event.target;
        let task = await omo.client.modelFindByID(
          omo.storeId,
          "tasks",
          target.parentNode.dataset.id
        );
        task.entity.name = target.value;
        await omo.client.modelSave(omo.storeId, "tasks", [
          task.entity
        ]);
      }
    }

    async initAsync() {
      try {
        await omo.client.registerSchema(
          omo.storeId,
          "tasks",
          this.schema
        );
        console.log("taskregistered");

        await omo.client.registerSchema(
          omo.storeId,
          "person",
          this.schemaPerson
        );
        console.log("personregistered");
      } catch (e) {
        if (e.message != "already registered model") throw e;
      }

      await omo.client.start(omo.storeId);
      await omo.client.listen(
        omo.storeId,
        "tasks",
        "",
        this.updateTasks.bind(this)
      );
      await omo.client.listen(
        omo.storeId,
        "person",
        "",
        this.updatePersons.bind(this)
      );
      this.updateTasks(null);
      this.updatePersons(null);
    }

    async updateTasks(e) {
      console.log("tasks", e);
      this.tasks = (
        await omo.client.modelFind(omo.storeId, "tasks", {})
      ).entitiesList;
    }
    async updatePersons(e) {
      console.log("persons", e);
      this.persons = (
        await omo.client.modelFind(omo.storeId, "person", {})
      ).entitiesList;
    }
  }
);
