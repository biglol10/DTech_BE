import mysql from 'mysql';

const conn = mysql.createConnection({
	host: 'skillmanagerdb.chreeiklmgxp.ap-northeast-2.rds.amazonaws.com',
	user: 'dba',
	password: process.env.MYSQL_PW,
	database: 'smdb',
});

export default conn;
