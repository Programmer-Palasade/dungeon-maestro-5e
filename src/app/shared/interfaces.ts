
export interface Campaign {
    name: string,
    owner: string,
    users: string[],
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
