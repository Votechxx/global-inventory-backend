import {
  Body,
  Controller,
  Get,
  Param,
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
import { CreateShipmentDto, ShipmentResponseDto, ShipmentQueryDto } from './dto/shipment.dto';

@ApiTags('Shipments')
@Controller('shipments')
export class ShipmentController {
  constructor(private readonly shipmentService: ShipmentService) {}

  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(RoleEnum.ADMIN)
  @ApiBearerAuth('default')
  @ApiOperation({ summary: 'Create a new shipment' })
  @Post()
  createShipment(
    @Body() createShipmentDto: CreateShipmentDto,
    @GetUser() user: User,
  ): Promise<ShipmentResponseDto> {
    return this.shipmentService.createShipment(createShipmentDto, user);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('default')
  @ApiOperation({ summary: 'Get shipment by ID' })
  @Get(':id')
  getShipment(@Param('id') id: number): Promise<ShipmentResponseDto> {
    return this.shipmentService.getShipment(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('default')
  @ApiOperation({ summary: 'Get shipments count' })
  @Get('count')
  getShipmentsCount() {
    return this.shipmentService.getShipmentsCount();
  }

  @UseGuards(AuthGuard('jwt'))
  @ApiBearerAuth('default')
  @ApiOperation({ summary: 'Get all shipments with pagination' })
  @Get()
  getAllShipments(
    @Query() query: ShipmentQueryDto,
  ): Promise<{ shipments: ShipmentResponseDto[]; total: number }> {
    return this.shipmentService.getAllShipments(query.page, query.limit);
  }
}