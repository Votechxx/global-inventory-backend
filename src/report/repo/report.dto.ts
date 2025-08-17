import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { CreateReportDto, ReportQueryDto } from '../dto/report.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ReportRepo {
    constructor(private readonly prismaService: PrismaService) {}

    async getAllReports(query: ReportQueryDto) {
        const { page = 1, limit = 10, ...filter } = query;

        const where: Prisma.ReportWhereInput = {
            ...filter,
        };

        const [reports, total] = await Promise.all([
            this.prismaService.report.findMany({
                where,
                skip: (page - 1) * limit,
                take: limit,
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            this.prismaService.report.count({
                where,
            }),
        ]);
        return {
            data: reports,
            totalDocs: total,
        };
    }

    async getReportById(id: number) {
        return this.prismaService.report.findUnique({
            where: { id },
        });
    }

    async createReport(data: CreateReportDto) {
        return this.prismaService.report.create({
            data,
        });
    }
}
