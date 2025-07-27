import {
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import {
    CreateS3FileDto,
    UploadS3FileDto,
    UploadS3FilesDto,
} from './dto/s3.dto';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { FileRepo } from '../repo/file.repo';
import * as mimeType from 'mime-types';
import { ENV_VARIABLES } from 'src/common/config/env.config';
import { getFileTypeFromMimetype } from 'src/common/utils/file-type';
import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
} from '@aws-sdk/client-s3';
import { fileExtensionToContentTypeConfig } from '../config/file.config';
import { fileHelper } from '../helper/s3.helper';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class S3Service {
    private s3: S3Client;
    private bucketName = ENV_VARIABLES.s3BucketName;

    constructor(private readonly fileRepo: FileRepo) {
        this.s3 = new S3Client({
            region: ENV_VARIABLES.s3Region,
            credentials: {
                accessKeyId: ENV_VARIABLES.s3AccessKeyId,
                secretAccessKey: ENV_VARIABLES.s3SecretAccessKey,
            },
        });
    }

    /**
     * Upload a file to S3 securely (private access).
     */
    async uploadS3File(uploadS3FileDto: UploadS3FileDto) {
        const fileExtension = this.extractFileExtension(
            uploadS3FileDto.file.originalname,
        );
        const fileContentType = fileExtensionToContentTypeConfig[fileExtension];

        fileHelper.validateContentTypeExist(fileContentType);
        fileHelper.validateFileExtension({
            fileCategory: uploadS3FileDto.category,
            fileExtension,
        });

        const fileSize = uploadS3FileDto.file.size; // in bytes
        fileHelper.validateFileSize(fileSize, uploadS3FileDto.category);

        const uniqueId = uuidv4();
        const key = `${uploadS3FileDto.category}/${uniqueId}.${fileExtension}`;

        const file = await this.fileRepo.createS3File({
            category: uploadS3FileDto.category,
            name: uploadS3FileDto.file.originalname,
            path: key,
            size: uploadS3FileDto.file.size,
            type: getFileTypeFromMimetype(
                mimeType.lookup(uploadS3FileDto.file.originalname),
            ),
            url: 'NO_URL',
        });

        const command: PutObjectCommand = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            Body: uploadS3FileDto.file.buffer,
            ContentType: fileContentType,
            ACL: 'private',
        });

        try {
            const result = await this.s3.send(command);
            console.log({
                result,
            });
        } catch (err) {
            Logger.error('Upload S3 error:', err);
            throw new InternalServerErrorException(err.message);
        }

        return file.id;
    }

    async uploadS3Files(uploadS3FilesDto: UploadS3FilesDto) {
        const commands: PutObjectCommand[] = [];
        const filesBody: CreateS3FileDto[] = [];
        uploadS3FilesDto.files.forEach((file) => {
            const fileExtension = this.extractFileExtension(file.originalname);
            const fileContentType =
                fileExtensionToContentTypeConfig[fileExtension];

            fileHelper.validateContentTypeExist(fileContentType);
            fileHelper.validateFileExtension({
                fileCategory: uploadS3FilesDto.category,
                fileExtension,
            });

            const fileSize = file.size; // in bytes
            fileHelper.validateFileSize(fileSize, uploadS3FilesDto.category);

            const uniqueId = uuidv4();
            const key = `${uploadS3FilesDto.category}/${uniqueId}.${fileExtension}`;

            commands.push(
                new PutObjectCommand({
                    Bucket: this.bucketName,
                    Key: key,
                    Body: file.buffer,
                    ContentType: fileContentType,
                    ACL: 'private',
                }),
            );

            filesBody.push({
                category: uploadS3FilesDto.category,
                name: file.originalname,
                path: `${uploadS3FilesDto.category}/${uuidv4()}.${fileExtension}`,
                size: file.size,
                type: getFileTypeFromMimetype(
                    mimeType.lookup(file.originalname),
                ),
                url: 'NO_URL',
            });
        });
        const createdFiles = await this.fileRepo.createBulkS3Files(filesBody);

        const uploadPromises = commands.map(async (command) => {
            return this.s3.send(command).then((data) => {
                if (
                    !data.$metadata.httpStatusCode ||
                    data.$metadata.httpStatusCode !== 200
                ) {
                    throw new InternalServerErrorException(
                        'Failed to upload file to S3',
                    );
                }
            });
        });

        await Promise.all(uploadPromises);
        // Maybe in the future to use mq to remove succeeded files from aws

        return createdFiles.map((file) => file.id);
    }

    /**
     * Generate a pre-signed URL to read the file (valid temporarily).
     */
    async getSignedUrl(key: string, expiresInSeconds = 300): Promise<string> {
        const command: GetObjectCommand = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });
        try {
            return await getSignedUrl(this.s3, command, {
                expiresIn: expiresInSeconds,
            });
        } catch (err) {
            Logger.error('Error generating signed URL:', err);
            throw new InternalServerErrorException(
                'Failed to generate signed URL: ' + err.message,
            );
        }
    }

    /**
     * Extracts and returns the file extension from the given file name.
     *
     * @param fileName - The file name (e.g., "photo.png").
     * @returns The file extension (e.g., "png").
     */
    private extractFileExtension(fileName: string): string {
        return fileName.split('.').pop();
    }
}
