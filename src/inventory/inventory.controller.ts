import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../core/auth/decorator/get-user.decorator';
import { RoleEnum, User } from '@prisma/client';
import { RolesGuard } from '../core/auth/guard/roles.guard';
import { Roles } from '../core/auth/decorator/roles.decorator';
import { CreateInventoryDto, UpdateInventoryDto, AddWorkerToInventoryDto, InventoryQueryDto, SubmitDailyReportDto, ReviewDailyReportDto } from './dto/inventory.dto';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Inventory')
@Controller('inventories')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) {}

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Get my inventory data',
        description: 'Get the inventory data for the authenticated user with worker count',
    })
    @Get('me')
    async getMyInventory(@GetUser() user: User) {
        return this.inventoryService.getInventoryByUserId(user.id);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Create a new inventory',
        description: 'Create a new inventory by admin',
    })
    @Post()
    createInventory(@Body() createInventoryDto: CreateInventoryDto) {
        return this.inventoryService.createInventory(createInventoryDto);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Update inventory data',
        description: 'Update inventory details by admin',
    })
    @Patch(':id')
    async updateInventory(
        @Param('id') id: number,
        @Body() updateInventoryDto: UpdateInventoryDto,
    ) {
        return this.inventoryService.updateInventory(+id, updateInventoryDto);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Delete inventory',
        description: 'Delete inventory by admin',
    })
    @Delete(':id')
    deleteInventory(@Param('id') id: number) {
        return this.inventoryService.deleteInventory(+id);
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Get inventories list',
        description: 'Get list of inventories with worker count and sorted workers by createdAt',
    })
    @Get()
    async getInventories(@Query() inventoryQueryDto: InventoryQueryDto, @GetUser() user: User) {
        return this.inventoryService.getInventories(inventoryQueryDto, user);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Add worker to inventory',
        description: 'Add a worker to a specific inventory by admin',
    })
    @Post(':id/workers')
    async addWorker(
        @Param('id') id: number,
        @Body() addWorkerDto: AddWorkerToInventoryDto,
    ) {
        return this.inventoryService.addWorkerToInventory(+id, addWorkerDto.workerId);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Initialize inventory stock',
        description: 'Initialize stock for an existing inventory with products and cash',
    })
    @Post(':id/initialize-stock')
    async initializeInventoryStock(
        @Param('id') id: number,
        @Body() body: { products: { productId: number; quantity: number }[]; cashOnHand: number }
    ) {
        return this.inventoryService.initializeInventoryStock(id, body.products, body.cashOnHand);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Update inventory stock',
        description: 'Update stock for an existing inventory with products, cash, and optional deposit',
    })
    @Patch(':id/update-stock')
    async updateInventoryStock(
        @Param('id') id: number,
        @Body() body: { products: { productId: number; quantity: number }[]; cashOnHand: number; depositAmount?: number; fileId?: number }
    ) {
        return this.inventoryService.updateInventoryStock(id, body.products, body.cashOnHand, body.depositAmount, body.fileId);
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Submit daily report',
        description: 'Submit a daily report for an inventory with optional deposit receipt',
    })
    @Post(':id/reports')
    @UseInterceptors(FileInterceptor('file'))
    async submitDailyReport(
        @Param('id') id: number,
        @Body() submitDailyReportDto: SubmitDailyReportDto,
        @GetUser() user: User,
        @UploadedFile() file?: Express.Multer.File,
    ) {
        return this.inventoryService.submitDailyReport(id, user.id, submitDailyReportDto, file);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Review daily report',
        description: 'Review and approve/reject a daily report by admin',
    })
    @Patch('reports/:reportId')
    async reviewDailyReport(
        @Param('reportId') reportId: number,
        @Body() reviewDailyReportDto: ReviewDailyReportDto,
    ) {
        return this.inventoryService.reviewDailyReport(reportId, reviewDailyReportDto);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Review inventory',
        description: 'Review an inventory for consistency and send a message',
    })
    @Post(':id/review')
    async reviewInventory(
        @Param('id') id: number,
        @Body() body: { reviewMessage: string }
    ) {
        return this.inventoryService.reviewInventory(id, body.reviewMessage);
    }
}