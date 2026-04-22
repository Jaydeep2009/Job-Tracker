import type { Request, Response, NextFunction } from "express";
import jwt, {type JwtPayload } from "jsonwebtoken";
import { JWT_SECRET } from "../config/jwt.js";
import { UnauthorizedError } from "../errors/index.js";

interface TokenPayload extends JwtPayload {
    userId: string;
}

export function authenticate(
    req: Request & { userId?: string },
    res: Response,
    next: NextFunction
) {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        throw new UnauthorizedError("Authentication required");
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
        throw new UnauthorizedError("Authentication required");
    }

    try {
        const payload = jwt.verify(token, JWT_SECRET) as unknown as TokenPayload;
        req.userId = payload.userId;
        next();
    } catch {
        throw new UnauthorizedError("Invalid or expired token");
    }
}
