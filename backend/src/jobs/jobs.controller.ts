import type { Request, Response } from "express";
import * as jobsService from "./jobs.service.js";
import type {
  CreateJobInput,
  ListJobsQuery,
  UpdateJobParams,
  UpdateJobInput,
  DeleteJobParams,
} from "../validation/schemas/job.schema.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const createJob = asyncHandler(
  async (req: Request & { userId?: string }, res: Response) => {
    const userId = req.userId!;
    const jobData = req.body as CreateJobInput;

    // Prepare data for service, handling optional fields properly
    const serviceData = {
      companyName: jobData.companyName,
      jobTitle: jobData.jobTitle,
      jobUrl: jobData.jobUrl,
      platform: jobData.platform,
      appliedAt: jobData.appliedAt,
      ...(jobData.location && { location: jobData.location }),
      ...(jobData.description && { description: jobData.description }),
    };

    const job = await jobsService.createJob(userId, serviceData);
    res.status(201).json(job);
  }
);

export const listJobs = asyncHandler(
  async (req: Request & { userId?: string }, res: Response) => {
    const { page, limit, status, platform, search } = req.query as unknown as ListJobsQuery;

    // Explicitly parse to numbers since Express query params might be strings
    // even after Zod validation middleware assigns them
    const pageNum = Number(page) || 1;
    const limitNum = Number(limit) || 15;

    const result = await jobsService.getJobs(req.userId!, pageNum, limitNum, {
      status,
      platform,
      search,
    });
    res.json(result);
  }
);

export const updateJob = asyncHandler(
  async (req: Request & { userId?: string }, res: Response) => {
    const { id } = req.params as UpdateJobParams;
    const { status } = req.body as UpdateJobInput;

    const job = await jobsService.updateJob(req.userId!, id, { status });
    res.json(job);
  }
);

export const deleteJob = asyncHandler(
  async (req: Request & { userId?: string }, res: Response) => {
    const { id } = req.params as DeleteJobParams;
    await jobsService.deleteJob(req.userId!, id);
    res.status(204).send();
  }
);

export const getStats = asyncHandler(
  async (req: Request & { userId?: string }, res: Response) => {
    const stats = await jobsService.getStats(req.userId!);
    res.json(stats);
  }
);
