const { Position } = require("./entity/position");
const { Wall } = require("./entity/wall");
const { Color } = require("./entity/color");

class JungleMap {
  constructor() {
    this.loaded = false;
    this.sprites = [];
  }

  async loadImageData(imageData, cb) {
    const result = await new Promise((resolve, reject) => {
      const worker = new Worker(
        new URL("../worker/map-worker.js", import.meta.url)
      );

      worker.addEventListener("message", (msg) => {
        if (msg.data.progress === 100) {
          worker.terminate();
          resolve(msg.data);
        } else {
          cb(msg.data.progress);
        }
      });

      worker.addEventListener("error", (err) => {
        worker.terminate();
        reject(err);
      });

      worker.postMessage({ imageData });
    });

    console.log(result);

    this.width = result.width;
    this.height = result.height;
    this.map = result.map;

    this.map.forEach((row) => {
      for (let i = 0; i < row.length; i++) {
        row[i] = new Wall(
          new Position(row[i].position.x, row[i].position.y),
          new Color(
            row[i]._color.red,
            row[i]._color.green,
            row[i]._color.blue,
            row[i]._color.alpha
          )
        );
      }
    });

    this.loaded = true;
  }

  toImageData() {
    const dataArr = new Uint8ClampedArray(this.width * this.height * 4);
    this._currentImageData = dataArr; // Make data array accessible to sprites

    for (let i = 0; i < this.height; i++) {
      for (const entity of this.map[i]) {
        const ptr = (this.width * i + entity.position.x) * 4;

        if (!entity.color) {
          console.log(entity);
        }

        dataArr[ptr] = entity.color.red;
        dataArr[ptr + 1] = entity.color.green;
        dataArr[ptr + 2] = entity.color.blue;
        dataArr[ptr + 3] = entity.color.alpha;
      }
    }

    for (const sprite of this.sprites) {
      sprite.draw(this);
    }

    return new ImageData(dataArr, this.width, this.height);
  }

  getEntityByPosition(position) {
    if (
      position.x < 0 ||
      position.x >= this.width ||
      position.y < 0 ||
      position.y >= this.height
    ) {
      return null;
    }

    const row = this.map[position.y];

    if (row.length > 0) {
      // binary search
      let left = 0;
      let right = row.length - 1;
      while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (row[mid].position.x === position.x) {
          return row[mid];
        } else if (row[mid].position.x < position.x) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }
    }

    return null;
  }

  addEntity(entity, force = false) {
    if (
      entity.position.x < 0 ||
      entity.position.x >= this.width ||
      entity.position.y < 0 ||
      entity.position.y >= this.height
    ) {
      throw new Error("Invalid position");
    }

    const row = this.map[entity.position.y];

    if (row.length > 0) {
      // binary search
      let left = 0;
      let right = row.length - 1;
      while (left <= right) {
        const mid = Math.floor((left + right) / 2);

        if (row[mid].position.x === entity.position.x) {
          if (force) {
            row[mid] = entity;
            return;
          } else {
            throw new Error("Position occupied");
          }
        } else if (row[mid].position.x < entity.position.x) {
          left = mid + 1;
        } else {
          right = mid - 1;
        }
      }

      row.splice(left, 0, entity);
    } else {
      row.push(entity);
    }
  }
}

module.exports = { JungleMap };
