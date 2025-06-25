const { Entity } = require("./entity");
const { Color } = require("./color");

class Player extends Entity {
  constructor(position) {
    super(position);
    this.speed = 2; // Movement speed in pixels
    this._color = new Color(255, 255, 0, 255); // Yellow color for better visibility
    this.radius = 3; // Collision radius - small for precise movement
    this.renderRadius = 7; // Visual radius - larger for visibility
  }

  move(deltaX, deltaY) {
    this.position.x += deltaX * this.speed;
    this.position.y += deltaY * this.speed;
  }

  render(ctx) {
    // Save context
    ctx.save();

    // Draw the player as a circle using render radius for visibility
    ctx.fillStyle = `rgba(${this._color.red}, ${this._color.green}, ${
      this._color.blue
    }, ${this._color.alpha / 255})`;
    ctx.beginPath();
    ctx.arc(
      this.position.x + this.radius, // Center based on collision radius
      this.position.y + this.radius,
      this.renderRadius, // But draw with larger visual radius
      0,
      2 * Math.PI
    );
    ctx.fill();

    // Add a thick black border for contrast
    ctx.strokeStyle = "rgba(0, 0, 0, 1)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Add inner white border for extra visibility
    ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
    ctx.lineWidth = 1;
    ctx.stroke();

    // Restore context
    ctx.restore();
  }
}

module.exports = { Player };
