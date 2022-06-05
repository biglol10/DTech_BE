import { AsyncHandler } from '@src/util/commTypes';

const asyncHandler =
	(fn: any): AsyncHandler =>
	(req, res, next) =>
		Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
