const { Color } = require("./entity/color");
const { Wall } = require("./entity/wall");

const PADDING_SIZE = 30;

class JungleMap {
    constructor(imageData) {
        this.map = [];

        // imageData to map
        let ptr = 0;
        let minX = Infinity;
        let minY = Infinity;
        let maxX = -Infinity;
        let maxY = -Infinity;
        for (let i = 0; i < imageData.height; i++) {
            const row = [];
            for (let j = 0; j < imageData.width; j++) {
                const channels = imageData.data.slice(ptr, ptr + 4);
                if (channels.every(ch => ch === 0)) {
                    row.push(null);
                } else {
                    row.push(new Wall(new Color(...channels)));
                    minX = Math.min(minX, j);
                    minY = Math.min(minY, i);
                    maxX = Math.max(maxX, j);
                    maxY = Math.max(maxY, i);
                }
                ptr += 4;
            }
            this.map.push(row);
        }

        console.log(imageData.width, imageData.height);
        console.log(minX, minY, maxX, maxY);

        // crop
        if (minX > PADDING_SIZE) {
            const shiftCount = minX - PADDING_SIZE;
            for (let i = 0; i < this.map.length; i++) {
                this.map[i] = this.map[i].slice(shiftCount);
            }
        }

        if (imageData.width - maxX > PADDING_SIZE) {
            const popCount = imageData.width - maxX - PADDING_SIZE
            for (let i = 0; i < this.map.length; i++) {
                this.map[i] = this.map[i].slice(0, -popCount);
            }
        }

        if (minY > PADDING_SIZE) {
            this.map = this.map.slice(minY - PADDING_SIZE);
        }

        if (imageData.height - maxY > PADDING_SIZE) {
            this.map = this.map.slice(0, PADDING_SIZE - imageData.height + maxY);
        }

        // padding
        if (minX < PADDING_SIZE) {
            const unshiftCount = PADDING_SIZE - minX;
            this.map.forEach(row => row.unshift(...Array(unshiftCount).fill(null)));
        }

        if (imageData.width - maxX < PADDING_SIZE) {
            const pushCount = PADDING_SIZE - imageData.width + maxX;
            this.map.forEach(col => col.push(...Array(pushCount).fill(null)));
        }

        if (minY < PADDING_SIZE) {
            this.map.unshift(...Array(PADDING_SIZE - minY).fill(0).map(() => Array(this.map[0].length).fill(null)));
        }

        if (imageData.height - maxY < PADDING_SIZE) {
            this.map.push(...Array(PADDING_SIZE - imageData.height + maxY).fill(0).map(() => Array(this.map[0].length).fill(null)));
        }

        // add boundary

        this.width = this.map[0].length;
        this.height = this.map.length;
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