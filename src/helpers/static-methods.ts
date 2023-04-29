import { Logger } from '@nestjs/common';
import { ThrowHttpException } from "src/dtos/utils/http-exception.dto";

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
  new Logger().error(
    `${message} ${messageAdd}. Exception: ${err}`,
  );
  ThrowHttpException({
    status: statusCode,
    message: message,
    error: err,
  });
};
