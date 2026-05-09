import { Router } from "express";
import { me } from "./auth.controller.js";
import { authenticate } from "./auth.middleware.js";

const router = Router();

router.get("/me", authenticate, me);

export default router;
