const { Entity } = require("./entity");

class Wall extends Entity {
  constructor(position, color) {
    super(position);

    this.hp = 100;
    this._color = color;
  }

  get color() {
    // TODO: change color by hp (be transparent, min value 30?)
    return this._color;
  }

  set color(newColor) {
    this._color = newColor;
  }

  hit(bullet) {
    this.hp = Math.min(0, this.hp - 1);
  }
}

module.exports = { Wall };
