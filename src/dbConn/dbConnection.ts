import mysql from 'mysql';

// 20220731 createConnection 대신 createPool 사용 => https://stackoverflow.com/questions/22900931/mysql-giving-read-econnreset-error-after-idle-time-on-node-js-server
const conn = mysql.createPool({
	host: process.env.MYSQL_URL,
	user: process.env.MYSQL_USER,
	password: process.env.MYSQL_PW,
	database: process.env.MYSQL_DB,
});

// const conn = mysql.createConnection({
// 	host: 'localhost',
// 	port: 3306,
// 	user: 'root',
// 	database: 'smdb',
// 	password: process.env.MYSQL_PW,
// });

export default conn;
