import { Libp2pCryptoIdentity } from '@textile/threads-core';
import { LocalDatabase } from './LocalDatabase';

export class TextileAdapter {
    constructor() {

    }

    private async RestoreOrCreateIdentity(): Promise<Libp2pCryptoIdentity> {
        const localIdentityString = localStorage.getItem("LocalIdentity");
        if (localIdentityString) {
            return await Libp2pCryptoIdentity.fromString(localIdentityString);
        }
        const localIdentity = await Libp2pCryptoIdentity.fromRandom();
        localStorage.setItem("LocalIdentity", localIdentity.toString());
        return localIdentity;
    }

    async init() {
        debugger;
        let localDB = await LocalDatabase.init("localDB", {
            key: process.env.GROUP_API_KEY || '',
            secret: process.env.GROUP_API_SECRET || ''
        }, await this.RestoreOrCreateIdentity());

        let w: any = window;
        w['db'] = localDB;
        console.log("DB created!!!!")
    }
}