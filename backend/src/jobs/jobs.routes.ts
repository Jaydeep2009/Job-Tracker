import { Router } from "express";
import * as controller from "./jobs.controller.js";
import { authenticate } from "../auth/auth.middleware.js";

const router = Router();

router.post("/", authenticate, controller.createJob);
router.get("/", authenticate, controller.listJobs);
router.get("/stats", authenticate, controller.getStats); // ← ADD THIS
router.patch("/:id", authenticate, controller.updateJob);
router.delete("/:id", authenticate, controller.deleteJob); // ← this is also missing

export default router;