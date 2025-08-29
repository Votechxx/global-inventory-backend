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
    RequestShipmentUpdateDto,
    SubmitShipmentForReview,
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
        description:
            'Update shipment details, expenses, or products by admin for a specific inventory',
    })
    @Patch(':id')
    async updateShipment(
        @Param('id') id: number,
        @Body() updateShipmentDto: UpdateShipmentDto,
    ) {
        return this.shipmentService.updateShipment(id, updateShipmentDto);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Send shipment for review',
        description:
            'Send shipment for admin review with a message for a specific inventory',
    })
    @Patch(':id/request-update')
    async sendForReview(
        @Param('id') id: number,
        @Body() body: RequestShipmentUpdateDto,
    ) {
        return this.shipmentService.requestUpdate(id, body);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Accept shipment',
        description: 'Accept shipment and update inventory',
    })
    @Patch(':id/accept')
    async acceptShipment(@Param('id') id: number) {
        return this.shipmentService.acceptShipment(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Get shipment details ',
        description: 'Get details of shipment',
    })
    @Get(':id')
    async getShipment(@Param('id') inventoryId: number) {
        return this.shipmentService.getShipment(inventoryId);
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
        return this.shipmentService.getAllShipments(query, user);
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Get total shipments count',
        description: 'Get the total number of shipments',
    })
    @Get('count')
    async getShipmentsCount() {
        return this.shipmentService.getShipmentsCount();
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.USER)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Submit shipment for review',
        description: 'Submit shipment for review by user',
    })
    @Post(':id/submit-for-review')
    async submitShipmentForReview(
        @Param('id') id: number,
        @Body() body: SubmitShipmentForReview,
        @GetUser() user: User,
    ) {
        return this.shipmentService.submitShipmentForReview(id, body, user);
    }
}
