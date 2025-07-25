import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { mongo } from 'mongoose';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [AuthModule,
    MongooseModule.forRoot('mongodb://localhost:27017/authDB'),
    ConfigModule.forRoot({
      envFilePath: '.env',
      isGlobal: true,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
