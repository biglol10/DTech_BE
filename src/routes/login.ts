import express, { Request, Response, NextFunction } from 'express';

const router = express.Router();

router.post('/', (req: Request, res: Response) => {
	console.log(req.body);
});

export default router;
