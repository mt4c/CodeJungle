const Sprite = require("./sprite");

class PlayerSprite extends Sprite {
  constructor(player, size = 5) {
    super();
    this.player = player;
    this.size = size; // Size of the player (will be size x size pixels)
  }

  draw(map) {
    const centerX = this.player.position.x;
    const centerY = this.player.position.y;
    const radius = Math.floor(this.size / 2);

    // Get the image data array
    const dataArr = map._currentImageData;

    // Draw a circle around the player's position
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const x = centerX + dx;
        const y = centerY + dy;

        // Check if the point is within the circle using distance formula
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= radius) {
          // Check bounds
          if (x >= 0 && x < map.width && y >= 0 && y < map.height) {
            const ptr = (map.width * y + x) * 4;

            // Set pixel to player color
            dataArr[ptr] = this.player.color.red;
            dataArr[ptr + 1] = this.player.color.green;
            dataArr[ptr + 2] = this.player.color.blue;
            dataArr[ptr + 3] = this.player.color.alpha;
          }
        }
      }
    }
  }

  isEnd() {
    return false; // Player sprite should persist
  }
}

module.exports = { PlayerSprite };
