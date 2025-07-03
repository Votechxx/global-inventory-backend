import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepo } from '../repo/user.repo';

@Injectable()
export class UserHelper {
    constructor(private readonly userRepo: UserRepo) {}

    async suggestUsernames(
        username: string,
        count: number = 1,
    ): Promise<string[]> {
        if (count > 10) count = 10;
        if (!username) throw new BadRequestException('Username is required');
        const usernames = [];
        let newUsername: string;
        let counter = 1;
        while (usernames.length <= count) {
            newUsername = `${username}${counter}`;
            const user = await this.userRepo.getUserByUsername(newUsername);
            if (!user) usernames.push(newUsername);
            counter++;
        }
        return usernames;
    }

    async suggestUsername(username: string): Promise<string> {
        const name = username.split(' ')[0].toLowerCase();
        const usernames = await this.suggestUsernames(name);
        return usernames[0];
    }
}
