import { ApiProperty, OmitType, PickType } from '@nestjs/swagger';
import { FileDto } from 'src/file/dto/file.dto';

export class UploadS3FileDto extends PickType(FileDto, ['category']) {
    @ApiProperty({
        description: 'The file to upload',
        type: 'string',
        format: 'binary',
        required: true,
    })
    file: Express.Multer.File;
}

export class UploadS3FilesDto extends PickType(FileDto, ['category']) {
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

export class CreateS3FileDto extends OmitType(FileDto, [
    'source',
    'id',
    'createdAt',
    'updatedAt',
]) {}
