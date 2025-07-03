import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/modules/prisma/prisma.service';
import { CreateFileDto } from '../dto/file.dto';
import { FileSourceEnum, Prisma } from '@prisma/client';
import { CreateLocalFileDto } from '../local/dto/local.dto';
import { FileCategoryEnum } from '../enum/file-category.enum';

@Injectable()
export class FileRepo {
    constructor(private readonly prismaService: PrismaService) {}

    async createFile(createFileDto: CreateFileDto) {
        return this.prismaService.file.create({
            data: createFileDto,
        });
    }

    async createLocalFile(createLocalFileDto: CreateLocalFileDto) {
        return this.prismaService.file.create({
            data: { ...createLocalFileDto, source: FileSourceEnum.LOCAL },
            select: {
                id: true,
            },
        });
    }

    async createBulkFiles(createFileDtos: CreateFileDto[]) {
        return this.prismaService.file.createMany({
            data: createFileDtos,
        });
    }

    async createBulkLocalFiles(createLocalFileDtos: CreateLocalFileDto[]) {
        const createdFiles = await Promise.all(
            createLocalFileDtos.map((file) =>
                this.prismaService.file.create({
                    data: {
                        ...file,
                        source: FileSourceEnum.LOCAL,
                    },
                    select: {
                        id: true,
                    },
                }),
            ),
        );
        return createdFiles;
    }

    async getFile(id: number) {
        return this.prismaService.file.findUnique({
            where: { id },
        });
    }

    async getUnAssociatedFileByIdAndCategory(
        id: number,
        category: FileCategoryEnum,
    ) {
        return this.prismaService.file.findUnique({
            where: {
                isUsed: false, // Only get files that are not already used
                id,
                category,
            },
        });
    }

    async getUnAssociatedFilesByIds(ids: number[]) {
        return this.prismaService.file.findMany({
            where: { id: { in: ids }, isUsed: false }, // Only get files that are not already used
        });
    }

    async getUnAssociatedFilesByIdsAndCategory(
        ids: number[],
        category: FileCategoryEnum,
    ) {
        return this.prismaService.file.findMany({
            where: {
                isUsed: false, // Only get files that are not already used
                id: { in: ids },
                category,
            },
        });
    }

    async associateFilesToItem(
        itemId: number,
        fileIds: number[],
        category: FileCategoryEnum,
        prisma: Prisma.TransactionClient = this.prismaService,
    ) {
        return prisma.file.updateMany({
            where: {
                id: { in: fileIds },
                category,
                isUsed: false, // Only associate files that are not already used
            },
            data: {
                isUsed: true, // Mark files as used
                
            },
        });
    }
}
