import Quant from "./Quant";

export default class DataInterface extends Quant {
  static _modelName: any;
  static _model: any;
  ID: any;
  static viewModel: any;

  async initAsync() {
    await super.initAsync();
    await this.constructor.Init()
    await this.createEntityIfNotExist()
    this.startListenForDataChanges();
  }

  static async Init() {
    this._model = DataInterface.recursiveModel(this);
    this.schemaProperties = await this.createSchemaProperties(this._model);
    let jsonSchema = this.createJsonSchema(this.schemaProperties);
    console.log(jsonSchema);
    this._modelName = await DataInterface.getModelName(jsonSchema);
    await DataInterface.registerSchemaIfNoRegistered(jsonSchema, this._modelName);
  }

  get modelName() {
    return this.constructor._modelName;
  }
  get _model() {
    return this.constructor.schemaProperties;
  }

  async createEntityIfNotExist() {
    if (this.entityId == undefined || this.entityId == "" || !window.omo.client.modelHas(window.omo.storeId, this.modelName, [this.entityId])) {
      let entity: any = {};
      Object.keys(this._model).forEach(key => {

        if (this._model[key].type != "property") {
          entity[key] = this[key];
        }
      })
      console.log("defaultent", entity)
      entity = (await window.omo.client.modelCreate(window.omo.storeId, this.modelName, [entity])).entitiesList[0];
      this.entityId = entity.ID;
    }
    this.updateModel({ entity: { ID: this.entityId } });
  }

  startListenForDataChanges() {
    window.omo.client.listen(window.omo.storeId, this.modelName, this.entityId, this.updateModel.bind(this))
  }

  async updateModel(result: any) {
    // TODO remove next line when textile fixed pubsub for listen changes on threads
    // if (result.entity.ID !== this.entityId) { return; }
    result = await window.omo.client.modelFindByID(window.omo.storeId, this.modelName, this.entityId);
    // TODO END
    Object.keys(result.entity).forEach(key => {
      if (this[key] != result.entity[key]) {
        this[key] = result.entity[key];
      }
    })

  }

  updated(/*changedProperties: any*/) {
    if (this.autosave) {
      this.saveModel();
    }
  }

  async saveModel() {
    if (this._model === undefined) {
      return;
    }

    let model = {};
    Object.keys(this._model).forEach(key => {
      model[key] = this[key];
    });

    if (Object.values(model).some(val => val !== undefined)) {
      window.omo.client.modelSave(window.omo.storeId, this.constructor._modelName, [model]);

    }


  }


  static async registerSchemaIfNoRegistered(jsonSchema: any, modelName: string) {
    try {
      await window.omo.client.registerSchema(
        window.omo.storeId,
        modelName,
        jsonSchema
      );
    } catch (err) {
      if (err.message != "already registered model") {
        throw err;
      }
    }
  }

  static async getModelName(jsonSchema: any) {
    // Modelname is the content hash of the model of quant
    let hashJsonSchemaResult = await window.omo.ipfs.add(JSON.stringify(jsonSchema), { onlyHash: true });
    return hashJsonSchemaResult[0].hash;
  }

  get entityId() {
    return this.ID;
  }
  set entityId(value) {
    this.ID = value;
  }

  static get model() {
    return {
      ID: {
        type: "string",
        required: true
      }
    };
  }

  static createSchemaProperties(model: any) {
    let schemaProperties = JSON.parse(JSON.stringify(model));
    Object.keys(schemaProperties).map(function (key: any) {
      let item = schemaProperties[key];

      if (item.type == "property") {
        console.log("property");
        delete schemaProperties[key];
        return;
      }

      //Handle Relations
      if (item.type == "relation") {
        item.type = "object";
        item.$ref = "#/definitions/relation";
      }

      if (item.type == "date") {
        item.type = "string";
      }
      if (item.type == "email") {
        item.type = "string";
      }
      if (item.type == "password") {
        item.type = "string";
      }
      if (item.type == "file") {
        item.type = "string";
      }
      if (item.type == "color") {
        item.type = "string";
      }
      if (item.type == "datetime-local") {
        item.type = "string";
      }
      if (item.type == "month") {
        item.type = "string";
      }
      if (item.type == "url") {
        item.type = "string";
      }
      if (item.type == "week") {
        item.type = "string";
      }
      if (item.type == "search") {
        item.type = "string";
      }
      if (item.type == "tel") {
        item.type = "string";
      }
      if (item.type == "formular") {
        item.type = "string";
      }

      if (item.required) {
        delete item.required;
      }
      if (item.disabled) {
        delete item.disabled;
      }
      if (item.display) {
        delete item.display;
      }
      if (item.pattern) {
        delete item.pattern;
      }
      if (item.onError) {
        delete item.onError;
      }

      schemaProperties[key] = item;
    });
    //TODO Generate a valid JSONSchema out of quant model
    return schemaProperties;
  }

  static createJsonSchema(schemaProperties: any) {
    let schema = {
      $schema: "http://json-schema.org/draft-04/schema#",
      $ref: `#/definitions/${this.name}`,
      definitions: {}
    };
    schema.definitions[this.name] = {
      required: Object.keys(this._model).filter(key => this._model[key].required),
      properties: schemaProperties,
      additionalProperties: false,
      type: "object"
    };

    // If any property is relation add relation definition
    if (Object.values(schemaProperties).some((item: any) => item.$ref == "#/definitions/relation")) {
      schema.definitions["relation"] = {
        required: ["id"],
        properties: { id: { type: "string" } },
        additionalProperties: false,
        type: "object"
      }
    }

    return schema;
  }

  static get jsonProperties() {
    let properties = DataInterface.recursiveModel(this);

    Object.keys(properties).map(function (key: any) {
      let item = properties[key];

      // //Handle Relations
      // if (item.type == "relation") {
      //   item.quant = item.quant.;
      // }


      properties[key] = item;
    });






    return properties;
  }
  // static async foo(){
  //   let properties = this.jsonProperties;

  //   await Promise.all(Object.keys(properties).map(async(key) => {
  //     let prop = properties[key];
  //     if(prop.type == "relation"){
  //       prop.options = (await window.omo.client.modelFind(window.omo.storeId,prop.quant._modelName,{})).entitiesList;
  //     }
  //     properties[key]=prop;
  //   }))

  // }

  // static async bar(key:any,properties:any){

  // }
}