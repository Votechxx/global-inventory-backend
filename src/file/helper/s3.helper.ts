import {
    ForbiddenException,
    NotFoundException,
    UnprocessableEntityException,
} from '@nestjs/common';
import { FileCategoryEnum } from 'src/file/enum/file-category.enum';
import {
    fileAllowedExtensionsConfig,
    fileMaxSizeConfig,
} from '../config/file.config';

class FileHelper {
    throwNotFoundFileCategoryError() {
        throw new NotFoundException('File category not found');
    }

    validateFileExtension(params: {
        fileCategory: FileCategoryEnum;
        fileExtension: string;
    }) {
        const { fileCategory, fileExtension } = params;
        if (!fileAllowedExtensionsConfig[fileCategory].includes(fileExtension))
            throw new ForbiddenException('file extension is not allowed');
    }

    validateContentTypeExist(contentType: string) {
        if (!contentType) {
            throw new NotFoundException(
                'content type is null please check storage config',
            );
        }
    }

    /**
     *
     * @param fileSize - size of the file in bytes
     * @param category - category of the file see FileCategoryEnum
     */
    validateFileSize(fileSize: number, category: FileCategoryEnum) {
        const maxSize = fileMaxSizeConfig[category]; // max size in bytes
        if (fileSize > maxSize) {
            throw new ForbiddenException(
                `File size exceeds the maximum limit of ${maxSize / 1024 / 1024} MB`,
            );
        }
    }

    throwUploadError(message: string) {
        throw new UnprocessableEntityException(
            'Error uploading file: ' + message,
        );
    }
}

export const fileHelper = new FileHelper();
