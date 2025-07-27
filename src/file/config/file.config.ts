import { FileCategoryEnum } from 'src/file/enum/file-category.enum';

export const fileMaxSizeConfig = {
    // size in bytes
    [FileCategoryEnum.GLOBAL]: 1024 * 1024 * 1, //1MB
    [FileCategoryEnum.COURSE]: 1024 * 1024 * 20, //20MB
    [FileCategoryEnum.BOOK]: 1024 * 1024 * 30, //30MB
    [FileCategoryEnum.LESSON]: 1024 * 1024 * 1000, //1000MB
    [FileCategoryEnum.MAIN_MATERIAL]: 1024 * 1024 * 10, //10MB
    [FileCategoryEnum.MATERIAL]: 1024 * 1024 * 35, //35MB
    [FileCategoryEnum.QUESTION]: 1024 * 1024 * 30, //30MB
    [FileCategoryEnum.USER]: 1024 * 1024 * 10, //10MB
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
    [FileCategoryEnum.COURSE]: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
    [FileCategoryEnum.BOOK]: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
    [FileCategoryEnum.LESSON]: [
        'jpg',
        'jpeg',
        'png',
        'svg',
        'webp',
        'mp4',
        'mov',
    ],
    [FileCategoryEnum.MAIN_MATERIAL]: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
    [FileCategoryEnum.MATERIAL]: ['jpg', 'jpeg', 'png', 'svg', 'webp'],
    [FileCategoryEnum.QUESTION]: [
        'jpg',
        'jpeg',
        'png',
        'svg',
        'webp',
        'mp4',
        'mov',
    ],
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
