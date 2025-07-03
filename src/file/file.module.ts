import { Global, Module } from '@nestjs/common';
import { LocalModule } from './local/local.module';
import { FileRepo } from './repo/file.repo';

@Global()
@Module({
    imports: [LocalModule],
    providers: [FileRepo],
    exports: [FileRepo],
})
export class FileModule {}
