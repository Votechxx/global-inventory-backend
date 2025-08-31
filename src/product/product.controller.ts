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
import { ProductService } from './product.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { GetUser } from '../core/auth/decorator/get-user.decorator';
import { RoleEnum, User } from '@prisma/client';
import { RolesGuard } from '../core/auth/guard/roles.guard';
import { Roles } from '../core/auth/decorator/roles.decorator';
import {
    CreateProductDto,
    UpdateProductDto,
    AddToInventoryDto,
    productQueryDto,
} from './dto/product.dto';

@ApiTags('Product')
@Controller('products')
export class ProductController {
    constructor(private readonly productService: ProductService) {}

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Create a new product',
        description: 'Create a new product by admin',
    })
    @Post()
    createProduct(@Body() createProductDto: CreateProductDto) {
        return this.productService.createProduct(createProductDto);
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Get product details',
        description: 'Get details of a specific product',
    })
    @Get(':id')
    async getProduct(@Param('id') id: number) {
        return this.productService.getProduct(+id);
    }

    @UseGuards(AuthGuard('jwt'))
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Get all products',
        description: 'Get a list of all products',
    })
    @Get()
    async getAllProducts(
        @GetUser() user: User,
        @Query() query: productQueryDto,
    ) {
        return this.productService.getAllProducts(user, query);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Update product data',
        description: 'Update product details by admin',
    })
    @Patch(':id')
    async updateProduct(
        @Param('id') id: number,
        @Body() updateProductDto: UpdateProductDto,
    ) {
        return this.productService.updateProduct(+id, updateProductDto);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Delete product',
        description: 'Delete product by admin',
    })
    @Delete(':id')
    deleteProduct(@Param('id') id: number, @GetUser() user: User) {
        return this.productService.deleteProduct(+id);
    }

    @UseGuards(AuthGuard('jwt'), RolesGuard)
    @Roles(RoleEnum.ADMIN)
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Add product to inventory',
        description: 'Add a product to a specific inventory by admin',
    })
    @Post(':id/inventory')
    async addToInventory(
        @Param('id') id: number,
        @Body() addToInventoryDto: AddToInventoryDto,
    ) {
        return this.productService.addToInventory(+id, addToInventoryDto);
    }
}
