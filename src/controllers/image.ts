// const { img } = require('../../models');

module.exports = {
	post: async (req: any, res: any) => {
		// ...
		// img.imageURL = req.file.location;
		// await img.save();
		console.log('image.ts');
		res.status(200).json({ img: req.file.location });
	},
};
