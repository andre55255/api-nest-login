import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { APIResponseFail } from 'src/dtos/utils/api-response.dto';

interface ResponseEx {
  status: number;
  error: string;
}

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    
    const messageEx = exception.getResponse() as ResponseEx;
    response.status(status).json(APIResponseFail(messageEx.error));
  }
}
