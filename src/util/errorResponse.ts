/**
 * Error codes for client-side handling
 */
export enum ErrorCode {
	// Authentication errors
	ACCESS_TOKEN_EXPIRED = 'ACCESS_TOKEN_EXPIRED',
	REFRESH_TOKEN_EXPIRED = 'REFRESH_TOKEN_EXPIRED',
	INVALID_ACCESS_TOKEN = 'INVALID_ACCESS_TOKEN',
	INVALID_REFRESH_TOKEN = 'INVALID_REFRESH_TOKEN',
	NO_TOKEN_PROVIDED = 'NO_TOKEN_PROVIDED',
	UNAUTHORIZED = 'UNAUTHORIZED',

	// Validation errors
	VALIDATION_ERROR = 'VALIDATION_ERROR',
	INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',

	// Database errors
	DATABASE_ERROR = 'DATABASE_ERROR',
	RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
	DUPLICATE_RESOURCE = 'DUPLICATE_RESOURCE',

	// Permission errors
	FORBIDDEN = 'FORBIDDEN',
	INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',

	// Server errors
	INTERNAL_SERVER_ERROR = 'INTERNAL_SERVER_ERROR',
}

class ErrorResponse extends Error {
	statusCode: number;
	errorCode?: ErrorCode;

	constructor(message: string, statusCode: number, errorCode?: ErrorCode) {
		super(message);
		this.statusCode = statusCode;
		this.errorCode = errorCode;
	}
}

export default ErrorResponse;
