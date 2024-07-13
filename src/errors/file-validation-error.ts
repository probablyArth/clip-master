import { CustomError } from 'errors/custom-error';

export class BadRequestError extends CustomError {
  statusCode = 400;

  constructor(public error: string) {
    super(`Invalid file: ${error}`);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }

  serializeErrors() {
    return [{ message: this.error }];
  }
}
