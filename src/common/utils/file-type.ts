import { BadRequestException } from '@nestjs/common';
import { FileTypeEnum } from '@prisma/client';

export function getFileTypeFromMimetype(
    mimetype: string | false,
): FileTypeEnum {
    const fileType = mimetype;
    if (!fileType) {
        throw new BadRequestException('Invalid file type');
    }
    let fileCategoryType: FileTypeEnum;
    if (fileType.startsWith('image/')) fileCategoryType = FileTypeEnum.IMAGE;
    else if (fileType.startsWith('video/'))
        fileCategoryType = FileTypeEnum.VIDEO;
    else if (
        fileType.startsWith('application/') ||
        fileType.startsWith('text/')
    )
        fileCategoryType = FileTypeEnum.DOCUMENT;
    else throw new BadRequestException('Invalid file type');
    return fileCategoryType;
}
