import $RefParser from "@apidevtools/json-schema-ref-parser";
import {compile} from 'json-schema-to-typescript'
import * as fs from "fs";
import {FsNode, Helper} from "./helper";
import path from "path";

const propertiesToObject = (obj:any) => {
    return Object.keys(obj).map(prop => {
        return {
            key: prop,
            value: obj[prop]
        };
    }).filter(o => o.value);
};

async function compileJsonSchemaToTS(
    refParserOptions: $RefParser.Options,
    schema:{id: string, file: FsNode, jsonSchema: object},
    schemaKey?: string)
{
    const allInterfaces:{interface:string,tsPath: string,schema:{id:string, file:FsNode, jsonSchema:object}}[] = [];
    const srcDir = path.dirname(schema.file.path);
    const generatedDir = path.join(srcDir, "_generated");

    if (!fs.existsSync(generatedDir))
    {
        console.log(`   Compile target directory '${generatedDir}' doesn't exist yet. Creating it ..`);
        fs.mkdirSync(generatedDir);
    }

    const dstPath = generatedDir + schema.file.path
            .replace(srcDir, "")
            .replace(".jsonschema", "")
        + ".ts";

    console.log(`   Compiling '${schema.id}' to '${dstPath}'.`);

    delete (<any>schema.jsonSchema).title;
    let typescriptCode = await compile(schema.jsonSchema, dstPath, {
        $refOptions: refParserOptions
    });

    const insertJsonSchemaIdRegex = `export\\s*interface\\s*(\\w*)\\s*{`;
    const matchResult = typescriptCode.match(insertJsonSchemaIdRegex);

    if (matchResult && matchResult[1])
    {
        let replacement = `export interface ${matchResult[1]} {\n   _$schemaId: "${schema.id}";\n`;
        if (schemaKey)
        {
            replacement = `export interface ${matchResult[1]} {\n   _$schemaId: ${schemaKey};\n`;
        }
        typescriptCode = typescriptCode.replace(`export interface ${matchResult[1]} {`, replacement);
    }

    const matchTypeDeclarationRegex = `export type\\s*(\\w*) =\\s*{`;
    const matchTypeDeclarationResult = typescriptCode.match(matchTypeDeclarationRegex);
    if (matchTypeDeclarationResult || !matchResult)
    {
        throw new Error(`The jsonschema file '${schema.file.path}' could not be compiled to a typescript 'interface' but only to a 'type'. Make sure that the jsonschma contains own properties on the root level (instead of '$ref's only).`);
    }

    allInterfaces.push({
        schema: schema,
        tsPath: dstPath,
        interface: matchResult[1]
    });

    fs.writeFileSync(dstPath, typescriptCode)
    return allInterfaces;
}

const main = async () =>
{
    const inDir = process.argv[2];

    const directory = Helper.readDirectory(inDir);
    const schemaHash:{[id:string]:{id:string, file:FsNode, jsonSchema:object}} = {};
    const schemaArray:{id:string, file:FsNode, jsonSchema:object}[] = [];

    console.log(`Parsing the contents of '${inDir}' ..`);

    directory.forEach(appDirectory =>
    {
        console.log(`Parsing the contents of '${appDirectory.path}' ..`);

        const appTypePrefix = `abis-schema://${appDirectory.name}@abis.internal/types`;
        const appTypes = appDirectory.contents?.find(o => o.name == "types");

        if (appTypes && appTypes.contents)
        {
            console.log(`Parsing the contents of '${appTypes.path}' ..`);

            const flatTypes = Helper.recursiveFlatMap<FsNode>(appTypes.contents, o => o.contents ?? [])
                                .filter(o => o?.name.endsWith(".jsonschema"));

            flatTypes?.forEach(typeFile =>
            {
                if (!typeFile)
                    return;

                console.log(`Parsing the contents of '${typeFile.path}' ..`);
                const typeFileContents = fs.readFileSync(typeFile.path);

                const jsonSchema = JSON.parse(typeFileContents.toString());

                if (!jsonSchema.$id || !jsonSchema.$schema) {
                    throw new Error(`*.jsonschema file '${typeFile.path}' either doesn't contain a '$id' or '$schema' property.`)
                }

                const existingSchema = schemaHash[jsonSchema.$id];
                if (existingSchema) {
                    throw new Error(`*.jsonschema file '${typeFile.path}' declares a '$id' that has already been used by '${existingSchema.file.path}': ${(<any>existingSchema.jsonSchema).$id}.`)
                }

                const pathRelativeToTypes = typeFile.path.replace(appTypes.path, "").replace(".jsonschema", "");
                const uriWithoutPrefix = jsonSchema.$id.replace(appTypePrefix, "");
                if (pathRelativeToTypes != uriWithoutPrefix)
                {
                    const expectedLocation = path.join(appTypes.path, uriWithoutPrefix + ".jsonschema");
                    throw new Error(`The $id of the *.jsonschema file '${typeFile.path}' doesn't correspond with its location in the source tree. The expected location would have been: ${expectedLocation}`);
                }

                console.log(`   Found schema '${jsonSchema.$id}'`)

                const schemaEntry = {
                    id: jsonSchema.$id,
                    file: typeFile,
                    jsonSchema: jsonSchema
                };
                schemaHash[jsonSchema.$id] = schemaEntry;
                schemaArray.push(schemaEntry);
            });
        }

        const appAgents = appDirectory.contents?.find(o => o.name == "agents");
        if (appAgents)
        {
            const appSingletonAgents = appAgents.contents?.find(o => o.name == "singleton");
            if (appSingletonAgents)
            {
            }

            const appCompanionAgents = appAgents.contents?.find(o => o.name == "companion");
            if (appCompanionAgents)
            {
            }
        }
    });

    console.log(`Checking if all $ref elements point to a known schema ..`);

    schemaArray.forEach(schema =>
    {
        const invalidRefs = Helper.recursiveFlatMap(propertiesToObject([schema]), o =>
            (typeof o.value) == "object"
                ? propertiesToObject(o.value)
                : [])
            .filter(o => o.key == "$ref")
            .map(o => o.value)
            .filter(o => !(schemaHash[o]));

        if (invalidRefs.length > 0) {
            throw new Error(`Schema file ${schema.file.path} contains the following invalid $ref-elements: ${invalidRefs.join(", ")}`);
        }
    });

    console.log(`OK`);

    console.log(`Compiling *.jsonschema to typescript ..`);

    const refParserOptions = Helper.$RefParserOptions(schemaArray.map(o =>
    {
        return {
            schemaId: o.id,
            jsonSchema: o.jsonSchema
        }
    }));


    const allInterfaces:{interface:string,schema:{id:string, file:FsNode, jsonSchema:object}}[] = [];
    for (let schemasKey in schemaHash)
    {
        const schema = schemaHash[schemasKey];
        const compiledInterfaces = await compileJsonSchemaToTS(refParserOptions, schema);
        compiledInterfaces.forEach(o => allInterfaces.push(o));
    }

    console.log(`OK`);

    console.log(`Generating discriminated union types ..`);

    const imports = allInterfaces.map(iface =>
    {
        const relativeToInDir = iface.schema.file.path.replace(inDir, "");
        const importPath = path.dirname(relativeToInDir);
        const importFile = iface.schema.file.path.replace(inDir, "").replace(importPath + "/", "").replace(".jsonschema", "");
        return `import {${iface.interface}} from "../${importPath}/_generated/${importFile}";`;
    }).join(`\n`);

    // TODO: watch out for types with the same name
    const discriminatorEnum = `export enum SchemaTypes {\n${allInterfaces.map(o => `    ${o.interface} = "${o.schema.id}"`).join(`,\n`)} \n}`;
    const unionType = `export type SchemaType = ${allInterfaces.map(o => o.interface).join(`\n    | `)};`;

    const generatedDir = path.join(inDir, "_generated");
    if (!fs.existsSync(generatedDir)){
        console.log(`   Compile target directory '${generatedDir}' doesn't exist yet. Creating it ..`);
        fs.mkdirSync(generatedDir);
    }
    fs.writeFileSync(generatedDir + "/schemaType.ts", `${imports}\n\n${unionType}`);
    fs.writeFileSync(generatedDir + "/schemaTypes.ts", `${discriminatorEnum}`);

    console.log(`OK`);

    for (let compiledInterface of allInterfaces)
    {
        const newCompileArtifact = await compileJsonSchemaToTS(refParserOptions, compiledInterface.schema, `SchemaTypes.${compiledInterface.interface}`);
        const pathToSchemaTypes = path.dirname(newCompileArtifact[0].tsPath)
            .replace(inDir, "")
            .split("/")
            .map(o => "..")
            .join("/");
        const tsCode = `import { SchemaTypes } from "${pathToSchemaTypes}/_generated/schemaTypes";\n\n` +  fs.readFileSync(newCompileArtifact[0].tsPath).toString();
        fs.writeFileSync(newCompileArtifact[0].tsPath, tsCode);
    }
};

main();