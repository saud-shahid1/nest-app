import { Controller, Post, Body, Req, Res, HttpStatus } from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';

@Controller('api/auth')
export class AuthController {
    constructor(
        private readonly authService: AuthService,
    ) {}

    @Post('register')
    async register(@Body() body: any) {
        return this.authService.register(body);
    }

    @Post('login')
    async login(@Body() body: any, @Res() res: Response) {
        try {
            const result = await this.authService.login(body);
            return res.status(HttpStatus.OK).json(result);
        } catch (err) {
            console.log(err);
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ status: false, message: 'Server error.' });
        }
    }

    @Post('logout')
    async logout(@Req() req: Request, @Res() res: Response) {
        try {
            const userId = req['user']?.id;
            console.log(userId, ';gggggggggggg');
            const result = await this.authService.logout(userId);
            return res.status(result.status ? HttpStatus.OK : HttpStatus.UNAUTHORIZED).json(result);
        } catch (err) {
            return res.status(HttpStatus.UNAUTHORIZED).json({ status: false, message: "Invalid token." });
        }
    }

    @Post('reset-password')
    async resetPassword(@Body() body: any, @Res() res: Response) {
        try {
            const result = await this.authService.resetPassword(body);
            return res.status(HttpStatus.OK).json(result);
        } catch (err) {
            return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ status: false, message: 'Server error.' });
        }
    }
}