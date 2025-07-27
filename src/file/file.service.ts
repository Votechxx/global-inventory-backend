import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { FileRepo } from './repo/file.repo';

@Injectable()
export class FileService {
    constructor(private readonly fileRepo: FileRepo) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async removeUnusedFiles() {
        return this.fileRepo.removeAllUnusedFilesExceededADay();
    }
}
