import { Injectable, HttpStatus } from '@nestjs/common';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
import { User } from './schemas/user.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

const JWT_SECRET = 'hello';

@Injectable()
export class AuthService {
    private readonly saltLength = 16;
    private readonly iterations = 100000;
    private readonly keyLength = 64;
    private readonly digest = 'sha512';

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<User>
    ) {}

    hashPassword(password: string): string {
        const salt = crypto.randomBytes(this.saltLength).toString('hex');
        const hash = crypto.pbkdf2Sync(password, salt, this.iterations, this.keyLength, this.digest).toString('hex');
        return `${salt}:${hash}`;
    }

    comparePassword(password: string, stored: string): boolean {
        const [salt, originalHash] = stored.split(':');
        const hash = crypto.pbkdf2Sync(password, salt, this.iterations, this.keyLength, this.digest).toString('hex');
        return hash === originalHash;
    }

    async register(body: any) {
        const { name, email, password } = body;
        const exists = await this.userModel.findOne({ email });
        if (exists) {
            return { status: false, message: 'Email already exists!' };
        }
        const hashedPassword = this.hashPassword(password);
        await this.userModel.create({ name, email, password: hashedPassword });
        return { status: true, message: "User has been registered successfully!." };
    }

    async login(body: any) {
        const { email, password } = body;
        const user = await this.userModel.findOne({ email });
        if (user && this.comparePassword(password, user.password)) {
            const token = jwt.sign(
                { id: user._id.toString(), email: user.email },
                JWT_SECRET,
                { expiresIn: '1h' }
            );
            await this.userModel.updateOne({ _id: user._id }, { $set: { token } });
            return { status: true, message: "Login successfully!", token };
        }
        return { status: false, message: "Invalid email or password." };
    }

    async logout(userId: string) {
        if (!userId) {
            return { status: false, message: "Invalid token." };
        }
        await this.userModel.updateOne({ _id: userId }, { $unset: { token: "" } });
        return { status: true, message: "Logout successfully!" };
    }

    async resetPassword(body: any) {
        const { email, oldPassword, password } = body;
        const user = await this.userModel.findOne({ email });
        if (!user || !this.comparePassword(oldPassword, user.password)) {
            return { status: false, message: "Invalid email or old password." };
        }
        if (this.comparePassword(password, user.password)) {
            return { status: false, message: "New password cannot be the same as old password." };
        }
        const hashedPassword = this.hashPassword(password);
        await this.userModel.updateOne({ _id: user._id }, { $set: { password: hashedPassword } });
        return { status: true, message: "Password has been reset successfully!" };
    }
}
