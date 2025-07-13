import {
    Controller,
    Get,
    Post,
    Body,
    Patch,
    Param,
    Delete,
    UseGuards,
} from '@nestjs/common';
import { ShopsService } from './shops.service';
import { CreateShopDto, UpdateShopDto } from './dto/shop.dto';
import { RoleEnum, shop } from '@prisma/client';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Roles } from 'src/core/auth/decorator/roles.decorator';
import { RolesGuard } from 'src/core/auth/guard/roles.guard';

@Controller('shops')
export class ShopsController {
    constructor(private readonly shopsService: ShopsService) {}

    @Post()
    @UseGuards(AuthGuard('jwt') , RolesGuard)
    @ApiBearerAuth('default')
    @Roles(RoleEnum.ADMIN)
    @ApiOperation({ summary: 'Create a new shop' })
    @ApiResponse({
        status: 201,
        description: 'The shop has been successfully created.',

    })
    create(@Body() createShopDto: CreateShopDto): Promise<shop> {
        return this.shopsService.create(createShopDto);
    }

    @Get()
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth('default')
    @Roles(RoleEnum.ADMIN, RoleEnum.USER)
    @ApiOperation({ summary: 'Retrieve all shops' })
    @ApiResponse({
        status: 200,
        description: 'Returns an array of shops.',
    })
    findAll() {
        return this.shopsService.findAll();
    }

    @Get(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth('default')
    @Roles(RoleEnum.ADMIN, RoleEnum.USER)
    @ApiOperation({ summary: 'Retrieve a shop by ID' })
    @ApiResponse({
        status: 200,
        description: 'Returns the shop with the specified ID.',
    })
    findOne(@Param('id') id: string) {
        return this.shopsService.findOne(+id);
    }

    @Patch(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth('default')
    @Roles(RoleEnum.ADMIN)
    @ApiOperation({ summary: 'Update a shop by ID' })
    @ApiResponse({
        status: 200,
        description: 'The shop has been successfully updated.',
    })
    update(@Param('id') id: string, @Body() updateShopDto: UpdateShopDto) {
        return this.shopsService.update(+id, updateShopDto);
    }

    @Delete(':id')
    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @ApiBearerAuth('default')
    @Roles(RoleEnum.ADMIN)
    @ApiOperation({ summary: 'Delete a shop by ID' })
    @ApiResponse({
        status: 200,
        description: 'The shop has been successfully deleted.',
    })
    remove(@Param('id') id: string) {
        return this.shopsService.remove(+id);
    }
}
