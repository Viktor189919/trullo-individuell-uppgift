export type MongoErrorResponse = {
    status : number,
    message : string
}

export enum ErrorOrigin {
    TASKS = "task",
    USERS = "user",
    PROJECTS = "project"
}