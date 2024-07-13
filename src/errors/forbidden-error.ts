import { CustomError } from 'errors/custom-error';

export class ForbiddenError extends CustomError {
  statusCode = 403;
  reason = 'Forbidden';

  constructor() {
    super('Forbidden');
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }

  serializeErrors(): { message: string; field?: string | undefined }[] {
    return [{ message: this.reason }];
  }
}
