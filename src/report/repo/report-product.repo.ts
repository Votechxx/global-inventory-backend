import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { CreateReportProductDto } from '../dto/report-product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReportProductRepo {
    constructor(private readonly prismaService: PrismaService) {}

    async createReportProduct(
        body: CreateReportProductDto[],
        prisma: Prisma.TransactionClient = this.prismaService,
    ) {
        return prisma.reportProduct.createMany({
            data: body,
        });
    }

    async deleteReportProductsByReportId(
        reportId: number,
        prisma: Prisma.TransactionClient = this.prismaService,
    ) {
        return prisma.reportProduct.deleteMany({
            where: { reportId },
        });
    }

    async getReportProductsByReportId(reportId: number) {
        return this.prismaService.reportProduct.findMany({
            where: { reportId },
            include: { ProductUnit: true },
        });
    }
}
