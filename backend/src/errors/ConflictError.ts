import { AppError } from './AppError.js';

export class ConflictError extends AppError {
  constructor(message: string = 'Resource already exists', errorCode?: string) {
    super(message, 409, errorCode);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}
