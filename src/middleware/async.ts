import { Request, Response, NextFunction } from 'express';

interface reqExtends extends Request {
	[val: string]: any;
}

type AsyncRequestHandler = (
	req: reqExtends,
	res: Response,
	next: NextFunction
) => Promise<any>;

const asyncHandler = (fn: AsyncRequestHandler) => {
	return async (req: reqExtends, res: Response, next: NextFunction) => {
		try {
			await fn(req, res, next);
		} catch (error) {
			next(error);
		}
	};
};

export default asyncHandler;
