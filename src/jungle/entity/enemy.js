const { Entity } = require("./entity");
const { Color } = require("./color");

class Enemy extends Entity {
  constructor(position, targetEntity) {
    super(position);
    this.speed = 1; // Movement speed - slower than player
    this._color = new Color(255, 0, 0, 255); // Red color for enemies
    this.radius = 5; // Collision radius
    this.renderRadius = 8; // Visual radius
    this.target = targetEntity; // The entity to follow (usually player)
    this.invincible = false; // Invincibility state
    this.blinkTimer = 0; // Timer for blinking effect
    this.blinkDuration = 1000; // 1 second of blinking
    this.blinkInterval = 100; // Blink every 100ms
    this.visible = true; // For blinking effect
    this.lastMoveTime = 0; // For movement timing
    this.moveDelay = 16; // Move every 16ms (~60fps)
  }

  makeInvincible() {
    this.invincible = true;
    this.blinkTimer = 0;
    this.visible = true;
    console.log("Enemy became invincible and started blinking");
  }

  update() {
    const currentTime = Date.now();

    // Handle invincibility and blinking
    if (this.invincible) {
      this.blinkTimer += 16; // Assume 60fps, so ~16ms per frame

      // Blink effect
      if (this.blinkTimer % this.blinkInterval < this.blinkInterval / 2) {
        this.visible = true;
      } else {
        this.visible = false;
      }

      // End invincibility after duration
      if (this.blinkTimer >= this.blinkDuration) {
        this.invincible = false;
        this.visible = true;
        this.hp = 100; // Recover to full health
        console.log("Enemy recovered from invincibility with full HP");
      }
    }

    // Move towards target if not invincible and enough time has passed
    if (
      !this.invincible &&
      this.target &&
      currentTime - this.lastMoveTime >= this.moveDelay
    ) {
      this.moveTowardsTarget();
      this.lastMoveTime = currentTime;
    }
  }

  moveTowardsTarget() {
    if (!this.target) return;

    // Calculate direction to target
    const targetCenterX = this.target.position.x + this.target.radius;
    const targetCenterY = this.target.position.y + this.target.radius;
    const enemyCenterX = this.position.x + this.radius;
    const enemyCenterY = this.position.y + this.radius;

    const dx = targetCenterX - enemyCenterX;
    const dy = targetCenterY - enemyCenterY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Only move if not too close to target
    if (distance > this.radius + this.target.radius + 10) {
      // Normalize direction and apply speed
      const moveX = (dx / distance) * this.speed;
      const moveY = (dy / distance) * this.speed;

      this.position.x += moveX;
      this.position.y += moveY;
    }
  }

  takeDamage(damage) {
    if (this.invincible) {
      return; // No damage while invincible
    }
    super.takeDamage(damage);
  }

  render(ctx) {
    if (!this.visible) {
      return; // Don't render during blink
    }

    // Save context
    ctx.save();

    // Set color based on invincibility
    let color = this._color;
    if (this.invincible) {
      // Slightly different color when invincible
      color = new Color(255, 100, 100, 255); // Lighter red
    }

    // Draw the enemy as a circle
    ctx.fillStyle = `rgba(${color.red}, ${color.green}, ${color.blue}, ${
      color.alpha / 255
    })`;
    ctx.beginPath();
    ctx.arc(
      this.position.x + this.radius,
      this.position.y + this.radius,
      this.renderRadius,
      0,
      2 * Math.PI
    );
    ctx.fill();

    // Add border
    ctx.strokeStyle = "rgba(0, 0, 0, 1)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Add special effect for invincible enemies
    if (this.invincible) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.8)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    // Restore context
    ctx.restore();
  }
}

module.exports = { Enemy };
