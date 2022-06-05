import express, { Request, Response, NextFunction } from 'express';
import conn from '@src/dbConn/dbConnection';
import testRoute from '@src/routes/testRoute';

const app = express();

const PORT = 3066;

conn.connect(function (err) {
	if (err) throw err;
	console.log('Connected!!');
});

// Body parser
app.use(express.json());

app.use('/api/testApi', testRoute);

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
