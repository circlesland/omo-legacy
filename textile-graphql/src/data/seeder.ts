import {JSONSchema} from "@textile/hub";
import {Block} from "../schema/block";
import {Component} from "../schema/component";
import {Layout} from "../schema/layout";
import {Action} from "../schema/action";
import {Property} from "../schema/property";
import {PropertyValue} from "../schema/propertyValue";
import {ActionInstance} from "../schema/actionInstance";

export interface SeedQuant
{
    name: string,
    schema: JSONSchema,
    data: any[]
}

interface Seed
{
    thread: {
        name: string,
        quanta: SeedQuant[]
    }
}

const seeds: Seed[] = [{
    thread: {
        name: "quanta", quanta: [
            {
                name: "Component",
                schema: Component,
                data: []
            },
            {
                name: "Layout",
                schema: Layout,
                data: []
            },
            {
                name: "Block",
                schema: Block,
                data: []
            },
            {
                name: "Action",
                schema: Action,
                data: []
            },
            {
                name: "ActionInstance",
                schema: ActionInstance,
                data: []
            },
            {
                name: "Property",
                schema: Property,
                data: []
            },
            {
                name: "PropertyValue",
                schema: PropertyValue,
                data: []
            }
        ]
    }
}];

export class Seeder
{
    async getSeed(threadName: string)
    {
        let thread = seeds.find(x => x.thread.name == threadName);
        console.log("Seeding:", thread);
        if (thread)
            return thread.thread.quanta;
        return [];
    }
}
