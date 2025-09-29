import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import type { NextFunction } from "express";
import type { Request, Response } from "express";
import dotenv from "dotenv";

dotenv.config()

interface AuthRequest extends Request {
    user? : JwtPayload;
}

export async function authorizeUser(req : AuthRequest, res : Response, next : NextFunction) {

    try {

        const authHeader = req?.headers?.authorization || "";

        const [ scheme, token ] = authHeader.split(" ");

        if (scheme !== "Bearer" || !token) {
            return res.status(400).json({message: "Unauthorized, token not found"});
        } 

        if (!process.env.JWT_SECRET) {
            throw new Error("Jwt secret not defined in env variables")
        }

        const payload = jwt.verify(token, process.env.JWT_SECRET);

        req.user = payload as JwtPayload

        next();

    } catch (error) {
        console.error(error)
        return res.status(401).json({message: "Unauthorized, invalid token"});
    }
}