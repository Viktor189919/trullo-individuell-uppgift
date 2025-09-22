enum Status {
    TO_DO = "to-do",
    IN_PROGRESS = "in progress",
    BLOCKED = "blocked",
    DONE = "done"
}

export type UserType = {
    id : string;
    name : string;
    email : string;
    password : string;
}

export type TaskType = {
    id : string;
    title : string;
    description : string;
    status : Status;
    assignedTo : string;
}
