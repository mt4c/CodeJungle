const { Color } = require("../jungle/entity/color");
const { Wall } = require("../jungle/entity/wall");
const { Position } = require("../jungle/entity/position");

const PADDING_SIZE = 20;
const LIMIT_X = 1024;
const LIMIT_Y = 768;

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
      if (channels.slice(0, 3).some((ch) => ch !== 0)) {
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

  if (minY > PADDING_SIZE) {
    // crop top
    const cropTop = minY - PADDING_SIZE;

    map = map.slice(cropTop);

    maxY -= cropTop;
    for (let i = 0; i < map.length; i++) {
      for (const entity of map[i]) {
        entity.position.y -= cropTop;
      }
    }
  } else if (minY < PADDING_SIZE) {
    // pad top
    const padTop = PADDING_SIZE - minY;

    map.unshift(
      ...Array(padTop)
        .fill(0)
        .map(() => [])
    );

    maxY += padTop;
    for (let i = 0; i < map.length; i++) {
      for (const entity of map[i]) {
        entity.position.y += padTop;
      }
    }
  }

  cb({ progress: 65 });

  // crop bottom
  const contentMaxY = LIMIT_Y - PADDING_SIZE;
  if (map.length > contentMaxY) {
    map = map.slice(0, contentMaxY);
  }

  // pad bottom
  const padBottom = LIMIT_Y - map.length;
  map.push(
    ...Array(padBottom)
      .fill(0)
      .map(() => [])
  );

  cb({ progress: 70 });

  if (minX > PADDING_SIZE) {
    // crop left
    const cropLeft = minX - PADDING_SIZE;
    maxX -= cropLeft;

    for (let i = 0; i < map.length; i++) {
      for (const entity of map[i]) {
        entity.position.x -= cropLeft;
      }
    }
  } else if (minX < PADDING_SIZE) {
    // pad left
    const padLeft = PADDING_SIZE - minX;
    maxX += padLeft;

    for (let i = 0; i < map.length; i++) {
      for (const entity of map[i]) {
        entity.position.x += padLeft;
      }
    }
  }

  cb({ progress: 75 });

  // crop right
  const contentMaxX = LIMIT_X - PADDING_SIZE;
  for (let i = 0; i < map.length; i++) {
    map[i] = map[i].filter((entity) => entity.position.x < contentMaxX);
  }

  cb({
    width: LIMIT_X,
    height: LIMIT_Y,
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
