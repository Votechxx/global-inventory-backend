import { existsSync, mkdirSync, renameSync } from 'fs';
import { join } from 'path';
import { UPLOAD_PATH } from '../constants/path.constant';

export function changeFileLocation(
    oldFolderPath: string,
    newFolderPath: string,
    fileName: string,
) {
    const oldFilePath = join(UPLOAD_PATH, oldFolderPath, fileName);
    const newFilePath = join(UPLOAD_PATH, newFolderPath, fileName);
    if (!existsSync(join(UPLOAD_PATH, newFolderPath)))
        mkdirSync(join(UPLOAD_PATH, newFolderPath), { recursive: true });
    renameSync(oldFilePath, newFilePath);
    return join(newFolderPath, fileName);
}
