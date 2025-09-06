import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Query,
} from '@nestjs/common';
import { ReportService } from './report.service';
import { ReportQueryDto, UserCreateReportDto } from './dto/report.dto';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesGuard } from 'src/core/auth/guard/roles.guard';
import { Roles } from 'src/core/auth/decorator/roles.decorator';
import { RoleEnum, User } from '@prisma/client';
import { GetUser } from 'src/core/auth/decorator/get-user.decorator';

@Controller('report')
@ApiTags('Report')
export class ReportController {
    constructor(private readonly reportService: ReportService) {}

    @Post()
    @ApiOperation({
        summary: 'Create a new report',
        description: 'Create a new report',
    })
    @ApiBearerAuth('default')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.USER)
    userCreate(@Body() body: UserCreateReportDto, @GetUser() user: User) {
        return this.reportService.userCreate(body, user);
    }

    @Get()
    @ApiBearerAuth('default')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({
        summary: 'Get all reports',
        description: 'Get all reports',
    })
    findAll(@Query() query: ReportQueryDto, @GetUser() user: User) {
        return this.reportService.findAll(query, user);
    }

    @Get(':id')
    @ApiBearerAuth('default')
    @UseGuards(AuthGuard('jwt'))
    @ApiOperation({
        summary: 'Get a report by ID',
        description: 'Get a report by ID',
    })
    findOne(@Param('id') id: string, @GetUser() user: User) {
        return this.reportService.findOne(+id, user);
    }
}
