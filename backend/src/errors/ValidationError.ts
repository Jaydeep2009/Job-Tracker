import { AppError } from './AppError.js';

export class ValidationError extends AppError {
  constructor(message: string = 'Validation failed', errorCode?: string) {
    super(message, 400, errorCode);
    Object.setPrototypeOf(this, ValidationError.prototype);
  }
}
