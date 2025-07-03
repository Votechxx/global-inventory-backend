import { Injectable } from '@nestjs/common';
import { UploadLocalFileDto, UploadLocalFilesDto } from './dto/local.dto';
import { FileRepo } from '../repo/file.repo';
import * as mimeType from 'mime-types';
import { ENV_VARIABLES } from 'src/common/config/env.config';
import { getFileTypeFromMimetype } from 'src/common/utils/file-type';

@Injectable()
export class LocalService {
    constructor(private readonly fileRepo: FileRepo) {}

    async uploadLocalFile(uploadLocalFileDto: UploadLocalFileDto) {
        const file = await this.fileRepo.createLocalFile({
            category: uploadLocalFileDto.category,
            name: uploadLocalFileDto.file.originalname,
            path: `${uploadLocalFileDto.category}/${uploadLocalFileDto.file.filename}`,
            size: uploadLocalFileDto.file.size,
            type: getFileTypeFromMimetype(
                mimeType.lookup(uploadLocalFileDto.file.originalname),
            ),
            url: `${ENV_VARIABLES.baseUrl}/static-uploads/${uploadLocalFileDto.category}/${uploadLocalFileDto.file.filename}`,
        });
        return file.id;
    }

    async uploadLocalFiles(uploadLocalFilesDto: UploadLocalFilesDto) {
        const files = await this.fileRepo.createBulkLocalFiles(
            uploadLocalFilesDto.files.map((file) => ({
                category: uploadLocalFilesDto.category,
                name: file.originalname,
                path: `${uploadLocalFilesDto.category}/${file.filename}`,
                size: file.size,
                type: getFileTypeFromMimetype(
                    mimeType.lookup(file.originalname),
                ),
                url: `${ENV_VARIABLES.baseUrl}/static-uploads/${uploadLocalFilesDto.category}/${file.filename}`,
            })),
        );
        return files.map((file) => file.id);
    }
}
