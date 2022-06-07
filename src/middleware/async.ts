import { AsyncHandler, GeneralTypeAsync } from '@src/util/commTypes';

const asyncHandler: GeneralTypeAsync =
	(fn: Function): AsyncHandler =>
	(req, res, next) =>
		Promise.resolve(fn(req, res, next)).catch(next);

export default asyncHandler;
