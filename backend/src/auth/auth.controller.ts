import type { Request, Response } from "express";
import { getProfileService } from "./auth.service.js";

export async function me(req: Request, res: Response) {
  try {
    const profile = await getProfileService(req.userId);
    res.json(profile);
  } catch (error: any) {
    res.status(404).json({ error: error.message || 'User not found' });
  }
}
