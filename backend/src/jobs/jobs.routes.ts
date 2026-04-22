import { Router } from "express";
import * as controller from "./jobs.controller.js";
import { authenticate } from "../auth/auth.middleware.js";
import { validate } from "../validation/middleware.js";
import {
  createJobSchema,
  listJobsSchema,
  updateJobSchema,
  deleteJobSchema,
} from "../validation/schemas/job.schema.js";

const router = Router();

router.post("/", authenticate, validate(createJobSchema), controller.createJob);

router.get("/", authenticate, validate(listJobsSchema), controller.listJobs);

// Stats must be before /:id to prevent "stats" being treated as an id param
router.get("/stats", authenticate, controller.getStats);

router.patch("/:id", authenticate, validate(updateJobSchema), controller.updateJob);

router.delete("/:id", authenticate, validate(deleteJobSchema), controller.deleteJob);

export default router;