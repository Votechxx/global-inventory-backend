import {
    Controller,
    Post,
    Body,
    UseInterceptors,
    UploadedFiles,
    UploadedFile,
} from '@nestjs/common';
import { LocalService } from './local.service';
import { UploadLocalFileDto, UploadLocalFilesDto } from './dto/local.dto';
import {
    ApiBearerAuth,
    ApiConsumes,
    ApiOperation,
    ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { UPLOAD_PATH } from 'src/common/constants/path.constant';
import { existsSync, mkdirSync } from 'fs';
import { extname } from 'path';

@ApiTags('Local Upload')
@Controller('local')
export class LocalController {
    constructor(private readonly localService: LocalService) {}

    @Post('files')
    @ApiConsumes('multipart/form-data')
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Upload multiple local files',
        description: 'Upload multiple local files',
    })
    @UseInterceptors(
        FilesInterceptor('files', 10, {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const category = req.body.category;
                    const uploadPath = `${UPLOAD_PATH}/${category}`;

                    // You might want to make sure the folder exists
                    if (!existsSync(uploadPath))
                        mkdirSync(uploadPath, { recursive: true });

                    cb(null, uploadPath);
                },
                filename: (req, file, cb) => {
                    // Optional: you can customize filename here too
                    const uniqueSuffix =
                        Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
                },
            }),
        }),
    )
    uploadLocalFiles(
        @Body() createLocalDto: UploadLocalFilesDto,
        @UploadedFiles() files: Express.Multer.File[],
    ) {
        createLocalDto.files = files;
        return this.localService.uploadLocalFiles(createLocalDto);
    }

    @Post('file')
    @ApiConsumes('multipart/form-data')
    @ApiBearerAuth('default')
    @ApiOperation({
        summary: 'Upload a local file',
        description: 'Upload a local file',
    })
    @UseInterceptors(
        FileInterceptor('file', {
            storage: diskStorage({
                destination: (req, file, cb) => {
                    const category = req.body.category;
                    const uploadPath = `${UPLOAD_PATH}/${category}`;

                    // You might want to make sure the folder exists
                    if (!existsSync(uploadPath))
                        mkdirSync(uploadPath, { recursive: true });

                    cb(null, uploadPath);
                },
                filename: (req, file, cb) => {
                    // Optional: you can customize filename here too
                    const uniqueSuffix =
                        Date.now() + '-' + Math.round(Math.random() * 1e9);
                    const ext = extname(file.originalname);
                    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
                },
            }),
        }),
    )
    uploadLocalFile(
        @Body() createLocalDto: UploadLocalFileDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        createLocalDto.file = file;
        return this.localService.uploadLocalFile(createLocalDto);
    }
}
