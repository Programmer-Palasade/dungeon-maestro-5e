import { CollectionReference, DocumentChange, Firestore, collection, deleteDoc, doc, getDoc, onSnapshot, or, query, where } from "@angular/fire/firestore";
import { Unsubscribe } from "@angular/fire/auth";
import { FirestoreService } from "./firestore.service";



export class Campaign {
    public name: string = "New Adventure";
    public owner: string = "Unknown Dungeon Architect";
    public info: string = "A (mysterious/amazing/dramatic/heartwarming/comical/depressing) (adventure/quest/dungeon crawl/legend/business? venture)";
    public users: string[] = [];

    private w_map: Map<string, Work> = new Map();

    constructor(name: string, owner: string, info: string, users: string[]) {
        this.name = name;
        this.owner = owner;
        this.info = info;
        this.users = users;
    }

    public update(new_c: Campaign) {
        this.name = new_c.name;
        this.owner = new_c.owner;
        this.info = new_c.info;
        this.users = new_c.users;
    }
}


export class Player {
    private doc_id: string;
    public name: string = "New Player";
    public notes: string = "Slightly better than an NPC.";
    public characters: Map<string, Character> = new Map();

    private unsub_characters: Unsubscribe|undefined;

    constructor(doc_id: string) {
        this.doc_id = doc_id;
    }

    public update(p: Player) {
        this.name = p.name;
        this.notes = p.notes;
        this.unsub();
    }

    public listen(character_collection: CollectionReference, user: User, passthrough_method: (change: DocumentChange) => void) {

        this.unsub_characters = onSnapshot( character_collection, ss => {
            ss.docChanges().forEach( change => {
                if (user.uid != this.doc_id) { /* passthrough_method(change) */ }
                else {
                    if (change.type == 'removed') { this.characters.delete(change.doc.id); }
                    else {
                        this.characters.set( change.doc.id, change.doc.data() as Character );
                    }
                }
            });
        });

    }

    public unsub() {
        if (this.unsub_characters) { this.unsub_characters(); }
        this.unsub_characters = undefined;
        this.characters = new Map();
    }
}


export interface User {
    uid: string | undefined,
    name: string,
    email: string,
    requests: CampaignRequest[]
}

export interface CampaignRequest {
    cid: string | undefined,
    cname: string
}
export interface Work {
    beholders: string[],
    filterables: string[],
    identifiers: string[],
    info: string,
    name: string,
    supervisible: boolean
}

export interface Character {
    active: boolean,
    info: string,
    name: string,
    identifiers: string[],
    filterables: string[],
}
