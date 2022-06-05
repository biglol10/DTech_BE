import conn from '@src/dbConn/dbConnection';

const queryExecutor = (sql: string) => {
	return new Promise((resolve, reject) => {
		conn.query(sql, function (err, result, fields) {
			if (err) {
				reject(err);
			}
			resolve({
				status: 'success',
				queryResult: result,
			});
		});
	});
};

const queryExecutorResult = async (sql: string) => {
	let resultData: any = null;

	try {
		resultData = await queryExecutor(sql);
	} catch (err: any) {
		resultData = {
			status: 'error',
			code: err.code,
			errno: err.errno,
			sqlMessage: err.sqlMessage,
		};
	}

	return resultData;
};

export default queryExecutorResult;
