const { Color } = require("./color");
const { Entity } = require("./entity");

class Bullet extends Entity {
  constructor(position, direction, speed = 1, hitCallback = null) {
    super(position);

    this.direction = direction; // normalized direction vector {x, y}
    this.speed = speed;
    this.hitCallback = hitCallback; // function to call when bullet hits something
    this._color = Color.yellow();
    this.active = true;
  }

  get color() {
    return this._color;
  }

  // Update bullet position
  update() {
    if (!this.active) return false;

    // Move bullet in its direction
    this.position.x += this.direction.x * this.speed;
    this.position.y += this.direction.y * this.speed;

    return true;
  }

  // Called when bullet hits an entity
  onHit(entity) {
    this.active = false;
    if (this.hitCallback) {
      this.hitCallback(entity);
    }
  }

  // Called when bullet goes out of bounds
  onOutOfBounds() {
    this.active = false;
  }
}

module.exports = { Bullet };
