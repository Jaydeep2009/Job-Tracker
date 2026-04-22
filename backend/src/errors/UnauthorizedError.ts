import { AppError } from './AppError.js';

export class UnauthorizedError extends AppError {
  constructor(message: string = 'Authentication required', errorCode?: string) {
    super(message, 401, errorCode);
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
