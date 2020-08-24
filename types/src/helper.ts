import $RefParser from "@apidevtools/json-schema-ref-parser";
import fs from "fs";
import path from "path";

export type FsNode = {
    name: string
    path: string
    contents?: FsNode[]
}

export class Helper
{
    public static readDirectory(dir: string, fileList: FsNode[] = [])
    {
        fs.readdirSync(dir).forEach(file =>
        {
            const filePath = path.join(dir, file)

            if (fs.statSync(filePath).isDirectory())
            {
                fileList.push({
                    name: file,
                    path: filePath,
                    contents: Helper.readDirectory(filePath)
                });
            }
            else
            {
                fileList.push({
                    name: file,
                    path: filePath
                });
            }
        });
        return fileList
    }

    public static $RefParserOptions(definitions: { jsonSchema: object, schemaId: string }[])
    {
        const definitionLookup: { [id: string]: string } = {};
        definitions.forEach(d =>
        {
            definitionLookup[d.schemaId] = JSON.stringify(d.jsonSchema);
        });

        const refOptions: $RefParser.Options = {
            resolve: {
                file: {
                    canRead: file => decodeURI(file.url).startsWith("abis-schema://"),
                    read: async (file: $RefParser.FileInfo) =>
                    {
                        const decodedUrl = decodeURI(file.url);
                        let schemaEntry = definitionLookup[decodedUrl];
                        if (!schemaEntry)
                        {
                            const uri = decodedUrl.replace("#", "");
                            schemaEntry = definitionLookup[uri];
                        }
                        if (!schemaEntry)
                        {
                            throw new Error(`Couldn't resolve schema $id '${decodeURI(decodedUrl)}'`)
                        }

                        return schemaEntry;
                    }
                }
            }
        };

        return refOptions;
    }

    public static recursiveFlatMap<T>(contents: T[], f: (o:T) => T[], flat:T[] = []) : T[]
    {
        contents.forEach(o =>
        {
            const children = f(o);
            children.forEach(c => flat.push(c));
            this.recursiveFlatMap(children, f, flat);
        });

        return flat;
    }
}