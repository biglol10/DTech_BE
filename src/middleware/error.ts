import ErrorResponse from '@src/util/errorResponse';

const errorHandler = (err: any, req: any, res: any, next: any) => {
	// Log to console for dev
	// console.log(err);

	let error = { ...err };

	error.message = err.message;

	// Mongoose bad ObjectId
	if (err.name === 'CastError') {
		const message = `Resource not found`;
		error = new ErrorResponse(message, 404);
	}

	// Mongoose duplicate key
	if (err.code === 11000) {
		const message = `Duplicate field value entered`;
		error = new ErrorResponse(message, 400);
	}

	// Mongoose validation error
	if (err.name === 'ValidationError') {
		const message: any = Object.values(err.errors).map((val: any) => val.message);
		error = new ErrorResponse(message, 400);
	}

	console.log('came to errerr');
	console.log(error.statusCode);
	console.log(error.message);

	res.status(error.statusCode || 500).json({
		success: false,
		error: error.message || 'Server Error',
	});
};

export default errorHandler;
