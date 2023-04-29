import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  HttpStatus
} from '@nestjs/common';
import { ValidationError, validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { ThrowHttpException } from 'src/dtos/utils/http-exception.dto';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }
    const object = plainToInstance(metatype, value);
    const errors = await validate(object);
    if (errors.length > 0) {
      const message = this.getMessage(errors);
      ThrowHttpException({
        status: HttpStatus.BAD_REQUEST,
        message: message,
      });
    }
    return value;
  }

  private getMessage(errors: ValidationError[]): string {
    return Object.values(errors[0].constraints)[0];
  }

  private toValidate(metatype: any): boolean {
    const types: any[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
