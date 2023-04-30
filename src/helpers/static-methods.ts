import { Logger } from '@nestjs/common';
import { ThrowHttpException } from 'src/dtos/utils/http-exception.dto';
import * as path from 'path';

export const isHttpExceptionError = (err: any): boolean => {
  const errorParsed = err as Error;
  return errorParsed.name === 'HttpException';
};

export const TreatmentException = (
  err: any = null,
  statusCode: number,
  message: string,
  messageAdd: string = null,
): void => {
  if (err && isHttpExceptionError(err)) {
    throw err;
  }
  new Logger().error(`${message} ${messageAdd}. Exception: ${err}`);
  ThrowHttpException({
    status: statusCode,
    message: message,
    error: err,
  });
};

export const generateRandomValue = (size: number): string => {
  const alphabet =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < size; i++) {
    const randomIndex = Math.floor(Math.random() * alphabet.length);
    result += alphabet[randomIndex];
  }
  return result;
};

export const getBasePath = (): string => {
  const basepathAux = path.dirname(__dirname).split(path.sep);
  if (process.env.ENVIRONMENT.toUpperCase() === 'DEV') {
    basepathAux.pop();
  }
  const basepath = basepathAux.join(path.sep);
  return basepath;
};
