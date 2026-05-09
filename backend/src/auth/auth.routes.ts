import { Router } from "express";
import { me } from "./auth.controller.js";
import { authenticate } from "./auth.middleware.js";
import { validate } from "../validation/middleware.js";
import { registerSchema, loginSchema } from "../validation/schemas/auth.schema.js";

const router = Router();

router.get("/me", authenticate, me);

export default router;
