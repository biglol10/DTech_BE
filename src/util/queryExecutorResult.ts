import conn from '../dbConn/dbConnection';

interface IResultData {
	status: 'success' | 'error';
	queryResult: null | any;
	code?: any;
	errno?: string | number;
	sqlMessage?: string;
}

const queryExecutor = (sql: string): Promise<IResultData | any> => {
	return new Promise((resolve, reject) => {
		conn.query(sql, function (err, result, fields) {
			if (err as any) {
				reject(err);
			}
			const successResult: IResultData = {
				status: 'success',
				queryResult: result,
			};
			resolve(successResult);
		});
	});
};

const queryExecutorResult = async (sql: string): Promise<IResultData> => {
	let resultData: IResultData | null = null;

	try {
		resultData = (await queryExecutor(sql)) as IResultData;
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

const queryExecutor2 = (sql: string, val?: (number | string | null)[]) => {
	return new Promise((resolve, reject) => {
		conn.query(sql, val, function (err, result, fields) {
			if (err) {
				reject(err);
			}
			const successResult: IResultData = {
				status: 'success',
				queryResult: result,
			};
			resolve(successResult);
		});
	});
};

const queryExecutorResult2 = async (sql: string, val?: (number | string | null)[]) => {
	let resultData: IResultData | null = null;

	try {
		resultData = (await queryExecutor2(sql, val)) as IResultData;
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
const queryExecutorProcedure = (
	procedureName: string,
	param: null | (string | number)[],
): Promise<IResultData | any> => {
	return new Promise((resolve, reject) => {
		if (param) {
			const tempString = param.reduce((previouseValue, currentValue, currentIndex) => {
				if (currentIndex === param.length - 1) {
					return previouseValue + '?';
				}
				return previouseValue + '?,';
			}, '');
			conn.query(`call ${procedureName}(${tempString})`, param, function (err, result) {
				if (err as any) {
					reject(err);
				}
				try {
					const successResult: IResultData = {
						status: 'success',
						queryResult: result[0],
					};
					resolve(successResult);
				} catch {
					reject(`${procedureName} 프로시저에서 문제가 발생했습니다`);
				}
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
): Promise<IResultData> => {
	let resultData: IResultData | null = null;

	try {
		resultData = (await queryExecutorProcedure(procedureName, param)) as IResultData;
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
