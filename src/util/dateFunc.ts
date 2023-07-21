import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

const dayjsKor = () => {
	return dayjs().tz('Asia/Seoul');
};

const getDateString = () => {
	const date = new Date();
	const year = date.getFullYear();
	const month = date.getMonth() + 1;
	const day = date.getDate();
	const hour = date.getHours();
	const minute = date.getMinutes();
	const second = date.getSeconds();
	const milliSec = date.getMilliseconds();

	const finalStr = year + '' + month + '' + day + '' + hour + '' + minute + '' + second + '' + milliSec;

	return finalStr;
};

export { dayjsKor, getDateString };
