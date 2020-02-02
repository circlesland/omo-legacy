import { Query } from "@textile/threads-client";
import Actions from "../quants/earth/Actions";
import ContextSwitch from "../quants/earth/ContextSwitch";
import Data from "../quants/earth/Data";
import Designer from "../quants/earth/Designer";
import QuantaList from "../quants/earth/QuantaList";
import SplitView from "../quants/earth/SplitView";
import Versions from "../quants/earth/Versions";
import ViewsChooser from "../quants/earth/ViewsChooser";
import QuantLoadedEvent from "./events/QuantLoadedEvent";
import QuantListener from "./QuantListener";
import CodeEditor from "./quants/CodeEditor";
import DragableQuant from "./quants/DragableQuant";
import Editor from "./quants/Editor";

export class QuantStore {

    public get QuantStoreId(): string { return "af8fd66c-3cbd-49b9-abbc-2811dc870388" }
    public QuantaModelName;
    public VersionModelName;
    public quanta: any;
    private listener: QuantListener;
    private loadedQuants: Array<{ hash: string, quant: Function }>;

    constructor() {
        this.loadedQuants = Array(0);
    }

    public async all(): Promise<any> {
        return (await omo.client.modelFind(this.QuantStoreId, this.QuantaModelName, {})).entitiesList;
    }
    public async versions(name): Promise<any> {
        const descriptor = await this.getDescriptor(name);
        // const hash = descriptor.code

        let query = new Query();
        this.andFilter(query, "quant", descriptor.ID);
        query = query.orderByDesc("created");
        return (await omo.client.modelFind(this.QuantStoreId, this.VersionModelName, query)).entitiesList;
    }
    public async loadQuant(quantName: any): Promise<any> {
        const descriptor = await this.getDescriptor(quantName);
        const version = await this.getVersion(descriptor.latest);
        if (await this.listener.loadQuantByHash(version.code, quantName)) {
            return this.getByName(quantName);
        }
    }

    public getMeta(quantname): any {
        return this.listener.getMeta(quantname);
    }




    // TODO remove
    public register($class: any, author: string, project: string, name: string, version: string, hash: string): void {
        const versionName = version === undefined ? "latest" : version;
        this.createVersion(author, project, name, versionName);
        this.storeQuant(author, project, name, $class, versionName, hash, true);
    }

    // tslint:disable-next-line: ban-types
    public registerQuant(quant: Function, hash: string, quantName: string): void {
        const hashLoaded = this.loadedQuants.some(item => item.hash === hash);
        if (hashLoaded) {
            const equalQuant = this.loadedQuants.find(item => item.hash === hash);
            this.linkRegisteredQuant(quantName, equalQuant.quant, hash);
            return;
        }



        this.storeQuantByName(quantName, quant, hash, !hashLoaded);

        console.debug("Quant registered", hash);
        const event = new QuantLoadedEvent(QuantLoadedEvent.LOADED);
        event.QuantName = quantName;
        document.dispatchEvent(event);
    }


    public getByName(name: string): any {
        const meta = this.getMeta(name);
        return this.get(meta.author, meta.project, meta.name, meta.version);
    }

    public get(author: string, project: string, name: string, version: string): any {
        const versionName = version === undefined ? "latest" : version;
        const quant = this.quanta[author][project][name][versionName];
        if (quant && typeof (quant.quant) === "function") {
            return this.quanta[author][project][name][versionName].quant;
        }
        console.error("Quant not loaded");
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

        let quant = result.entitiesList[0];
        if (quant["latest"] !== undefined) {
            quant = await this.getVersion(quant.latest);
        }
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
        this.storeQuant("omo", "earth", "quant", DragableQuant, "latest", "OmoEarthQuant", true);
        this.storeQuant("omo", "earth", "editor", Editor, "latest", "OmoEarthEditor", true);
        this.storeQuant("omo", "earth", "codeEditor", CodeEditor, "latest", "OmoEarthCodeeditor", true);
        this.storeQuant("omo", "earth", "splitView", SplitView, "latest", "Omo-Earth-Splitview", true);
        this.storeQuant("omo", "earth", "data", Data, "latest", "OmoEarthData", true);
        this.storeQuant("omo", "earth", "actions", Actions, "latest", "OmoEarthActions", true);
        this.storeQuant("omo", "earth", "versions", Versions, "latest", "OmoEarthVersions", true);
        this.storeQuant("omo", "earth", "contextSwitch", ContextSwitch, "latest", "OmoEarthContextswitch", true);
        this.storeQuant("omo", "earth", "viewsChooser", ViewsChooser, "latest", "OmoEarthViewschooser", true);
        this.storeQuant("omo", "earth", "quantaList", QuantaList, "latest", "OmoEarthQuantalist", true);
        this.storeQuant("omo", "earth", "designer", Designer, "latest", "OmoEarthDesigner", true);
        // this.storeQuant("omo", "earth", "simple", Minimal, "latest", "OmoEarthMinimal", true);

        this.listener = new QuantListener();
    }
    public async saveQuant(author: string, project: string, name: string, version: string, code: string, commitMessage: string): Promise<void> {
        const hash = await this.saveQuantToMFS(author, project, name, version, code);
        await this.CreateOrUpdateQuant(author, project, name, hash, version, commitMessage);
    }
    public async saveQuantToMFS(author: string, project: string, name: string, version: string, code: string): Promise<string> {
        const versionName = version === undefined ? new Date() : version;
        try { await omo.ipfs.files.mkdir(`/quanta`).catch(); } catch {/**/ }
        try { await omo.ipfs.files.mkdir(`/quanta/${author}`).catch(); } catch {/**/ }
        try { await omo.ipfs.files.mkdir(`/quanta/${author}/${project}`).catch(); } catch {/**/ }
        try { await omo.ipfs.files.mkdir(`/quanta/${author}/${project}/${name}`).catch(); } catch {/**/ }
        try { await omo.ipfs.files.mkdir(`/quanta/${author}/${project}/${name}/${versionName}`).catch(); } catch {/**/ }
        try { await omo.ipfs.files.rm(`/quanta/${author}/${project}/${name}/${versionName}/${name}`).catch(); } catch {/**/ }
        try { await omo.ipfs.files.write(`/quanta/${author}/${project}/${name}/${versionName}/${name}`, code, { create: true }).catch(); } catch {/**/ }
        return (await omo.ipfs.files.stat(`/quanta/${author}/${project}/${name}/${versionName}/${name}`)).hash;
    }
    public async CreateOrUpdateQuant(author: string, project: string, name: string, code: string, version: string, commitMessage: string): Promise<any> {
        const query = new Query();
        this.andFilter(query, "author", author);
        this.andFilter(query, "project", project);
        this.andFilter(query, "name", name);

        // Get latest Version
        let result = await omo.client.modelFind(this.QuantStoreId, this.QuantaModelName, query);
        if (result.entitiesList.length > 1) {
            throw Error("Something went totally wrong");
        }

        let latestVersion: any;
        // New Version
        if (result.entitiesList.length === 0) {
            const newQuant = { author, name, project, ID: "", latest: "" };
            await omo.client.modelCreate(this.QuantStoreId, this.QuantaModelName, [newQuant]);
            latestVersion = newQuant;
        }
        else {
            latestVersion = result.entitiesList[0];
        }

        const newVersion = { code, commitMessage, created: Date.now(), quant: latestVersion.ID, versionName: version, ID: "" };
        await omo.client.modelCreate(this.QuantStoreId, this.VersionModelName, [newVersion]);
        latestVersion.latest = newVersion.ID;
        await omo.client.modelSave(this.QuantStoreId, this.QuantaModelName, [latestVersion]);
        // Finally replace loaded Version or add version to DOM
        // this.listener.ReplaceVersion(author, project, name, version, code);
    }
    public linkRegisteredQuant(quantName: string, quant: Function, hash: string): void {
        const meta = this.getMeta(quantName);
        this.createVersion(meta.author, meta.project, meta.name, meta.version);
        omo.quantum.quanta[meta.author][meta.project][meta.name][meta.version] = { quant, hash }
        const event = new QuantLoadedEvent(QuantLoadedEvent.LOADED)
        event.QuantName = quantName;
        document.dispatchEvent(event);
    }

    public storeQuantByName(quantName: string, constructor: Function, hash: string, registerComponent: boolean): void {
        const meta = this.getMeta(quantName);
        this.storeQuant(meta.author, meta.project, meta.name, constructor, meta.version, hash, registerComponent);
    }

    public storeQuant(author: string, project: string, name: string, quant: Function, version: string, hash: string, registerComponent: boolean): void {
        this.createVersion(author, project, name, version);
        this.loadedQuants.push({ hash, quant });
        if (registerComponent) {
            this.registerCustomElement(author, project, name, quant, version, hash);
        }
    }

    public registerCustomElement(author: string, project: string, name: string, quant: Function, version: string, hash: string) {
        omo.quantum.quanta[author][project][name][version] = { quant, hash };
        window.customElements.define(hash.toTag(), quant);
        console.log("Custom element registered: ", hash.toTag())
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
                "latest": {
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
                    "type": "number"
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
    private async getDescriptor(quantName: string): Promise<any> {
        const meta = this.getMeta(quantName);
        const query = new Query();
        this.andFilter(query, "author", meta.author);
        this.andFilter(query, "project", meta.project);
        this.andFilter(query, "name", meta.name);
        const response = await omo.client.modelFind(this.QuantStoreId, this.QuantaModelName, query);
        return response.entitiesList[0];
    }
    private async getVersion(quantID: string): Promise<any> {
        const result = await omo.client.modelFindByID(this.QuantStoreId, this.VersionModelName, quantID);
        // const res2 = await omo.client.modelFind(this.QuantStoreId, this.VersionModelName, {});
        return result.entity;
    }
}