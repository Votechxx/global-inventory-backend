import {
    ForbiddenException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { ReportQueryDto, SubmitReportDto } from './dto/report.dto';
import { RoleEnum, User } from '@prisma/client';
import { ReportRepo } from './repo/report.dto';
import { UserRepo } from 'src/core/user/repo/user.repo';
import { InventoryRepo } from 'src/inventory/repo/inventory.repo';
import { ProductRepo } from 'src/product/repo/product.repo';

@Injectable()
export class ReportService {
    constructor(
        private readonly reportRepo: ReportRepo,
        private readonly userRepo: UserRepo,
        private readonly inventoryRepo: InventoryRepo,
        private readonly productRepo: ProductRepo,
    ) {}

    async submitReport(submitReportDto: SubmitReportDto, currentUser: User) {
        const user = await this.userRepo.getUserById(currentUser.id);
        const inventoryId = user.inventoryId;
        const inventory =
            await this.inventoryRepo.getInventoryById(inventoryId);
        if (!inventory) throw new NotFoundException('Inventory not found');
        const products =
            await this.productRepo.getAllInventoryProducts(inventoryId);
    }

    async getAllReports(query: ReportQueryDto, currentUser: User) {
        if (currentUser.role !== RoleEnum.ADMIN) {
            const user = await this.userRepo.getUserById(currentUser.id);
            query.inventoryId = user.inventoryId;
        }
        return this.reportRepo.getAllReports(query);
    }

    async getReportById(id: number, currentUser: User) {
        if (currentUser.role !== RoleEnum.ADMIN) {
            const user = await this.userRepo.getUserById(currentUser.id);
            const report = await this.reportRepo.getReportById(id);
            if (report.inventoryId !== user.inventoryId) {
                throw new ForbiddenException('Forbidden access to this report');
            }
        }
        return this.reportRepo.getReportById(id);
    }

    async createReport() {
        // return this.reportRepo.createReport(data);
    }
}
