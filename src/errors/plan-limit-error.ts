import { CustomError } from 'errors/custom-error';

export class PlanLimitError extends CustomError {
  statusCode = 403;

  constructor(public error: string) {
    super(`Plan Limit: ${error}`);
    Object.setPrototypeOf(this, PlanLimitError.prototype);
  }

  serializeErrors() {
    return [{ message: this.error }];
  }
}
