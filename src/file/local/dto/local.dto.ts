import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { FileDto } from 'src/file/dto/file.dto';

export class UploadLocalFileDto extends PickType(FileDto, ['category']) {
    @ApiProperty({
        description: 'The file to upload',
        type: 'string',
        format: 'binary',
        required: true,
    })
    file: Express.Multer.File;
}

export class UploadLocalFilesDto extends PickType(FileDto, ['category']) {
    @ApiProperty({
        description: 'The files to upload',
        type: 'array',
        items: {
            type: 'string',
            format: 'binary',
        },
        required: true,
    })
    files: Express.Multer.File[];
}

export class CreateLocalFileDto extends OmitType(FileDto, [
    'isUsed',
    'source',
    'id',
    'createdAt',
    'updatedAt',
]) {}
