import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import {
    CreateReportDto,
    ReportDurationEnum,
    ReportQueryDto,
    ReportStatisticsDto,
} from '../dto/report.dto';
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

        console.log(where);

        const [total, data] = await Promise.all([
            prisma.report.count({ where }),
            prisma.report.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    inventory: true,
                    user: {
                        select: {
                            email: true,
                            firstName: true,
                            lastName: true,
                            phoneNumber: true,
                            id: true,
                            ProfileImage: true,
                        },
                    },
                },
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
                depositImage: true,
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

    async getReportStatistics(
        query: ReportStatisticsDto,
        prisma: Prisma.TransactionClient = this.prismaService,
    ) {
        const { duration, inventoryId } = query;

        // حدد المدة الزمنية
        const now = new Date();
        let fromDate: Date;

        switch (duration) {
            case ReportDurationEnum.DAY:
                fromDate = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate(),
                );
                break;
            case ReportDurationEnum.WEEK:
                const firstDayOfWeek = now.getDate() - now.getDay(); // بداية الأسبوع
                fromDate = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    firstDayOfWeek,
                );
                break;
            case ReportDurationEnum.MONTH:
                fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
                break;
            case ReportDurationEnum.YEAR:
                fromDate = new Date(now.getFullYear(), 0, 1);
                break;
            default:
                fromDate = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate(),
                );
        }

        // جلب المنتجات المباعة من التقارير
        const reportProducts = await prisma.reportProduct.findMany({
            where: {
                Report: {
                    createdAt: { gte: fromDate },
                    ...(inventoryId ? { inventoryId } : {}),
                },
            },
            include: {
                Report: {
                    select: {
                        brokenMoneyAmount: true,
                        brokenRate: true,
                    },
                },
                ProductUnit: {
                    include: {
                        product: true, // جلب بيانات المنتج نفسه
                    },
                },
            },
        });

        // تجميع الكميات حسب المنتج
        const productSalesMap: Record<
            string,
            {
                count: number;
                amount: number;
                brokenRate: number;
                brokenMoneyAmount: number;
            }
        > = {};

        for (const rp of reportProducts) {
            const productName = rp.ProductUnit.product.name;
            if (!productSalesMap[productName]) {
                productSalesMap[productName] = {
                    count: 0,
                    amount: 0,
                    brokenRate: 0,
                    brokenMoneyAmount: 0,
                };
            }
            productSalesMap[productName].count += rp.soldUnits;
            productSalesMap[productName].amount += rp.soldUnitsAmount;
            productSalesMap[productName].brokenRate += rp.Report.brokenRate;
            productSalesMap[productName].brokenMoneyAmount +=
                rp.Report.brokenMoneyAmount;
        }

        // تحويلها لنتيجة مع المجموع
        const statistics = Object.entries(productSalesMap).map(
            ([name, data]) => ({
                name,
                count: data.count,
                amount: data.amount,
                brokenRate: data.brokenRate,
                brokenMoneyAmount: data.brokenMoneyAmount,
            }),
        );

        const total = statistics.reduce((acc, cur) => acc + cur.count, 0);
        const totalAmount = statistics.reduce(
            (acc, cur) => acc + cur.amount,
            0,
        );

        return {
            totalProducts: total,
            totalAmount,
            totalBrokenRate: statistics.reduce(
                (acc, cur) => acc + cur.brokenRate,
                0,
            ),
            totalBrokenMoneyAmount: statistics.reduce(
                (acc, cur) => acc + cur.brokenMoneyAmount,
                0,
            ),
            products: statistics,
        };
    }
}
