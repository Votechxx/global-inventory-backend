import { PrismaClient } from '@prisma/client';

export abstract class BaseRepo<T> {
    constructor(
        protected readonly prismaClient: PrismaClient,
        protected readonly modelName: keyof PrismaClient,
    ) {}

    protected get model(): any {
        return this.prismaClient[this.modelName];
    }

    async findAll(): Promise<T[]> {
        return this.model.findMany();
    }

    async findById(id: string | number): Promise<T | null> {
        return this.model.findUnique({ where: { id } });
    }

    async create(data: Partial<T>): Promise<T> {
        return this.model.create({ data });
    }

    async update(id: string | number, data: Partial<T>): Promise<T> {
        return this.model.update({ where: { id }, data });
    }

    async delete(id: string | number): Promise<T> {
        return this.model.delete({ where: { id } });
    }
}
