import { CustomError } from 'errors/custom-error';

export class FileValidationError extends CustomError {
  statusCode = 400;

  constructor(public error: string) {
    super('Invalid file');
    Object.setPrototypeOf(this, FileValidationError.prototype);
  }

  serializeErrors() {
    return [{ message: this.error }];
  }
}