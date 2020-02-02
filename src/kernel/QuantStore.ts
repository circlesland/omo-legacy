import { Query } from "@textile/threads-client";
import QuantListener from "./QuantListener";
import CodeEditor from "./quants/CodeEditor";
import DragableQuant from "./quants/DragableQuant";
import Editor from "./quants/Editor";
import Designer from "../quants/earth/Designer";
import QuantaList from "../quants/earth/QuantaList";
import ContextSwitch from "../quants/earth/ContextSwitch";
import ViewsChooser from "../quants/earth/ViewsChooser";
import Data from "../quants/earth/Data";
import Actions from "../quants/earth/Actions";
import Versions from "../quants/earth/Versions";
import SplitView from "../quants/earth/SplitView";

export class QuantStore {
    public get QuantStoreId(): string { return "af8fd66c-3cbd-49b9-abbc-2811dc870388" }
    public QuantaModelName;
    public VersionModelName;
    public quanta: any;
    private listener: QuantListener;

    public async all(): Promise<any> {
        return (await omo.client.modelFind(this.QuantStoreId, this.QuantaModelName, {})).entitiesList;
    }
    private get quantaSchema(): any {
        return {
            "$id": "https://example.com/person.schema.json",
            "$schema": "http://json-schema.org/draft-07/schema#",
            "properties": {
                "ID": {
                    "type": "string"
                },
                "author": {
                    "type": "string"
                },
                "code": {
                    "type": "string"
                },
                "name": {
                    "type": "string"
                },
                "project": {
                    "type": "string"
                }
            },
            "title": "quanta",
            "type": "object",
        };
    }
    private get versionSchema(): any {
        return {
            "$id": "https://example.com/person.schema.json",
            "$schema": "http://json-schema.org/draft-07/schema#",
            "properties": {
                "ID": {
                    "type": "string"
                },
                "code": {
                    "type": "string"
                },
                "commitMessage": {
                    "type": "string"
                },
                "created": {
                    "type": "string"
                },
                "quant": {
                    "type": "string"
                },
                "versionName": {
                    "type": "string"
                }
            },
            "title": "quanta",
            "type": "object",
        };
    }
    public getMeta(quantname): any {
        return this.listener.getMeta(quantname);
    }
    public register($class: any, author: string, project: string, name: string, version: string): void {
        const versionName = version === undefined ? "latest" : version;
        this.createVersion(author, project, name, versionName);
        this.storeQuant(author, project, name, $class, versionName);
    }
    public get(author: string, project: string, name: string, version: string): any {
        const versionName = version === undefined ? "latest" : version;
        if (typeof (this.quanta[author][project][name][versionName]) === "function") {
            return this.quanta[author][project][name][versionName];
        }
        throw Error("Quant not loaded");
    }
    public async loadFromThreadByName(name: string): Promise<string> {
        const meta = this.listener.getMeta(name);
        return this.loadFromThread(meta.author, meta.project, meta.name, meta.version);
    }
    public async loadFromThread(author: string, project: string, name: string, version: string): Promise<string> {
        const query = new Query();
        this.andFilter(query, "author", author);
        this.andFilter(query, "project", project);
        this.andFilter(query, "name", name);
        let modelName = this.QuantaModelName;

        if (version !== "latest") {
            this.andFilter(query, "version", version);
            modelName = this.VersionModelName;
        }
        const result = await omo.client.modelFind(this.QuantStoreId, modelName, query);

        if (result.entitiesList.length > 1) {
            throw Error("Something went totally wrong");
        }

        if (result.entitiesList.length === 0) {
            throw Error("Quant is not in our database");
        }

        const quant = result.entitiesList[0];
        const response = await omo.ipfs.cat(quant.code);
        return response.toString();
    }
    public async initAsync(): Promise<void> {
        this.quanta = {};
        this.QuantaModelName = await omo.ipfs.add(JSON.stringify(this.quantaSchema), { onlyHash: true });
        this.VersionModelName = await omo.ipfs.add(JSON.stringify(this.versionSchema), { onlyHash: true });
        if (this.VersionModelName[0]) { this.VersionModelName = this.VersionModelName[0].hash; }
        if (this.QuantaModelName[0]) { this.QuantaModelName = this.QuantaModelName[0].hash; }

        try { await omo.client.registerSchema(this.QuantStoreId, this.QuantaModelName, this.quantaSchema); }
        catch (err) { if (err.message !== 'already registered model') { throw err; } }
        try { await omo.client.registerSchema(this.QuantStoreId, this.VersionModelName, this.versionSchema); }
        catch (err) { if (err.message !== 'already registered model') { throw err; } }


        // TODO remove Preload 
        this.storeQuant("omo", "earth", "quant", DragableQuant, "latest");
        this.storeQuant("omo", "earth", "editor", Editor, "latest");
        this.storeQuant("omo", "earth", "codeEditor", CodeEditor, "latest");
        this.storeQuant("omo", "earth", "splitView", SplitView, "latest");
        this.storeQuant("omo", "earth", "data", Data, "latest");
        this.storeQuant("omo", "earth", "actions", Actions, "latest");
        this.storeQuant("omo", "earth", "versions", Versions, "latest");
        this.storeQuant("omo", "earth", "contextSwitch", ContextSwitch, "latest");
        this.storeQuant("omo", "earth", "viewsChooser", ViewsChooser, "latest");
        this.storeQuant("omo", "earth", "quantaList", QuantaList, "latest");
        this.storeQuant("omo", "earth", "designer", Designer, "latest");

        this.listener = new QuantListener();
    }
    public async saveQuant(author: string, project: string, name: string, version: string, code: string, commitMessage: string): Promise<void> {
        const hash = await this.saveQuantToMFS(author, project, name, version, code);
        await this.CreateOrUpdateQuant(author, project, name, hash, version, commitMessage);
    }
    public async saveQuantToMFS(author: string, project: string, name: string, version: string, code: string): Promise<string> {
        const versionName = version === undefined ? "latest" : version;
        try { await omo.ipfs.files.mkdir(`/quanta`); } catch {/**/ }
        try { await omo.ipfs.files.mkdir(`/quanta/${author}`); } catch {/**/ }
        try { await omo.ipfs.files.mkdir(`/quanta/${author}/${project}`); } catch {/**/ }
        try { await omo.ipfs.files.mkdir(`/quanta/${author}/${project}/${name}`); } catch {/**/ }
        try { await omo.ipfs.files.mkdir(`/quanta/${author}/${project}/${name}/${versionName}`); } catch {/**/ }
        try { await omo.ipfs.files.rm(`/quanta/${author}/${project}/${name}/${versionName}/${name}`); } catch {/**/ }
        try { await omo.ipfs.files.write(`/quanta/${author}/${project}/${name}/${versionName}/${name}`, code, { create: true }); } catch {/**/ }
        return (await omo.ipfs.files.stat(`/quanta/${author}/${project}/${name}/${versionName}/${name}`)).hash;
    }
    public async CreateOrUpdateQuant(author: string, project: string, name: string, code: string, version: string, commitMessage: string): Promise<any> {
        let newVersion = {};
        let query = new Query();
        this.andFilter(query, "author", author);
        this.andFilter(query, "project", project);
        this.andFilter(query, "name", name);

        // Get latest Version
        const latestVersion = await omo.client.modelFind(this.QuantStoreId, this.QuantaModelName, query);
        if (latestVersion.entitiesList.length > 1) {
            throw Error("Something went totally wrong");
        }

        // If new quant 
        if (latestVersion.entitiesList.length === 0) {
            // store new quant
            let newQuant = { author, code, name, project };
            await omo.client.modelCreate(this.QuantStoreId, this.QuantaModelName, [newQuant]);

            // get new quant
            let storedQuant = await omo.client.modelFind(this.QuantStoreId, this.QuantaModelName, query);

            // create Version
            newVersion = { code, commitMessage, created: Date.now(), quant: storedQuant.entitiesList[0].ID, versionName: version };
            // store it to versions
            await omo.client.modelCreate(this.QuantStoreId, this.VersionModelName, [newVersion]);
        }

        // if latest exist 
        else {
            // if version == latest 
            if (version === "latest") {
                // Update latest version
                const toUpdate = latestVersion.entitiesList[0];
                toUpdate["code"] = code;
                await omo.client.modelSave(this.QuantStoreId, this.QuantaModelName, [toUpdate]);
            }
            // store Version to version thread
            newVersion = { code, commitMessage, created: Date.now(), quant: latestVersion.entitiesList[0].ID, versionName: version };
            await omo.client.modelCreate(this.QuantStoreId, this.VersionModelName, [newVersion]);
        }

        // Finally replace loaded Version or add version to DOM
        this.listener.ReplaceVersion(author, project, name, version, code);
    }

    public storeQuant(author: string, project: string, name: string, constructor: any, version: string): void {
        // TODO remove when ready with custom loading
        this.createVersion(author, project, name, version);

        // TODO ovveride Logic when custom elements can be deregistered
        this.quanta[author][project][name][version] = constructor;
        const quantName = this.getQuantName(author, project, name, version);
        window.customElements.define(quantName, constructor);
    }

    public getQuantName(author: string, project: string, name: string, version: string): string {
        const quantName = `${author.toLowerCase()}-${project.toCamelCase()}-${name.toLowerCase()}`;
        const versionName = version === undefined ? "latest" : version;
        return versionName !== "latest" ? quantName + `-${versionName}` : quantName;
    }

    private andFilter(query: Query, property: string, value: string): void {
        const criterion = query.and(property);
        criterion.value = { string: value };
        query.ands.push(criterion);
    }

    private createVersion(author: string, project: string, name: string, version: string): void {
        if (!this.quanta) {
            this.quanta = {};
        }
        if (!this.quanta[author]) {
            this.quanta[author] = {};
        }
        if (!this.quanta[author][project]) {
            this.quanta[author][project] = {};
        }
        if (!this.quanta[author][project][name]) {
            this.quanta[author][project][name] = {};
        }
        if (version && !this.quanta[author][project][name][version]) {
            this.quanta[author][project][name][version] = {};
        }
    }
}