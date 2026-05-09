import { prisma } from "../lib/prisma.js";
import { BadRequestError, NotFoundError } from "../errors/index.js";

const VALID_PLATFORMS = ["LINKEDIN", "NAUKRI", "INTERNSHALA"] as const;
type ValidPlatform = typeof VALID_PLATFORMS[number];

const VALID_STATUSES = ["APPLIED", "INTERVIEW", "OFFER", "REJECTED"] as const;
type ValidStatus = typeof VALID_STATUSES[number];

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

    if (!VALID_PLATFORMS.includes(platformEnum as ValidPlatform)) {
        throw new BadRequestError(`Invalid platform: ${data.platform}. Must be one of: ${VALID_PLATFORMS.join(", ")}`);
    }

    return prisma.job.upsert({
        where: {
            userId_jobUrl: { userId, jobUrl: data.jobUrl },
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
            platform: platformEnum as ValidPlatform,
            appliedAt: new Date(data.appliedAt),
            userId,
        },
    });
}

export async function getJobs(
    userId: string,
    page: number = 1,
    limit: number = 15,
    status?: string,
    platform?: string,
    search?: string
) {
    const skip = (page - 1) * limit;

    // Build filter dynamically
    const where: any = { userId };

    if (status && status !== 'ALL') {
        where.status = status.toUpperCase();
    }
    if (platform && platform !== 'ALL') {
        where.platform = platform.toUpperCase();
    }
    if (search) {
        where.OR = [
            { jobTitle: { contains: search, mode: 'insensitive' } },
            { companyName: { contains: search, mode: 'insensitive' } },
        ];
    }

    const [total, jobs] = await Promise.all([
        prisma.job.count({ where }),
        prisma.job.findMany({
            skip,
            take: limit,
            where,
            orderBy: { appliedAt: 'desc' },
        }),
    ]);

    return {
        jobs,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        limit,
    };
}

export async function getStats(userId: string) {
    const [total, applied, interview, offer, rejected] = await Promise.all([
        prisma.job.count({ where: { userId } }),
        prisma.job.count({ where: { userId, status: 'APPLIED' } }),
        prisma.job.count({ where: { userId, status: 'INTERVIEW' } }),
        prisma.job.count({ where: { userId, status: 'OFFER' } }),
        prisma.job.count({ where: { userId, status: 'REJECTED' } }),
    ]);

    return { total, APPLIED: applied, INTERVIEW: interview, OFFER: offer, REJECTED: rejected };
}

export async function updateJob(
    userId: string,
    jobId: string,
    data: { status?: string }
) {
    const job = await prisma.job.findFirst({
        where: { id: jobId, userId },
    });

    if (!job) throw new NotFoundError('Job not found');

    // Validate status if provided
    if (data.status) {
        const statusEnum = data.status.toUpperCase();
        if (!VALID_STATUSES.includes(statusEnum as ValidStatus)) {
            throw new BadRequestError(`Invalid status: ${data.status}. Must be one of: ${VALID_STATUSES.join(", ")}`);
        }
        
        return prisma.job.update({
            where: { id: jobId },
            data: {
                status: statusEnum as ValidStatus,
                updatedAt: new Date(),
            },
        });
    }

    if (job.userId !== userId) {
        throw new ForbiddenError("You do not have permission to update this job");
    }

    // Safe enum conversion (already validated by Zod)
    const status = data.status as JobStatus;

    return prisma.job.update({
        where: { id: jobId },
        data: {
            updatedAt: new Date(),
        },
    });
}

export async function deleteJob(userId: string, jobId: string) {
    const job = await prisma.job.findFirst({
        where: { id: jobId, userId },
    });

    if (!job) throw new NotFoundError('Job not found');

    await prisma.job.delete({
        where: { id: jobId },
    });
}