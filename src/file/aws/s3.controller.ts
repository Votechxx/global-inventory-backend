import {
    Controller,
    Post,
    Body,
    UseInterceptors,
    UploadedFiles,
    UploadedFile,
} from '@nestjs/common';
import { UploadS3FileDto, UploadS3FilesDto } from './dto/s3.dto';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { S3Service } from './s3.service';

@ApiTags('AWS S3 Upload')
@Controller('aws-s3')
export class S3Controller {
    constructor(private readonly s3Service: S3Service) {}

    @Post('files')
    @ApiConsumes('multipart/form-data')
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Upload multiple cloud files',
        description: 'Upload multiple cloud files',
    })
    @UseInterceptors(FilesInterceptor('files', 10))
    uploadS3Files(
        @Body() body: UploadS3FilesDto,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        body.files = files;
        return this.s3Service.uploadS3Files(body);
    }

    @Post('file')
    @ApiConsumes('multipart/form-data')
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Upload a cloud file',
        description: 'Upload a cloud file',
    })
    @UseInterceptors(FileInterceptor('file'))
    uploadS3File(
        @Body() body: UploadS3FileDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        body.file = file;
        return this.s3Service.uploadS3File(body);
    }

    @Post('get-signed-url/:key')
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Get a file from S3',
        description: 'Get a file from S3 by its key',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                key: {
                    type: 'string',
                    example: 'category/unique-id.extension',
                    description: 'files path (key) in s3 bucket',
                },
            },
            required: ['key'],
        },
    })
    getFile(@Body('key') key: string) {
        return this.s3Service.getSignedUrl(key);
    }
}
