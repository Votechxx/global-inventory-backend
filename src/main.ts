import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import morgan from 'morgan';
import { Logger, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ConfigService } from '@nestjs/config';
import { PrismaExceptionFilter } from './common/exception-filters/prisma.exception';
import { ResponseFormatInterceptor } from './common/interceptors/response-format.interceptor';
import { NestExpressApplication } from '@nestjs/platform-express';
import { VIEW_PATH } from './common/constants/path.constant';
import { ENV_VARIABLES } from './common/config/env.config';

async function bootstrap() {
    const app = await NestFactory.create<NestExpressApplication>(AppModule);
    app.enableCors({});
    app.use(morgan('dev'));
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
        }),
    );
    app.useGlobalFilters(new PrismaExceptionFilter());
    app.useGlobalInterceptors(new ResponseFormatInterceptor());
    app.setGlobalPrefix('api');

    app.setBaseViewsDir(VIEW_PATH);
    app.setViewEngine('pug');

    const configService = new ConfigService();

    const config = new DocumentBuilder()
        .addBearerAuth(undefined, 'default')
        .setTitle('GLOBAL INVENTORY API')
        .setDescription('GLOBAL Inventory API description')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, config);
    // if (configService.get('NODE_ENV') !== 'production')
    SwaggerModule.setup('api', app, document, {
        swaggerOptions: {
            authAction: {
                default: {
                    name: 'default',
                    schema: {
                        description: 'Default',
                        type: 'http',
                        in: 'header',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                    value: configService.get('TOKEN'),
                },
            },
        },
    });

    const port = ENV_VARIABLES.port || 3339;
    await app.listen(port);
}
bootstrap();
