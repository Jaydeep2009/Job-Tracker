import type { Request, Response, NextFunction } from "express";
import * as jobsService from "./jobs.service.js";

export async function createJob(
    req: Request & { userId?: string },
    res: Response,
    next: NextFunction
) {
    try {
        const job = await jobsService.createJob(req.userId!, req.body);
        res.status(201).json(job);
    } catch (err: any) {
        console.error("[createJob]", err.message);
        next(err);
    }
}

export async function listJobs(
    req: Request & { userId?: string },
    res: Response,
    next: NextFunction
) {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const status = req.query.status as string | undefined;
        const platform = req.query.platform as string | undefined;
        const search = req.query.search as string | undefined;

        const result = await jobsService.getJobs(
            req.userId!, page, limit, status, platform, search
        );
        res.json(result);
    } catch (err: any) {
        console.error("[listJobs]", err.message);
        next(err);
    }
}

export async function getStats(
    req: Request & { userId?: string },
    res: Response,
    next: NextFunction
) {
    try {
        const stats = await jobsService.getStats(req.userId!);
        res.json(stats);
    } catch (err: any) {
        console.error("[getStats]", err.message);
        next(err);
    }
}

export async function updateJob(
    req: Request & { userId?: string },
    res: Response,
    next: NextFunction
) {
    try {
        const { id } = req.params;
        const job = await jobsService.updateJob(req.userId!, id!, req.body);
        res.json(job);
    } catch (err: any) {
        console.error("[updateJob]", err.message);
        next(err);
    }
}

export async function deleteJob(
    req: Request & { userId?: string },
    res: Response,
    next: NextFunction
) {
    try {
        await jobsService.deleteJob(req.userId!, req.params.id!);
        res.status(204).send();
    } catch (err: any) {
        console.error("[deleteJob]", err.message);
        next(err);
    }
}