import { FileCategoryEnum } from 'src/file/enum/file-category.enum';

export const fileMaxSizeConfig = {
    // size in bytes
    [FileCategoryEnum.GLOBAL]: 1024 * 1024 * 1, //1MB
    [FileCategoryEnum.REPORT_DEPOSIT]: 1024 * 1024 * 5, //1MB
    [FileCategoryEnum.USER]: 1024 * 1024 * 5, //1MB
};

export const fileAllowedExtensionsConfig = {
    [FileCategoryEnum.GLOBAL]: [
        'jpg',
        'jpeg',
        'png',
        'svg',
        'webp',
        'mp4',
        'mov',
    ],
    [FileCategoryEnum.REPORT_DEPOSIT]: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
    [FileCategoryEnum.USER]: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
};

export const fileExtensionToContentTypeConfig = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    pdf: 'application/pdf',
    mov: 'video/quicktime',
    mp4: 'video/mp4',
};
