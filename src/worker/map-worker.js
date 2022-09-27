const { Color } = require('../jungle/entity/color');
const { Wall } = require('../jungle/entity/wall');

const PADDING_SIZE = 30;

// use callback to send progress
const imageData2Map = (imageData, cb) => {
    let map = [];

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
        map.push(row);
        cb({ progress: Math.floor((i + 1) / imageData.height * 60) });
    }

    cb({ progress: 60 });

    // crop
    if (minX > PADDING_SIZE) {
        const shiftCount = minX - PADDING_SIZE;
        for (let i = 0; i < map.length; i++) {
            map[i] = map[i].slice(shiftCount);
        }
    }

    cb({ progress: 65 });

    if (imageData.width - maxX > PADDING_SIZE) {
        const popCount = imageData.width - maxX - PADDING_SIZE
        for (let i = 0; i < map.length; i++) {
            map[i] = map[i].slice(0, -popCount);
        }
    }

    cb({ progress: 70 });

    if (minY > PADDING_SIZE) {
        map = map.slice(minY - PADDING_SIZE);
    }

    cb({ progress: 75 });

    if (imageData.height - maxY > PADDING_SIZE) {
        map = map.slice(0, PADDING_SIZE - imageData.height + maxY);
    }

    cb({ progress: 80 });

    // padding
    if (minX < PADDING_SIZE) {
        const unshiftCount = PADDING_SIZE - minX;
        map.forEach(row => row.unshift(...Array(unshiftCount).fill(null)));
    }

    cb({ progress: 85 });

    if (imageData.width - maxX < PADDING_SIZE) {
        const pushCount = PADDING_SIZE - imageData.width + maxX;
        map.forEach(col => col.push(...Array(pushCount).fill(null)));
    }

    cb({ progress: 90 });

    if (minY < PADDING_SIZE) {
        map.unshift(...Array(PADDING_SIZE - minY).fill(0).map(() => Array(map[0].length).fill(null)));
    }

    cb({ progress: 95 });

    if (imageData.height - maxY < PADDING_SIZE) {
        map.push(...Array(PADDING_SIZE - imageData.height + maxY).fill(0).map(() => Array(map[0].length).fill(null)));
    }

    // add boundary

    const width = map[0].length;
    const height = map.length;

    cb({
        width,
        height,
        map,
        progress: 100
    });
}

self.onmessage = msg => {
    const callback = ({ width, height, map, progress }) => {
        self.postMessage({ width, height, map, progress });
    }

    imageData2Map(msg.data.imageData, callback);
};