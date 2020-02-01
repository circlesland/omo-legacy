import Quant from './Quant';

export default class DataInterface extends Quant {
  get modelName(): string {
    return this.constructor._modelName;
  }
  get _model(): any {
    return this.constructor.schemaProperties;
  }

  get entityId(): string {
    return this.ID;
  }
  set entityId(value) {
    this.ID = value;
  }

  static get model(): any {
    return {
      ID: {
        required: true,
        type: 'string'
      }
    };
  }

  static get jsonProperties(): any {
    const properties = DataInterface.recursiveModel(this);

    Object.keys(properties).map((key: any) => {
      const item = properties[key];
      properties[key] = item;
    });

    return properties;
  }

  // tslint:disable-next-line: variable-name
  public static _modelName: any;
  // tslint:disable-next-line: variable-name
  public static _model: any;
  public static viewModel: any;

  public static async Init(): Promise<void> {
    this._model = DataInterface.recursiveModel(this);
    this.schemaProperties = await this.createSchemaProperties(this._model);
    const jsonSchema = this.createJsonSchema(this.schemaProperties);
    this._modelName = await DataInterface.getModelName(jsonSchema);
    await DataInterface.registerSchemaIfNoRegistered(
      jsonSchema,
      this._modelName
    );
  }

  public static async registerSchemaIfNoRegistered(
    jsonSchema: any,
    modelName: string
  ): Promise<void> {
    try {
      await window.omo.client.registerSchema(
        window.omo.storeId,
        modelName,
        jsonSchema
      );
    } catch (err) {
      if (err.message !== 'already registered model') {
        throw err;
      }
    }
  }

  public static async getModelName(jsonSchema: any): Promise<string> {
    // Modelname is the content hash of the model of quant
    const hashJsonSchemaResult = await window.omo.ipfs.add(
      JSON.stringify(jsonSchema),
      { onlyHash: true }
    );
    return hashJsonSchemaResult[0].hash;
  }

  public static createSchemaProperties(model: any): any {
    const schemaProperties = JSON.parse(JSON.stringify(model));
    Object.keys(schemaProperties).map((key: any) => {
      const item = schemaProperties[key];

      if (item.type === 'property') {
        delete schemaProperties[key];
        return;
      }

      // Handle Relations
      if (item.type === 'relation') {
        item.type = 'object';
        item.$ref = '#/definitions/relation';
      }

      if (item.type === 'date') {
        item.type = 'string';
      }
      if (item.type === 'email') {
        item.type = 'string';
      }
      if (item.type === 'password') {
        item.type = 'string';
      }
      if (item.type === 'file') {
        item.type = 'string';
      }
      if (item.type === 'color') {
        item.type = 'string';
      }
      if (item.type === 'datetime-local') {
        item.type = 'string';
      }
      if (item.type === 'month') {
        item.type = 'string';
      }
      if (item.type === 'url') {
        item.type = 'string';
      }
      if (item.type === 'week') {
        item.type = 'string';
      }
      if (item.type === 'search') {
        item.type = 'string';
      }
      if (item.type === 'tel') {
        item.type = 'string';
      }
      if (item.type === 'formular') {
        item.type = 'string';
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
    // TODO Generate a valid JSONSchema out of quant model
    return schemaProperties;
  }

  public static createJsonSchema(schemaProperties: any): any {
    const schema = {
      $ref: `#/definitions/${this.name}`,
      $schema: 'http://json-schema.org/draft-04/schema#',
      definitions: {}
    };
    schema.definitions[this.name] = {
      additionalProperties: false,
      properties: schemaProperties,
      required: Object.keys(this._model).filter(
        key => this._model[key].required
      ),
      type: 'object'
    };

    // If any property is relation add relation definition
    if (
      Object.values(schemaProperties).some(
        (item: any) => item.$ref === '#/definitions/relation'
      )
    ) {
      schema.definitions['relation'] = {
        additionalProperties: false,
        properties: { id: { type: 'string' } },
        required: ['id'],
        type: 'object'
      };
    }

    return schema;
  }
  public ID: any;

  public async initAsync(): Promise<void> {
    await super.initAsync();
    await this.constructor.Init();
    await this.createEntityIfNotExist();
    this.startListenForDataChanges();
  }

  public async createEntityIfNotExist(): Promise<void> {
    if (
      this.entityId === undefined ||
      this.entityId === '' ||
      !window.omo.client.modelHas(window.omo.storeId, this.modelName, [
        this.entityId
      ])
    ) {
      let entity: any = {};
      Object.keys(this._model).forEach(key => {
        if (this._model[key].type !== 'property') {
          entity[key] = this[key];
        }
      });
      entity = (
        await window.omo.client.modelCreate(
          window.omo.storeId,
          this.modelName,
          [entity]
        )
      ).entitiesList[0];
      this.entityId = entity.ID;
    }
    this.updateModel({ entity: { ID: this.entityId } });
  }

  public startListenForDataChanges(): void {
    window.omo.client.listen(
      window.omo.storeId,
      this.modelName,
      this.entityId,
      this.updateModel.bind(this)
    );
  }

  public async updateModel(result: any): Promise<void> {
    // TODO remove next line when textile fixed pubsub for listen changes on threads
    // if (result.entity.ID !== this.entityId) { return; }
    // tslint:disable-next-line: no-parameter-reassignment
    result = await window.omo.client.modelFindByID(
      window.omo.storeId,
      this.modelName,
      this.entityId
    );
    // TODO END
    Object.keys(result.entity).forEach(key => {
      if (this[key] !== result.entity[key]) {
        this[key] = result.entity[key];
      }
    });
  }

  public updated(changedProperties: any): void {
    super.updated(changedProperties);
    changedProperties.forEach((_oldValue, propName) => {
      switch (propName) {
        case "ID":
          this.updateModel({ entity: { ID: this.entityId } });
          break;
        default:
          if (this.autosave) {
            this.saveModel();
          }
      }
    });
  }

  public async saveModel(): Promise<void> {
    if (!this.initialized) {
      return;
    }
    if (this._model === undefined) {
      return;
    }

    const model = {};
    Object.keys(this._model).forEach(key => {
      model[key] = this[key];
    });

    if (Object.values(model).some(val => val !== undefined)) {
      window.omo.client.modelSave(
        window.omo.storeId,
        this.constructor._modelName,
        [model]
      );
    }
  }
}
