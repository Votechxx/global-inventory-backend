import { SetMetadata } from '@nestjs/common';

export const USER_DATA = 'user_data';
export const Fields = (...fields: string[]) => SetMetadata(USER_DATA, fields);
