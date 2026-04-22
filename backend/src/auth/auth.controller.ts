import type { Request, Response } from "express";
import * as authService from "./auth.service.js";
import type { RegisterInput, LoginInput } from "../validation/schemas/auth.schema.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const register = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body as RegisterInput;
    const token = await authService.register(email, password);
    res.json({ token });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body as LoginInput;
    const token = await authService.login(email, password);
    res.json({ token });
});

export const me = asyncHandler(async (req: Request & { userId?: string }, res: Response) => {
    const profile = await authService.getProfile(req.userId!);
    res.json(profile);
});
