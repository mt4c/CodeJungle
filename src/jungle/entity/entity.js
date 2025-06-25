const { Color } = require("./color");

class Entity {
  constructor(position) {
    this.position = position;
    this._color = Color.transparent();
    this.maxHP = 100;
    this.hp = 100;
  }

  takeDamage(damage) {
    this.hp -= damage;
    if (this.hp <= 0) {
      this.hp = 0;
      this.destroy();
    }
    // Update opacity based on HP percentage
    this.updateOpacity();
  }

  updateOpacity() {
    const hpPercentage = this.hp / this.maxHP;
    // Map HP from 100% to 0% onto alpha range 255 to 20
    const minAlpha = 20;
    const maxAlpha = 255;
    this._color.alpha = Math.round(
      minAlpha + (maxAlpha - minAlpha) * hpPercentage
    );
  }

  destroy() {
    this.destroyed = true;
  }

  isDestroyed() {
    return this.hp <= 0 || this.destroyed;
  }
}

module.exports = { Entity };
