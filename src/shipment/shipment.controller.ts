import {
    Body,
    Controller,
    Get,
    Param,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import { ShipmentService } from './shipment.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../core/auth/decorator/get-user.decorator';
import { RoleEnum, User } from '@prisma/client';
import { RolesGuard } from '../core/auth/guard/roles.guard';
import { Roles } from '../core/auth/decorator/roles.decorator';
import { CreateShipmentDto, UpdateShipmentDto, ShipmentQueryDto } from './dto/shipment.dto';

@ApiTags('Shipment')
@Controller('shipments')
export class ShipmentController {
    constructor(private readonly shipmentService: ShipmentService) {}

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({ summary: 'Create a new shipment', description: 'Create a new shipment by admin' })
    @Post()
    async createShipment(@Query('inventoryId') inventoryId: number, @Body() createShipmentDto: CreateShipmentDto, @GetUser() user: User) {
        return this.shipmentService.createShipment(inventoryId, createShipmentDto, user);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({ summary: 'Update shipment data', description: 'Update shipment details, expenses, or products by admin for a specific inventory' })
    @Patch(':id')
    async updateShipment(@Param('id') id: number, @Query('inventoryId') inventoryId: number, @Body() updateShipmentDto: UpdateShipmentDto) {
        return this.shipmentService.updateShipment(id, inventoryId, updateShipmentDto);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({ summary: 'Send shipment for review', description: 'Send shipment for admin review with a message for a specific inventory' })
    @Patch(':id/send-for-review')
    async sendForReview(@Param('id') id: number, @Query('inventoryId') inventoryId: number, @Body('reviewMessage') reviewMessage: string, @GetUser() user: User) {
        return this.shipmentService.sendForReview(id, inventoryId, reviewMessage, user);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({ summary: 'Accept shipment', description: 'Accept shipment and update inventory for a specific inventory' })
    @Patch(':id/accept')
    async acceptShipment(@Param('id') id: number, @Query('inventoryId') inventoryId: number, @GetUser() user: User) {
        return this.shipmentService.acceptShipment(id, inventoryId, user);
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('default')
    @ApiOperation({ summary: 'Get shipment details by inventory', description: 'Get details of shipments for a specific inventory' })
    @Get()
    async getShipment(@Query('inventoryId') inventoryId: number) {
        return this.shipmentService.getShipment(inventoryId);
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('default')
    @ApiOperation({ summary: 'Get all shipments', description: 'Get a list of all shipments with pagination' })
    @Get('all')
    async getAllShipments(@Query() query: ShipmentQueryDto) {
        const { page = 1, limit = 10 } = query;
        return this.shipmentService.getAllShipments(page, limit);
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('default')
    @ApiOperation({ summary: 'Get total shipments count', description: 'Get the total number of shipments' })
    @Get('count')
    async getShipmentsCount() {
        return this.shipmentService.getShipmentsCount();
    }
}