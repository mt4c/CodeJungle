const { Color } = require("./color");

class Explosion {
  constructor(position) {
    this.position = position;
    this.particles = [];
    this.duration = 30; // frames
    this.age = 0;
    this.active = true;

    // Create explosion particles
    this.createParticles();
  }

  createParticles() {
    const particleCount = 8;
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const speed = 2 + Math.random() * 3; // Random speed 2-5

      this.particles.push({
        x: this.position.x,
        y: this.position.y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1.0, // Life from 1.0 to 0.0
        decay: 0.03 + Math.random() * 0.02, // Random decay rate
        size: 2 + Math.random() * 3, // Random size 2-5
        color: this.getRandomExplosionColor(),
      });
    }
  }

  getRandomExplosionColor() {
    const colors = [
      new Color(255, 100, 0, 255), // Orange
      new Color(255, 150, 0, 255), // Light orange
      new Color(255, 200, 0, 255), // Yellow-orange
      new Color(255, 255, 100, 255), // Light yellow
      new Color(255, 80, 80, 255), // Red-orange
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  update() {
    if (!this.active) return;

    this.age++;

    // Update particles
    this.particles.forEach((particle) => {
      // Move particle
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Apply gravity/drag
      particle.vx *= 0.98;
      particle.vy *= 0.98;

      // Reduce life
      particle.life -= particle.decay;

      // Update alpha based on life
      particle.color.alpha = Math.round(255 * Math.max(0, particle.life));
    });

    // Remove dead particles
    this.particles = this.particles.filter((particle) => particle.life > 0);

    // Deactivate when all particles are gone or duration exceeded
    if (this.particles.length === 0 || this.age > this.duration) {
      this.active = false;
    }
  }

  render(ctx) {
    if (!this.active) return;

    ctx.save();

    this.particles.forEach((particle) => {
      if (particle.life > 0) {
        ctx.fillStyle = `rgba(${particle.color.red}, ${particle.color.green}, ${
          particle.color.blue
        }, ${particle.color.alpha / 255})`;

        ctx.beginPath();
        ctx.arc(
          particle.x,
          particle.y,
          particle.size * particle.life, // Size shrinks with life
          0,
          2 * Math.PI
        );
        ctx.fill();
      }
    });

    ctx.restore();
  }

  isFinished() {
    return !this.active;
  }
}

module.exports = { Explosion };
