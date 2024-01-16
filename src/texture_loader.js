import { Texture, TextureArray } from "akila/webgl";

export class TextureLoader {
	static async texture2d(src, params) {
		return new Promise(resolve => {
			const img = new Image();
			img.addEventListener('load', () => {
				const tex = new Texture(img);
				tex.setParameters(params);

				resolve(tex);
			});
			img.src = src;
		});
	}

	static async texture2dArray(src, divisors, params) {
		return new Promise(resolve => {
			const img = new Image();
			img.addEventListener('load', () => {
				const ctx = document.createElement('canvas').getContext('2d', {willReadFrequently: true});
				ctx.canvas.width = img.width;
				ctx.canvas.height = img.height;
				ctx.drawImage(img, 0, 0);

				const tx = img.width / divisors[0];
				const ty = img.height / divisors[1];
			
				const tex = new TextureArray(tx, ty, tx * ty);
				tex.setParameters(params);

				let i = 0;
				for(let y = 0; y < ty; ++y)
				for(let x = 0; x < tx; ++x) {
					const imgData = ctx.getImageData(x * tx, y * ty, img.width, img.height);
					tex.setTextureData(imgData, i++);
				}
				tex.generateMipmap();

				resolve(tex);
			});

			img.src = src;
		});
		
	}
}