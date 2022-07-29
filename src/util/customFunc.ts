import crypto from 'crypto';

const generateUID = () => {
	return crypto.randomBytes(20).toString('hex').substring(0, 20);
};

export { generateUID };
