import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { CreateReportDto, ReportQueryDto } from '../dto/report.dto';
import { Prisma, ReportStatusEnum } from '@prisma/client';

@Injectable()
export class ReportRepo {
    constructor(private readonly prismaService: PrismaService) {}

    async getActiveReportByInventoryId(
        inventoryId: number,
        prisma: Prisma.TransactionClient = this.prismaService,
    ) {
        return prisma.report.findFirst({
            where: {
                inventoryId,
                status: {
                    in: [
                        ReportStatusEnum.IN_REVIEW,
                        ReportStatusEnum.PENDING_DEPOSIT,
                        ReportStatusEnum.REQUESTED_CHANGES,
                        ReportStatusEnum.IN_PENDING_DEPOSIT_REVIEW,
                    ],
                },
            },
        });
    }

    async createNewReport(
        body: CreateReportDto,
        prisma: Prisma.TransactionClient = this.prismaService,
    ) {
        return prisma.report.create({
            data: body,
        });
    }

    async findAllReports(
        query: ReportQueryDto,
        prisma: Prisma.TransactionClient = this.prismaService,
    ) {
        const { page = 1, limit = 10, ...filter } = query;
        const skip = (page - 1) * limit;

        const where: Prisma.ReportWhereInput = {
            ...filter,
        };

        const [total, data] = await Promise.all([
            prisma.report.count({ where }),
            prisma.report.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
        ]);

        return {
            data,
            totalDocs: total,
        };
    }

    async getReportById(
        id: number,
        prisma: Prisma.TransactionClient = this.prismaService,
    ) {
        return prisma.report.findUnique({
            where: { id },
        });
    }

    async getReportDetails(
        id: number,
        prisma: Prisma.TransactionClient = this.prismaService,
    ) {
        return prisma.report.findUnique({
            where: { id },
            include: {
                inventory: true,
                ReportProduct: {
                    include: {
                        ProductUnit: {
                            include: {
                                product: true,
                            },
                        },
                    },
                },
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        dob: true,
                        phoneNumber: true,
                        role: true,
                        createdAt: true,
                        updatedAt: true,
                    },
                },
            },
        });
    }

    async updateReportStatus(
        id: number,
        status: ReportStatusEnum,
        prisma: Prisma.TransactionClient = this.prismaService,
    ) {
        return prisma.report.update({
            where: { id },
            data: { status },
        });
    }

    async updateReportById(
        id: number,
        data: Prisma.ReportUpdateInput,
        prisma: Prisma.TransactionClient = this.prismaService,
    ) {
        return prisma.report.update({
            where: { id },
            data,
        });
    }
}
