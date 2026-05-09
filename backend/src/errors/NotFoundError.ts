import { AppError } from './AppError.js';

export class NotFoundError extends AppError {
  constructor(message: string = 'Resource not found', errorCode?: string) {
    super(message, 404, errorCode);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}
