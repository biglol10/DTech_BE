// import { Request, Response, NextFunction } from 'express';

type AsyncHandler = (req: any, res: any, next: any) => Promise<any>;

export { AsyncHandler };
