import { Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { S3Controller } from './s3.controller';
import { FileRepo } from '../repo/file.repo';

@Module({
    imports: [],
    controllers: [S3Controller],
    providers: [S3Service, FileRepo],
})
export class S3Module {}
