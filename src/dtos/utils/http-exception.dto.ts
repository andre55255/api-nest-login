import { HttpException } from '@nestjs/common';

interface HttpExceptionDto {
  status: number;
  message: string;
  error?: Error | null;
}

export const ThrowHttpException = (data: HttpExceptionDto): never => {
  throw new HttpException(
    {
      status: data.status,
      error: data.message,
    },
    data.status,
    {
      cause: data.error,
    },
  );
};
