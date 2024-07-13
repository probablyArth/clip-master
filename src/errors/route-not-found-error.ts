import { CustomError } from 'errors/custom-error';

export class RouteNotFoundError extends CustomError {
  statusCode = 404;
  reason = 'Route not found';

  constructor() {
    super('Route not found');
    Object.setPrototypeOf(this, RouteNotFoundError.prototype);
  }

  serializeErrors(): { message: string; field?: string | undefined }[] {
    return [{ message: this.reason }];
  }
}
