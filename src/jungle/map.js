const { Color } = require("./entity/color");
const { Wall } = require("./entity/wall");

class JungleMap {
    constructor(imageData) {
        this.width = imageData.width;
        this.height = imageData.height;
        this.map = [];

        // imageData to map
        let ptr = 0;
        for (let i = 0; i < imageData.height; i++) {
            const row = [];
            for (let j = 0; j < imageData.width; j++) {
                const channels = imageData.data.slice(ptr, ptr + 4);
                if (channels.every(ch => ch === 0)) {
                    row.push(null);
                } else {
                    row.push(new Wall(new Color(...channels)));
                }
                ptr += 4;
            }
            this.map.push(row);
        }
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