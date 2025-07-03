import { Module } from '@nestjs/common';
import { LocalService } from './local.service';
import { LocalController } from './local.controller';
import { FileRepo } from '../repo/file.repo';

@Module({
    imports: [],
    controllers: [LocalController],
    providers: [LocalService, FileRepo],
})
export class LocalModule {}
