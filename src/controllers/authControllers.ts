import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { ZodError } from "zod";
import { User } from "../models/models.js";
import { AuthUserSchema } from "../validation/validators.js"
import { zodErrorHandler } from "../utils/zodErrors.js"
import type { Request, Response } from "express";


dotenv.config();

export async function signin(req : Request, res : Response) {

    try {

        AuthUserSchema.parse(req?.body)

        const { email, password } = req?.body;

        const user = await User.findOne({email: email});

        if (!user) {
            return res.status(404).json({message: "User not found"});
        }

        const isPassword = await bcrypt.compare(password, user.password);

        if (!isPassword) {
            return res.status(400).json({message: "Invalid credentials"});
        }

        if (!process.env.JWT_SECRET) {
            throw new Error("Jwt secret not defined in env variables")
        }

        const token = jwt.sign(
            { data: user.id}, process.env.JWT_SECRET, 
            { expiresIn: 60 * 60 });

        return res.status(200).json({message: "Signed in successfully", data: user, token})

    } catch (error : unknown) {

        if (error instanceof ZodError) {
            const validationErrors = zodErrorHandler(error);
            return res.status(400).json({message: validationErrors});
        }

        console.error("Error from route '/auth POST(signin)': ", error);
        return res.status(500).json({message: "Internal server error"});
    }
}