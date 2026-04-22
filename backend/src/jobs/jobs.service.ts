import { prisma } from "../lib/prisma.js";
import { JobPlatform, JobStatus, Prisma } from "@prisma/client";
import { NotFoundError, ForbiddenError } from "../errors/index.js";

export async function createJob(
    userId: string,
    data: {
        companyName: string;
        jobTitle: string;
        location?: string;
        description?: string;
        jobUrl: string;
        platform: string;
        appliedAt: string;
    }
) {
    // Safe enum conversion (already validated by Zod)
    const platform = data.platform as JobPlatform;

    return prisma.job.upsert({
        where: {
            userId_jobUrl: {
                userId,
                jobUrl: data.jobUrl
            },
        },
        update: {
            updatedAt: new Date(),
        },
        create: {
            companyName: data.companyName,
            jobTitle: data.jobTitle,
            location: data.location ?? null,
            description: data.description ?? null,
            jobUrl: data.jobUrl,
            platform,
            appliedAt: new Date(data.appliedAt),
            userId,
        },
    });
}


export async function getJobs(
    userId: string,
    page: number = 1,
    limit: number = 15,
    filters?: {
        status?: string | undefined;
        platform?: string | undefined;
        search?: string | undefined;
    }
) {
    // Ensure skip/take are always integers (Prisma requires Int, not String)
    const safeLimit = Math.max(1, Math.min(100, Number(limit) || 15));
    const safePage = Math.max(1, Number(page) || 1);
    const skip = (safePage - 1) * safeLimit;

    // Build dynamic where clause
    const where: Prisma.JobWhereInput = { userId };

    if (filters?.status) {
        where.status = filters.status as JobStatus;
    }

    if (filters?.platform) {
        where.platform = filters.platform as JobPlatform;
    }

    if (filters?.search) {
        where.OR = [
            { jobTitle: { contains: filters.search, mode: 'insensitive' } },
            { companyName: { contains: filters.search, mode: 'insensitive' } },
        ];
    }

    // Optimize with parallel queries
    const [total, jobs] = await Promise.all([
        prisma.job.count({ where }),
        prisma.job.findMany({
            skip,
            take: safeLimit,
            where,
            orderBy: { appliedAt: "desc" },
        })
    ]);

    const totalPages = Math.ceil(total / safeLimit);

    return {
        jobs,
        total,
        page: safePage,
        totalPages,
        limit: safeLimit,
    };
}


export async function updateJob(
    userId: string,
    jobId: string,
    data: { status?: string }
) {
    // Verify the job exists and belongs to the user
    const job = await prisma.job.findUnique({
        where: { id: jobId },
    });

    if (!job) {
        throw new NotFoundError("Job not found");
    }

    if (job.userId !== userId) {
        throw new ForbiddenError("You do not have permission to update this job");
    }

    // Safe enum conversion (already validated by Zod)
    const status = data.status as JobStatus;

    return prisma.job.update({
        where: { id: jobId },
        data: {
            status,
            updatedAt: new Date(),
        },
    });
}


export async function deleteJob(userId: string, jobId: string) {
    // Verify the job exists and belongs to the user
    const job = await prisma.job.findUnique({
        where: { id: jobId },
    });

    if (!job) {
        throw new NotFoundError("Job not found");
    }

    if (job.userId !== userId) {
        throw new ForbiddenError("You do not have permission to delete this job");
    }

    return prisma.job.delete({
        where: { id: jobId },
    });
}


export async function getStats(userId: string) {
    const [total, grouped] = await Promise.all([
        prisma.job.count({ where: { userId } }),
        prisma.job.groupBy({
            by: ['status'],
            where: { userId },
            _count: { status: true },
        }),
    ]);

    // Build a status-count map with defaults
    const statusCounts: Record<string, number> = {
        APPLIED: 0,
        INTERVIEW: 0,
        OFFER: 0,
        REJECTED: 0,
    };

    for (const group of grouped) {
        statusCounts[group.status] = group._count.status;
    }

    return {
        total,
        ...statusCounts,
    };
}