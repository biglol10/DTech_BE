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
			queryResult: null,
		};
	}

	return resultData;
};

const queryExecutor2 = (sql: string, val?: any) => {
	return new Promise((resolve, reject) => {
		conn.query(sql, val, function (err, result, fields) {
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

const queryExecutorResult2 = async (sql: string, val?: any) => {
	let resultData: any = null;

	try {
		resultData = await queryExecutor2(sql, val);
	} catch (err: any) {
		resultData = {
			status: 'error',
			code: err.code,
			errno: err.errno,
			sqlMessage: err.sqlMessage,
			queryResult: null,
		};
	}

	return resultData;
};

/** ****************************************************************************************
 * @설명 : App layout
 ********************************************************************************************
 * 예시: queryExecutorProcedure(프로시저 명, [param1, param2])
 ********************************************************************************************/
const queryExecutorProcedure = (procedureName: string, param: null | (string | number)[]) => {
	return new Promise((resolve, reject) => {
		if (param) {
			const tempString = param.reduce((previouseValue, currentValue, currentIndex) => {
				if (currentIndex === param.length - 1) {
					return previouseValue + '?';
				}
				return previouseValue + '?,';
			}, '');
			conn.query(`call ${procedureName}(${tempString})`, param, function (err, result) {
				if (err) {
					reject(err);
				}
				resolve({
					status: 'success',
					queryResult: result,
				});
			});
		} else {
			conn.query(`call ${procedureName}`, function (err, result) {
				if (err) {
					reject(err);
				}
				resolve({
					status: 'success',
					queryResult: result,
				});
			});
		}
	});
};

const queryExecutorResultProcedure = async (
	procedureName: string,
	param: (string | number)[] | null = null,
) => {
	let resultData: any = null;

	try {
		resultData = await queryExecutorProcedure(procedureName, param);
	} catch (err: any) {
		resultData = {
			status: 'error',
			code: err.code,
			errno: err.errno,
			sqlMessage: err.sqlMessage,
			queryResult: null,
		};
	}

	return resultData;
};

export { queryExecutorResult, queryExecutorResultProcedure, queryExecutorResult2 };
