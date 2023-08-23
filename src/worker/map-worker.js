const { Color } = require("../jungle/entity/color");
const { Wall } = require("../jungle/entity/wall");
const { Position } = require("../jungle/entity/position");

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
  let width = imageData.width;
  for (let i = 0; i < imageData.height; i++) {
    const row = [];
    for (let j = 0; j < imageData.width; j++) {
      const channels = imageData.data.slice(ptr, ptr + 4);
      if (channels.some((ch) => ch !== 0)) {
        row.push(new Wall(new Position(j, i), new Color(...channels)));
        minX = Math.min(minX, j);
        minY = Math.min(minY, i);
        maxX = Math.max(maxX, j);
        maxY = Math.max(maxY, i);
      }
      ptr += 4;
    }
    map.push(row);
    cb({ progress: Math.floor(((i + 1) / imageData.height) * 60) });
  }

  cb({ progress: 60 });

  // crop

  if (minY > PADDING_SIZE) {
    const cropTop = minY - PADDING_SIZE;
    maxY -= cropTop;

    map = map.slice(cropTop);
  }

  cb({ progress: 65 });

  if (map.length - maxY > PADDING_SIZE) {
    const cropBottom = maxY - (map.length - PADDING_SIZE);

    map = map.slice(0, cropBottom);
  }

  cb({ progress: 70 });

  if (minX > PADDING_SIZE) {
    const cropLeft = minX - PADDING_SIZE;
    width -= cropLeft;
    maxX -= cropLeft;

    for (let i = 0; i < map.length; i++) {
      for (const entity of map[i]) {
        entity.position.x -= cropLeft;
      }
    }
  }

  cb({ progress: 75 });

  if (width - maxX > PADDING_SIZE) {
    width = maxX + PADDING_SIZE;
  }

  cb({ progress: 90 });

  if (minY < PADDING_SIZE) {
    const paddingTop = PADDING_SIZE - minY;
    minY = PADDING_SIZE;
    maxY += paddingTop;

    map.unshift(
      ...Array(paddingTop)
        .fill(0)
        .map(() => [])
    );
  }

  cb({ progress: 95 });

  if (map.length - maxY < PADDING_SIZE) {
    const paddingBottom = PADDING_SIZE - (map.length - maxY);

    map.push(
      ...Array(paddingBottom)
        .fill(0)
        .map(() => [])
    );
  }

  // TODO: add boundary

  cb({
    width,
    height: map.length,
    map,
    progress: 100,
  });
};

self.onmessage = (msg) => {
  const callback = ({ width, height, map, progress }) => {
    self.postMessage({ width, height, map, progress });
  };

  imageData2Map(msg.data.imageData, callback);
};
