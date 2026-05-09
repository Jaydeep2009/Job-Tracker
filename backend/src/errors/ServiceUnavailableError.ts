import { AppError } from './AppError.js';

export class ServiceUnavailableError extends AppError {
  constructor(message: string = 'Service temporarily unavailable', errorCode?: string) {
    super(message, 503, errorCode);
    Object.setPrototypeOf(this, ServiceUnavailableError.prototype);
  }
}
