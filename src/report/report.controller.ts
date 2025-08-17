import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ReportService } from './report.service';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { ReportQueryDto } from './dto/report.dto';
import { GetUser } from 'src/core/auth/decorator/get-user.decorator';
import { User } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';

@Controller('report')
export class ReportController {
    constructor(private readonly reportService: ReportService) {}

    @Get()
    @ApiOperation({
        summary: 'Get all reports',
        description:
            'Fetches all reports with pagination and filtering options.',
    })
    @ApiBearerAuth('default')
    @UseGuards(AuthGuard('jwt'))
    async getAllReports(@Query() query: ReportQueryDto, @GetUser() user: User) {
        return this.reportService.getAllReports(query, user);
    }

    @Get(':id')
    @ApiOperation({
        summary: 'Get report by ID',
        description: 'Fetches a specific report by its ID.',
    })
    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('default')
    async getReportById(@Query('id') id: number, @GetUser() user: User) {
        return this.reportService.getReportById(id, user);
    }
}
