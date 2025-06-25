const { Color } = require("./color");
const { Entity } = require("./entity");

class Player extends Entity {
  constructor(position) {
    super(position);

    this.hp = 100;
    this._color = Color.white();
    this.movementSpeed = 75; // Movement interval in milliseconds (lower = faster)
    this.shootingSpeed = 333; // Shooting interval in milliseconds (lower = faster)
  }

  get color() {
    // TODO: change color by hp (lower red)
    return this._color;
  }

  move(position) {
    this.position = position;
  }

  hit(bullet) {
    this.hp = Math.min(0, this.hp - 1);
  }
}

module.exports = { Player };
