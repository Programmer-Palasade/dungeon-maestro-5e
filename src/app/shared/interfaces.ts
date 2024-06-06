
export interface Campaign {
    name: string,
    owner: string,
    users: string[],
}

export interface User {
    uid: string | undefined,
    name: string,
    email: string,
    requests: string[]
}

export interface Work {
    beholders: string[],
    filterables: string[],
    identifiers: string[],
    info: string,
    name: string,
    supervisible: boolean
}
