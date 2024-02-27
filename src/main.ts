import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // CORSを有効にする
  app.enableCors({
    origin: 'http://localhost:3001',  // フロントエンドアプリのオリジンを指定
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',  // 許可するHTTPメソッド
    allowedHeaders: 'Content-Type, Accept',  // 許可するヘッダー
  });

  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

bootstrap();
