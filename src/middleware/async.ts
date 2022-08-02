import { Request, Response, NextFunction } from 'express';

// const asyncHandler2: GeneralTypeAsync =
// 	(fn: Function): AsyncHandler =>
// 	(req, res, next) => {
// 		console.log(req.ip);
// 		Promise.resolve(fn(req, res, next)).catch(next);
// 	};

interface reqExtends extends Request {
	[val: string]: any;
}

const asyncHandler =
	(fn: (req: reqExtends, res: Response, next: NextFunction) => any | Promise<void>) =>
	async (req: reqExtends, res: Response, next: NextFunction) => {
		Promise.resolve(fn(req, res, next)).catch(next);
	};

export default asyncHandler;
