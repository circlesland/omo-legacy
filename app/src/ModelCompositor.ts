import {Component} from "./interfaces/component";
import {Property} from "./interfaces/manifest";
import {Adapter} from "@omo/textile-graphql/dist/adapter";
import {OmoRuntime} from "./omoRuntime";

export class ModelCompositor
{
  async fromRoot(blockName: string): Promise<Component>
  {
    const block = await ModelCompositor.findBlockByName(blockName, (await OmoRuntime.get()).textile);
    if (!block)
      throw new Error("Couldn't find a block with the name '" + blockName + "'");

    let generatedRoot: any = null;

    const stack: { parent: any, current: any }[] = [{parent: undefined, current: block}];
    while (stack.length > 0)
    {
      const currentBlock = stack.pop();
      if (!currentBlock)
        throw new Error("An item from the stack was 'undefined'");

      const workingObject:Component = {
        component: {
          name: currentBlock.current.component.name,
          properties: currentBlock.current.component.properties
        },
        children: [],
        area: currentBlock.current.area,
        data: await this.findData(currentBlock.current.component.properties)
      };

      if (!generatedRoot)
      {
        generatedRoot = workingObject;
      }

      if (currentBlock.parent)
      {
        currentBlock.parent.children.push(workingObject);
      }

      if (currentBlock.current.layout)
      {
        workingObject.layout = {
          areas: currentBlock.current.layout.areas,
          columns: currentBlock.current.layout.columns,
          rows: currentBlock.current.layout.rows
        }
      }

      if (currentBlock.current.children && currentBlock.current.children.length > 0)
      {
        await Promise.all(currentBlock.current.children.map(async (child: any) =>
        {
          const childBlock = await ModelCompositor.findBlockById(child._id, (await OmoRuntime.get()).textile);
          stack.push({parent: workingObject, current: childBlock});
        }));
      }
    }

    return generatedRoot;
  }

  private strReplaceAll(str:string, search:string, replacement:string) {
    return str.split(search).join(replacement);
  };

  private async findData(properties:Property[])
  {
    const propertyIdValueMap: {[propertyId:string]:any} = {};
    const propertyNameValueMap: {[propertyName:string]:any} = {};
    properties.forEach(p => propertyIdValueMap[p._id] = {});

    const query = "PropertyValues {_id property {_id name schema isOptional} value}";
    const allPropertyValues = (<any>(await (await OmoRuntime.get()).graphQL.query(query)).data).PropertyValues;
    allPropertyValues.forEach((propertyValue:any) => {
      if (propertyIdValueMap[propertyValue.property._id]) {
        propertyNameValueMap[propertyValue.property.name] = JSON.parse(this.strReplaceAll(propertyValue.value, "\\\"", ""));
      }
    });

    return propertyNameValueMap;
  }

  public static readonly allBlocksQuery = 'Blocks {' +
  '_id name area component {' +
  '   _id name properties {' +
  '     _id name schema isOptional' +
  '   }' +
  '} ' +
  'children {' +
  '   _id name area component { ' +
  '       _id name properties {' +
    '       _id name schema isOptional' +
    '   }' +
  '   } ' +
  '}' +
  'layout { ' +
  '       _id name areas columns rows ' +
  '   }' +
  '}';

  public static async findBlockById(blockId: string, textile:Adapter) : Promise<Component|undefined>
  {
    const root = await textile.graphQL.query(ModelCompositor.allBlocksQuery);
    const foundBlock = (<any>root.data).Blocks.find((o: any) => o._id === blockId); // TODO: This should be done by the query. WTF?
    console.log("findBlockById(" + blockId + "):", foundBlock);

    return foundBlock;
  }

  public static async findBlockByName(blockName: string, textile:Adapter) : Promise<Component|undefined>
  {
    const root = await textile.graphQL.query(ModelCompositor.allBlocksQuery);
    const foundBlock = (<any>root.data).Blocks.find((o: any) => o.name === blockName); // TODO: This should be done by the query. WTF?
    console.log("findBlockByName(" + blockName + "):", foundBlock);

    return foundBlock;
  }
}
