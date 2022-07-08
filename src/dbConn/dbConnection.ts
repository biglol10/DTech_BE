import mysql from 'mysql';

const conn = mysql.createConnection({
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
