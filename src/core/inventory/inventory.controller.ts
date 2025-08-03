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
import { GetUser } from '../auth/decorator/get-user.decorator';
import { RoleEnum, User } from '@prisma/client';
import { RolesGuard } from '../auth/guard/roles.guard';
import { Roles } from '../auth/decorator/roles.decorator';
import { AddProductDto } from './dto/add-product.dto';
import { AddWorkerDto } from './dto/add-worker.dto';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { InventoryQueryDto } from './dto/inventory-query.dto';
import { UpdateInventoryDto } from './dto/update-inventory.dto';

@ApiTags('Inventory')
@Controller('inventories')
export class InventoryController {
    constructor(private readonly inventoryService: InventoryService) {}

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Get my inventory data',
        description: 'Get the inventory data for the authenticated user',
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
        description: 'Get list of inventories with pagination and filters',
    })
    @Get()
    async getInventories(
        @Query() inventoryQueryDto: InventoryQueryDto,
        @GetUser() user: User,
    ) {
        return this.inventoryService.getInventories(inventoryQueryDto, user);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Add product to inventory',
        description: 'Add a product to a specific inventory by admin',
    })
    @Post(':id/products')
    async addProduct(
        @Param('id') id: number,
        @Body() addProductDto: AddProductDto,
        @GetUser() user: User,
    ) {
        return this.inventoryService.addProductToInventory(
            +id,
            addProductDto,
            user.id,
        );
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
        @Body() addWorkerDto: AddWorkerDto,
        @GetUser() user: User,
    ) {
        return this.inventoryService.addWorkerToInventory(
            +id,
            addWorkerDto,
            user.id,
        );
    }
}
