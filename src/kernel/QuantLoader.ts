import QuantListener from "./QuantListener";
import DragableQuant from "./quants/DragableQuant";
import Editor from "./quants/Editor";

export class QuantLoader {
    public quanta: any;
    private listener: QuantListener | undefined;

    public async register($class: any, quantName: string): Promise<void> {
        window.customElements.define(quantName, $class);
    }

    get all(): any {
        throw new Error("Method not implemented.");
    }

    public get(author: string, project: string, name: string, major: number, minor: number, patch: number): any {
        console.log("BREAKK")
        const version = this.getVersion(author, project, name, major, minor, patch);
        if (typeof (this.quanta[author][project][name][version]) === "function") {
            return this.quanta[author][project][name][version];
        }
        return this.loadFromThread(author, project, name, major, minor, patch);
    }

    public async initAsync(): Promise<void> {
        try {
            await omo.client.registerSchema(omo.storeId, "quanta", this.quantaSchema);
            await omo.client.registerSchema(omo.storeId, "version", this.versionSchema);
        }
        catch (err) { if (err.message !== 'already registered model') { throw err; } }
        this.storeQuant("omo", "quantum", "quant", DragableQuant, 0, 1, 0);
        this.storeQuant("omo", "quantum", "editor", Editor, 0, 1, 0);
        this.listener = new QuantListener();
        console.log("listener", this.listener);
    }
    public loadFromThread(author: string, project: string, name: string, major?: number, minor?: number, patch?: number): any {
        console.log(author, project, name, major, minor, patch);

        return null;
    }
    public storeQuant(author: string, project: string, name: string, constructor: any, major: number, minor: number, patch: number): void {
        const version = this.getVersion(author, project, name, major, minor, patch);
        this.quanta[author][project][name][version] = constructor;
        const quantName = `${author.toLowerCase()}-${project.toCamelCase()}-${name.toLowerCase()}-${version}`;
        window.customElements.define(quantName, constructor);
    }
    private getVersion(author: string, project: string, name: string, major: number, minor: number, patch: number): string {
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
        const version = `${major ? major : 0}.${minor ? minor : 0}.${patch ? patch : 0}`;
        if (!this.quanta[author][project][name][version]) {
            this.quanta[author][project][name][version] = {};
        }
        return version;
    }
    private get quantaSchema(): any {
        return {
            "$id": "https://example.com/person.schema.json",
            "$schema": "http://json-schema.org/draft-07/schema#",
            "properties": {
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
                "code": {
                    "type": "string"
                },
                "major": {
                    "type": "string"
                },
                "minor": {
                    "type": "string"
                },
                "patch": {
                    "type": "string"
                },
                "quant": {
                    "type": "string"
                }
            },
            "title": "quanta",
            "type": "object",
        };
    }
}