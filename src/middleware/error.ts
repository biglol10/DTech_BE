import ErrorResponse, { ErrorCode } from '../util/errorResponse';
import { NextFunction, Request, Response } from 'express';

const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
	// Log to console for dev
	if (process.env.NODE_ENV === 'development') {
		console.error('Error:', {
			message: err.message,
			stack: err.stack,
			statusCode: err.statusCode,
			errorCode: err.errorCode,
		});
	}

	let error = { ...err };
	error.message = err.message;

	// Mongoose bad ObjectId
	if (err.name === 'CastError') {
		const message = `Resource not found`;
		error = new ErrorResponse(message, 404, ErrorCode.RESOURCE_NOT_FOUND);
	}

	// Mongoose duplicate key
	if (err.code === 11000) {
		const message = `Duplicate field value entered`;
		error = new ErrorResponse(message, 400, ErrorCode.DUPLICATE_RESOURCE);
	}

	// Mongoose validation error
	if (err.name === 'ValidationError') {
		const message: any = Object.values(err.errors).map((val: any) => val.message);
		error = new ErrorResponse(message, 400, ErrorCode.VALIDATION_ERROR);
	}

	// MySQL duplicate key error
	if (err.code === 'ER_DUP_ENTRY') {
		const message = 'Duplicate entry - resource already exists';
		error = new ErrorResponse(message, 409, ErrorCode.DUPLICATE_RESOURCE);
	}

	// Build response object
	const response: any = {
		success: false,
		message: error.message || 'Server Error',
	};

	// Include error code if available (for frontend to handle specific errors)
	if (error.errorCode) {
		response.errorCode = error.errorCode;
	}

	// Include stack trace in development
	if (process.env.NODE_ENV === 'development' && error.stack) {
		response.stack = error.stack;
	}

	return res.status(error.statusCode || 500).json(response);
};

export default errorHandler;
