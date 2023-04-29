import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from './pipes/validation.pipe';
import { Logger } from '@nestjs/common';
import { HttpExceptionFilter } from './filters/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('API')
    .setDescription('A simple API')
    .setVersion('1.0.0')
    .setContact(
      'André Luiz Barros',
      'http://github.com/andre55255',
      'andre_luiz.b5@outook.com',
    )
    .addTag('auth', 'Métodos para lidar com conta de usuário')
    .addBearerAuth({
      type: 'http',
      description: 'Informe o token de acesso',
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  app.useGlobalPipes(new ValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());

  const port = process.env.PORT || 8080;
  await app.listen(port, () => {
    new Logger().log(`Escutando na porta ${port}`, 'Inicialização');
  });
}
bootstrap();
