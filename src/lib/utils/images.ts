import sharp from 'sharp';
import type { Sharp } from 'sharp';

const getDominantColor = async (image: Sharp) => {
	try {
		const { dominant } = await image.stats();
		const { r, g, b } = dominant;
		const placeholderBuffer = await sharp({
			create: {
				width: 3,
				height: 2,
				channels: 3,
				background: { r, g, b }
			}
		})
			.jpeg()
			.toBuffer({ resolveWithObject: false });
		return `data:image/jpeg;base64,${placeholderBuffer.toString('base64')}`;
	} catch (error) {
		throw new Error(`Error determining dominant colour`);
	}
};

export const getPlaceholder = async (imageUrl: string) => {
	try {
		const response = await fetch(imageUrl);
		const imageBuffer = await response.arrayBuffer();
		const image = sharp(imageBuffer);
		const buffer = await image
			.resize(10)
			.jpeg({
				quality: 50,
				progressive: true,
				optimiseScans: true,
				chromaSubsampling: '4:2:0',
				trellisQuantisation: true,
				quantisationTable: 2
			})
			.toBuffer({ resolveWithObject: false });
		const placeholder = `data:image/jpeg;base64,${buffer.toString('base64')}`;
		const dominantColor = await getDominantColor(image);
		return {
			placeholder,
			dominantColor
		};
	} catch (error) {
		throw new Error(`Error generating low resolution placeholder: ${imageUrl}`);
	}
};
