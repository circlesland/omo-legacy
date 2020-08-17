import {Composition} from "./interfaces/composition";

export class ModelCompositor
{
    async fromRoot(blockName:string) : Promise<Composition> {
        const block = await this.findBlockByName(blockName);
        if (!block)
            throw new Error("Couldn't find a block with the name '" + blockName + "'");

        let generatedRoot:any = null;

        const stack:{parent:any, current:any}[] = [{parent:undefined, current:block}];
        while (stack.length > 0) {
            const currentBlock = stack.pop();
            if (!currentBlock)
                throw new Error("An item from the stack was 'undefined'");

            const workingObject = {
                layout: {},
                component: currentBlock.current.component.name,
                children: [],
                area: currentBlock.current.area
            };

            if (!generatedRoot) {
                generatedRoot = workingObject;
            }

            if (currentBlock.parent) {
                currentBlock.parent.children.push(workingObject);
            }

            if (currentBlock.current.layout) {
                workingObject.layout = {
                    areas: currentBlock.current.layout.areas,
                    columns: currentBlock.current.layout.columns,
                    rows: currentBlock.current.layout.rows
                }
            }

            if (currentBlock.current.children && currentBlock.current.children.length > 0) {
                await Promise.all(currentBlock.current.children.map(async (child:any) => {
                    const childBlock = await this.findBlockById(child._id);
                    stack.push({parent: workingObject, current: childBlock});
                }));
            }
        }

        return generatedRoot;
    }

    private async findBlockById(blockId:string) {
        const root = await window.o.graphQL.query(
            'Blocks {' +
            '_id name area component {' +
            '   _id name ' +
            '} ' +
            'children {' +
            '   _id name area component { ' +
            '       _id name ' +
            '   } ' +
            '}' +
            'layout { ' +
            '       _id name areas columns rows ' +
            '   }' +
            '}');
        const foundBlock = (<any>root.data).Blocks.find((o:any) => o._id === blockId); // TODO: This should be done by the query. WTF?
        console.log("findBlockById(" + blockId+ "):",foundBlock);

        return foundBlock;
    }

    private async findBlockByName(blockName:string) {
        const root = await window.o.graphQL.query(
            'Blocks {_id name area layout { _id name areas columns rows } component {_id name} children {_id name area component {_id name}}}');
        const foundBlock = (<any>root.data).Blocks.find((o:any) => o.name === blockName); // TODO: This should be done by the query. WTF?
        console.log("findBlockByName(" + blockName+ "):",foundBlock);

        return foundBlock;
    }
}
