import { CollectionReference, DocumentChange, Firestore, collection, doc, onSnapshot, or, query, where } from "@angular/fire/firestore";
import { Unsubscribe } from "@angular/fire/auth";


export class Campaign {

    private doc_id: string;
    public name: string = "New Adventure";
    public owner: string = "Unknown Dungeon Architect";
    public info: string = "A (mysterious/amazing/dramatic/heartwarming/comical/depressing) (adventure/quest/dungeon crawl/legend/business? venture)";
    public players: Map<string, Player> = new Map();
    public works: Map<string, Work> = new Map();
    public identifiers: Map<string, string> = new Map();
    public filters: Map<string, string[]> = new Map();

    private owner_obj: User|undefined;
    private admin: boolean = false;
    private unsub_players: Unsubscribe|undefined;
    private unsub_works: Unsubscribe|undefined;
    private unsub_owner: Unsubscribe|undefined;

    constructor( doc_id: string) {
        this.doc_id = doc_id;
    }

    public update( c: Campaign ) {
        this.name = c.name;
        this.owner = c.owner;
        this.info = c.info;
        this.unsub();
    }

    public listen(firestore: Firestore, user: User) {
        this.unsub();
        
        this.unsub_owner = onSnapshot( doc(firestore, 'users', this.owner), ss => {
            if (ss.exists()) { this.owner_obj = ss.data() as User; }
        } );

        this.unsub_players = onSnapshot( collection(firestore, 'campaigns', this.doc_id, 'players'), ss => {
            ss.docChanges().forEach( change => {

                if (change.type == 'removed') {
                    let p = this.players.get(change.doc.id);
                    p?.unsub();
                    this.players.delete(change.doc.id);
                }

                else {
                    var p = new Player(change.doc.id);
                    if (this.players.has(change.doc.id)) {
                        let old_p = this.players.get(change.doc.id);
                        old_p?.unsub();
                    }
                    p.update( change.doc.data() as Player );
                    p.listen( collection(firestore, 'campaigns', this.doc_id, 'players', change.doc.id, 'characters'), user, this.work_logic);
                    this.players.set(change.doc.id, p);
                }
            });
        });

        let q_works = query( collection(firestore, 'campaigns', this.doc_id, 'works') );
        if (!this.admin) { q_works = query( q_works, or( where('supervisible', '==', true), where('beholders', 'array-contains', user.uid) ) ); }
        this.unsub_works = onSnapshot( q_works, ss => {
            ss.docChanges().forEach( change => {
                this.work_logic(change);
            });
            this.filters.forEach( (works, filter) => {
                if (works.length == 0) { this.filters.delete(filter); }
            } );
        });
    }

    get owner_info(): User {
        if (this.owner_obj) { return this.owner_obj; }
        return { uid: '', name: 'Unknown Dungeon Architect', email: '', requests: [] };
    }

    public unsub() {
        if (this.unsub_players) {
            this.unsub_players();
            for (let entry of this.players) {
                entry[1].unsub();
            }
        }
        this.players = new Map();
        this.unsub_players = undefined;
        if (this.unsub_works) {
            this.unsub_works();
        }
        this.works = new Map();
        this.unsub_works = undefined;
        if (this.unsub_owner) {
            this.unsub_owner(); 
        }
        this.owner_obj = undefined;
        this.unsub_owner = undefined;
    }

    private work_logic(change: DocumentChange) {
        if (change.type != 'added') {
            for (let filter of this.works.get(change.doc.id)?.filterables??[]) {
                if (this.filters.has(filter)) {
                    if (this.filters.get(filter)?.find(str => { return (str == change.doc.id); })) {
                        this.filters.get(filter)?.splice( this.filters.get(filter)?.findIndex( str => {return (str == change.doc.id);} )??-1, 1)
                    }
                }
            }
            for (let identity of this.works.get(change.doc.id)?.identifiers??[]) {
                if (this.identifiers.has(identity)) { this.identifiers.delete(identity); }
            }
        }

        if (change.type == 'removed') {
            this.works.delete(change.doc.id);
        }
        else {
            var new_work = change.doc.data() as Work;
            this.works.set(change.doc.id, new_work);
            for (let filter of new_work.filterables) {
                if (this.filters.has(filter)) { this.filters.get(filter)?.push(change.doc.id); }
                else { this.filters.set(filter, [change.doc.id]); }
            }
            for (let identity of new_work.identifiers) {
                this.identifiers.set(identity, '/campaigns/'.concat(this.doc_id, '/', change.doc.id));
            }
        }
    }

}


export class Player {
    private doc_id: string;
    public name: string = "New Character";
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
                if (user.uid != this.doc_id) { passthrough_method(change) }
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
