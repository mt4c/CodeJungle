const Sprite = require("./sprite");

class BulletSprite extends Sprite {
  constructor(bullet, size = 3) {
    super();
    this.bullet = bullet;
    this.size = size;
  }

  draw(map) {
    if (!this.bullet.active || !map._currentImageData) return;

    const centerX = Math.floor(this.bullet.position.x);
    const centerY = Math.floor(this.bullet.position.y);
    const halfSize = Math.floor(this.size / 2);

    // Draw a square bullet sprite
    for (let y = centerY - halfSize; y <= centerY + halfSize; y++) {
      for (let x = centerX - halfSize; x <= centerX + halfSize; x++) {
        if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
          const ptr = (map.width * y + x) * 4;
          map._currentImageData[ptr] = this.bullet.color.red;
          map._currentImageData[ptr + 1] = this.bullet.color.green;
          map._currentImageData[ptr + 2] = this.bullet.color.blue;
          map._currentImageData[ptr + 3] = this.bullet.color.alpha;
        }
      }
    }
  }
}

module.exports = { BulletSprite };
