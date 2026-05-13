import { AppError } from './AppError.js';

export class BadRequestError extends AppError {
  constructor(message: string = 'Bad request', errorCode?: string) {
    super(message, 400, errorCode);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}
