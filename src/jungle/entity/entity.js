const { Color } = require("./color");

class Entity {
  constructor(position) {
    this.position = position;
    this._color = Color.transparent();
  }

  hit(bullet) {
    // do nothing
  }
}

module.exports = { Entity };
