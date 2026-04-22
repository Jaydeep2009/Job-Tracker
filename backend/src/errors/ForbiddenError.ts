import { AppError } from './AppError.js';

export class ForbiddenError extends AppError {
  constructor(message: string = 'Access forbidden', errorCode?: string) {
    super(message, 403, errorCode);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}
