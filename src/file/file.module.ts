import { Global, Module } from '@nestjs/common';
import { LocalModule } from './local/local.module';
import { FileRepo } from './repo/file.repo';
import { S3Module } from './aws/s3.module';
import { FileService } from './file.service';

@Global()
@Module({
    imports: [LocalModule, S3Module],
    providers: [FileRepo, FileService],
    exports: [FileRepo],
})
export class FileModule {}
