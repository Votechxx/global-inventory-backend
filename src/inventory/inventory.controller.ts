import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../core/auth/decorator/get-user.decorator';
import { RoleEnum, User } from '@prisma/client';
import { RolesGuard } from '../core/auth/guard/roles.guard';
import { Roles } from '../core/auth/decorator/roles.decorator';
import { CreateInventoryDto, UpdateInventoryDto, AddWorkerToInventoryDto, MoveWorkerDto, InventoryQueryDto } from './dto/inventory.dto';

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
        summary: 'Move worker to another inventory',
        description: 'Move a worker to a different inventory by admin',
    })
    @Post(':id/workers/move')
    async moveWorker(
        @Param('id') id: number,
        @Body() moveWorkerDto: MoveWorkerDto,
    ) {
        return this.inventoryService.moveWorker(+id, moveWorkerDto.workerId, moveWorkerDto.targetInventoryId);
    }
}