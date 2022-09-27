class JungleMap {
    constructor() {
        this.loaded = false;
    }

    async loadImageData(imageData, cb) {
        const result = await new Promise((resolve, reject) => {
            const worker = new Worker(new URL('../worker/map-worker.js', import.meta.url));

            worker.addEventListener('message', msg => {
                if (msg.data.progress === 100) {
                    worker.terminate();
                    resolve(msg.data);
                } else {
                    cb(msg.data.progress);
                }
            });

            worker.addEventListener('error', err => {
                worker.terminate();
                reject(err);
            });

            worker.postMessage({ imageData });
        });

        console.log(result);

        this.width = result.width;
        this.height = result.height;
        this.map = result.map;

        this.loaded = true;
    }

    toImageData() {
        const dataArr = new Uint8ClampedArray(this.width * this.height * 4);

        let ptr = 0;
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                if (!this.map[i][j]) {
                    dataArr[ptr] = 0;
                    dataArr[ptr + 1] = 0;
                    dataArr[ptr + 2] = 0;
                    dataArr[ptr + 3] = 0;
                } else {
                    const color = this.map[i][j].color;
                    dataArr[ptr] = color.red;
                    dataArr[ptr + 1] = color.green;
                    dataArr[ptr + 2] = color.blue;
                    dataArr[ptr + 3] = color.alpha;
                }
                ptr += 4;
            }
        }

        return new ImageData(dataArr, this.width, this.height);
    }
}

module.exports = { JungleMap };