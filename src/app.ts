import express, { Request, Response, NextFunction } from 'express';
import conn from '@src/dbConn/dbConnection';
import testRoute from '@src/routes/testRoute';
import authRoute from '@src/routes/login';
import cors from 'cors';
import errorHandler from '@src/middleware/error';

const app = express();

const PORT = 3066;

conn.connect(function (err) {
	if (err) {
		console.log(err);
		throw err;
	}
	console.log('Connected!!');
});

// Body parser
app.use(express.json());

app.set('trust proxy', true);

// Enable CORS
app.use(cors());

app.use('/api/auth', authRoute);
app.use('/api/testApi', testRoute);

app.use(errorHandler);

app.get('/welcome', (req: Request, res: Response, next: NextFunction) => {
	res.send('welcome!');
});

app.listen(PORT, () => {
	console.log(`
  ################################################
  🛡️  Server listening on port: ${PORT}
  ################################################
`);
});
