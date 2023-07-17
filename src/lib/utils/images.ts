import Jimp from 'jimp';

async function readImage(url: string): Promise<Jimp> {
	const response = await fetch(url);
	const arrayBuffer = await response.arrayBuffer();
	const buffer = Buffer.from(arrayBuffer);
	return new Promise((resolve, reject) => {
		Jimp.read(buffer, (err, image) => {
			if (err) {
				reject(err);
			}
			resolve(image);
		});
	});
}

export const getPlaceholder = async (imageUrl: string) => {
	const image = await readImage(imageUrl);
	image.resize(25, Jimp.AUTO).quality(25).blur(5);
	const placeholder = await image.getBase64Async(image.getMIME());
	return placeholder;
};
