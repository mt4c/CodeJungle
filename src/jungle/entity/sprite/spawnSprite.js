const { Sprite } = require("./sprite");

class SpawnSprite extends Sprite {
  constructor() {
    super();

    this.radius = 10;
  }

  draw() {
    this.radius--;
  }

  isEnd() {
    return this.radius <= 0;
  }
}

module.exports = { SpawnSprite };
