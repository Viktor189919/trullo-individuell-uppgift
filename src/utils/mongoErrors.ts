import { MongoServerError } from "mongodb"
import type { MongoErrorResponse } from "../types/errorTypes.js";
import type { ErrorOrigin } from "../types/errorTypes.js"
 
function getKeyValue(error : MongoServerError) : string {
    return error.keyValue 
            ? Object.keys(error.keyValue)[0] ?? "(fieldname unknown)"
            : "(fieldname unknown)"
}

export function mongoErrorHandler(error : MongoServerError, errorOrigin : ErrorOrigin) : MongoErrorResponse {

    let field;

    switch (error.code) {
        case 11000: 
            field = getKeyValue(error);
            return {status: 409, message: `A ${errorOrigin} with that ${field} already exists` };
        case 121:
            field = getKeyValue(error);
            return {status: 400, message: "MongoDB document validation failed" };
        default:
            return {status: 500, message: `Database error ${error}` };
    }
}


