import { Request, Response, NextFunction } from 'express';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => Promise<any>;

type GeneralTypeAsync = (
	fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => any;

export { AsyncHandler, GeneralTypeAsync };
