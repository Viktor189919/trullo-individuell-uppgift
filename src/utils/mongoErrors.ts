import { MongoServerError } from "mongodb"

export function isDuplicationError(error : unknown) : error is MongoServerError{
    return error instanceof MongoServerError && error.code === 11000;
}