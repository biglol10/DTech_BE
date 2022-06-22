import { Request, Response, NextFunction } from 'express';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => any;

type GeneralTypeAsync = (
	fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
) => any;

interface IUserState {
	userId: string;
	pw: string;
	role: 'admin' | 'user';
}

interface IGetUserAuthInfoRequest extends Request {
	user?: IUserState;
}

export { AsyncHandler, GeneralTypeAsync, IGetUserAuthInfoRequest };
