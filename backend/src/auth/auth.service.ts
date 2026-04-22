import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prisma from "../lib/prisma.js";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/jwt.js";
import { Prisma } from "@prisma/client";
import { UnauthorizedError, ConflictError, NotFoundError } from "../errors/index.js";

export async function register(email: string, password: string) {
    const hashedPassword = await bcrypt.hash(password, 10);

    try {
        const user = await prisma.user.create({
            data: { email, password: hashedPassword },
        });

        return generateToken(user.id);
    } catch (error) {
        if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
        ) {
            throw new ConflictError("Email already exists");
        }
        throw error;
    }
}

export async function login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedError("Invalid credentials");

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) throw new UnauthorizedError("Invalid credentials");

    return generateToken(user.id);
}

export async function getProfile(userId: string) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            email: true,
            createdAt: true,
            _count: {
                select: { jobs: true },
            },
        },
    });

    if (!user) {
        throw new NotFoundError("User not found");
    }

    return {
        id: user.id,
        email: user.email,
        createdAt: user.createdAt,
        jobCount: user._count.jobs,
    };
}

function generateToken(userId: string) {
    return jwt.sign({ userId }, JWT_SECRET, {
        expiresIn: JWT_EXPIRES_IN,
    });
}
