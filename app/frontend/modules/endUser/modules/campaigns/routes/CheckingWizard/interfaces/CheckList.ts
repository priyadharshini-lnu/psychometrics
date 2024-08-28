export enum Status {
    Pending = 'pending',
    Failed = 'failed',
    Done = 'done',
    InProgress = 'in_progress',
}

export interface Item {
    name: string
    status: Status
}
