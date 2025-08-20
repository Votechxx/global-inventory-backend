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
import {
    CreateShipmentDto,
    UpdateShipmentDto,
    ShipmentQueryDto,
} from './dto/shipment.dto';

@ApiTags('Shipment')
@Controller('shipments')
export class ShipmentController {
    constructor(private readonly shipmentService: ShipmentService) {}

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Create a new shipment',
        description: 'Create a new shipment by admin',
    })
    @Post()
    async createShipment(
        @Body() createShipmentDto: CreateShipmentDto,
        @GetUser() user: User,
    ) {
        return this.shipmentService.createShipment(createShipmentDto, user);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Update shipment data',
        description: 'Update shipment details, expenses, or status by admin',
    })
    @Patch(':id')
    async updateShipment(
        @Param('id') id: number,
        @Body() updateShipmentDto: UpdateShipmentDto,
        @GetUser() user: User,
    ) {
        return this.shipmentService.updateShipment(
            +id,
            updateShipmentDto,
            user,
        );
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Get weekly shipment summary',
        description: 'Get summary of shipments for the current week',
    })
    @Get('weekly-summary')
    async getWeeklySummary(@GetUser() user: User) {
        return this.shipmentService.getWeeklySummary();
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Get shipment details',
        description: 'Get details of a specific shipment',
    })
    @Get(':id')
    async getShipment(@Param('id') id: number, @GetUser() user: User) {
        return this.shipmentService.getShipment(+id);
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Get all shipments',
        description: 'Get a list of all shipments with pagination',
    })
    @Get()
    async getAllShipments(
        @Query() query: ShipmentQueryDto,
        @GetUser() user: User,
    ) {
        const { page = 1, limit = 10 } = query;
        return this.shipmentService.getAllShipments(page, limit);
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Get total shipments count',
        description: 'Get the total number of shipments',
    })
    @Get('count')
    async getShipmentsCount(@GetUser() user: User) {
        return this.shipmentService.getShipmentsCount();
    }
}
