const { Entity } = require("./entity");
const { Color } = require("./color");

class Bullet extends Entity {
  constructor(position, direction, speed = 5) {
    super(position);
    this.direction = direction; // Normalized direction vector {x, y}
    this.speed = speed; // Pixels per frame
    this._color = new Color(255, 255, 255, 255); // White color for bullet
    this.radius = 2; // Small bullet size
    this.active = true; // Whether bullet is still moving
  }

  update() {
    if (!this.active) return;

    // Move bullet in its direction
    this.position.x += this.direction.x * this.speed;
    this.position.y += this.direction.y * this.speed;
  }

  render(ctx) {
    if (!this.active) return;

    // Save context
    ctx.save();

    // Draw the bullet as a small circle
    ctx.fillStyle = `rgba(${this._color.red}, ${this._color.green}, ${
      this._color.blue
    }, ${this._color.alpha / 255})`;
    ctx.beginPath();
    ctx.arc(
      this.position.x + this.radius,
      this.position.y + this.radius,
      this.radius,
      0,
      2 * Math.PI
    );
    ctx.fill();

    // Add a thin border
    ctx.strokeStyle = "rgba(0, 0, 0, 0.8)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Restore context
    ctx.restore();
  }

  destroy() {
    this.active = false;
  }
}

module.exports = { Bullet };
