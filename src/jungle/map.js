class JungleMap {
  constructor() {
    this.loaded = false;
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

    this.loaded = true;
  }

  toImageData() {
    const dataArr = new Uint8ClampedArray(this.width * this.height * 4);

    for (let i = 0; i < this.height; i++) {
      for (const entity of this.map[i]) {
        const ptr = (this.width * i + entity.position.x) * 4;
        dataArr[ptr] = entity.color.red;
        dataArr[ptr + 1] = entity.color.green;
        dataArr[ptr + 2] = entity.color.blue;
        dataArr[ptr + 3] = entity.color.alpha;
      }
    }

    return new ImageData(dataArr, this.width, this.height);
  }
}

module.exports = { JungleMap };
