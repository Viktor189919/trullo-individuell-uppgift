enum TaskStatus {
    TO_DO = "to-do",
    IN_PROGRESS = "in progress",
    BLOCKED = "blocked",
    DONE = "done"
}

enum ProjectStatus {
    OPEN = "open",
    CLOSED = "closed"
}

export type UserType = {
    id : string;
    name : string;
    email : string;
    password : string;
}

export type TaskType = {
    id? : string;
    title : string;
    description : string;
    status? : TaskStatus;
    assignedTo? : string;
}

export type ProjectType = {
    id : string,
    title : string,
    members : UserType[],
    tasks : TaskType[],
    status : ProjectStatus,
}

export type MongoErrorResponse = {
    status : number,
    message : string
}