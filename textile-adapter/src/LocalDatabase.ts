import { Database } from '@textile/threads-database';
import { KeyInfo } from '@textile/security';
import { Libp2pCryptoIdentity } from '@textile/threads-core';
import { Quant } from './quantschema';

export class LocalDatabase {
    private database: Database;

    private constructor(db: Database) {
        this.database = db;
    }

    static async init(name: string, keyInfo: KeyInfo, identity: Libp2pCryptoIdentity) {

        let db = await Database.withKeyInfo(keyInfo, name);
        debugger;
        await db.start(identity, {
            collections: [
                { name: "test1", schema: Quant },
                { name: "test2", schema: Quant },
                { name: "test3", schema: Quant },
                { name: "test4", schema: Quant }
            ]
        });
        return new LocalDatabase(db);
    }
}