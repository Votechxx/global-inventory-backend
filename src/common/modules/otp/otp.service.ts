import { Injectable } from '@nestjs/common';
import { randomInt } from 'crypto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class OtpService {
    // Generate a 6-digit OTP
    generateOtp(): string {
        const otp = randomInt(100000, 999999); // Generate random 6-digit OTP
        return otp.toString();
    }

    // Hash the OTP
    async hashOtp(otp: string): Promise<string> {
        const saltRounds = 10; // Number of hashing rounds
        return await bcrypt.hash(otp, saltRounds);
    }

    // Compare the OTP with its hash
    async verifyOtp(plainOtp: string, hashedOtp: string): Promise<boolean> {
        return await bcrypt.compare(plainOtp, hashedOtp);
    }
}
