import {
    Controller,
    Get,
    Post,
    Body,
    Param,
    UseGuards,
    Query,
    Put,
    Patch,
} from '@nestjs/common';
import { ReportService } from './report.service';
import {
    ReportQueryDto,
    SubmitDepositDto,
    UserCreateReportDto,
} from './dto/report.dto';
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

    @Put(':id/update-requested')
    @ApiBearerAuth('default')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.USER)
    @ApiOperation({
        summary: 'Update report, (admin asked for changes)',
        description: 'Update report requested',
    })
    updateReportAfterReview(
        @Param('id') id: number,
        @Body() body: UserCreateReportDto,
        @GetUser() user: User,
    ) {
        return this.reportService.updateReportAfterReview(+id, body, user);
    }

    @Patch(':id/request-changes')
    @ApiBearerAuth('default')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiOperation({
        summary: 'Request changes on a report (admin)',
        description: 'Request changes on a report',
    })
    requestChanges(@Param('id') id: number) {
        return this.reportService.requestChanges(+id);
    }

    @Patch(':id/accept-level-one')
    @ApiBearerAuth('default')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiOperation({
        summary: 'Approve a report level one by admin (admin)',
        description: 'Approve a report',
    })
    approveReport(@Param('id') id: number) {
        return this.reportService.acceptLevelOne(+id);
    }

    @Patch(':id/submit-deposit')
    @ApiBearerAuth('default')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.USER)
    @ApiOperation({
        summary: 'Submit deposit for a report (user)',
        description: 'Submit deposit for a report',
    })
    submitDepositForReport(
        @Param('id') id: number,
        @Body() body: SubmitDepositDto,
        @GetUser() user: User,
    ) {
        return this.reportService.submitDepositForReport(+id, body, user);
    }

    @Patch(':id/request-changes-at-deposit')
    @ApiBearerAuth('default')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiOperation({
        summary: 'Request changes at deposit stage (admin)',
        description: 'Request changes at deposit stage',
    })
    requestChangesAtDeposit(@Param('id') id: number) {
        return this.reportService.requestChangesAtDeposit(+id);
    }

    @Patch(':id/final-acceptance')
    @ApiBearerAuth('default')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiOperation({
        summary: 'Final acceptance of a report (admin)',
        description: 'Final acceptance of a report',
    })
    finalAcceptance(@Param('id') id: number) {
        return this.reportService.finalAccept(+id);
    }
}
