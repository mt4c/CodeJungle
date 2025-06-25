const { JungleMap } = require("./map");
const { UI } = require("../ui");
const text2Image = require("./common/text2image");
const { Position } = require("./entity/position");
const { Player } = require("./entity/player");
const { PlayerSprite } = require("./entity/sprite/playerSprite");
const { Bullet } = require("./entity/bullet");
const { BulletSprite } = require("./entity/sprite/bulletSprite");

class Jungle {
  constructor() {
    this.loaded = false;
    this.isLoading = false;
    this.started = false;
    this.needUpdate = false;
    this.player = null;
    this.bullets = [];
    this.mouseDown = false;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.shootingInterval = null;
    this.keysPressed = {};
    this.movementInterval = null;
    this.lastShotTime = 0;
  }

  init() {
    this.initUI();
    this.initOpen();
    this.initRun();
    this.initKeyboard();
    this.initMouse();

    window.dispatchEvent(new Event("resize"));
  }

  initUI() {
    document.body.innerHTML = "";

    const wrapper = document.createElement("div");
    this.ui = new UI(wrapper);
    document.body.appendChild(wrapper);
  }

  initOpen() {
    const openInput = document.createElement("input");
    openInput.type = "file";
    openInput.style.display = "none";
    document.body.appendChild(openInput);

    openInput.addEventListener("change", async (event) => {
      if (this.isLoading) {
        return;
      }
      const file = event.target.files[0];
      if (file) {
        this.reset();
        this.setLoading(true);
        try {
          this.map = null;
          this.ui.statusBar.progressBar.setProgress(0);

          const content = await new Promise((resolve, reject) => {
            try {
              const reader = new FileReader();

              reader.addEventListener("load", (event) => {
                const content = event.target.result;
                resolve(content);
              });

              reader.readAsText(file, "utf-8");
            } catch (err) {
              reject(err);
            } finally {
              openInput.value = null;
            }
          });

          console.log(content);
          const printedCanvas = await text2Image(content);
          this.imageData = null;
          this.ui.canvas.clear();
          this.ui.canvas.copyCanvas(printedCanvas);

          this.ui.statusBar.progressBar.setProgress(20);

          this.map = new JungleMap();
          await this.map.loadImageData(
            this.ui.canvas.getImageData(),
            (progress) => {
              this.ui.statusBar.progressBar.setProgress(
                20 + Math.trunc(progress * 0.8)
              );
            }
          );
          this.ui.canvas.resize();
          this.render(true);

          this.ui.statusBar.progressBar.setProgress(100);
          this.loaded = true;
          this.needUpdate = true;
          console.log(this.map);
        } catch (err) {
          console.error(err);
        } finally {
          this.setLoading(false);
        }
      }
    });

    this.ui.toolbar.buttons["open"].addEventListener("click", () => {
      if (this.isLoading) {
        return;
      }
      openInput.click();
    });
  }

  initRun() {
    this.ui.toolbar.buttons["run"].addEventListener("click", () => {
      if (this.isLoading || !this.loaded) {
        return;
      }

      console.log("Start!");
      this.spawnPlayer();
      this.started = true;
      this.startMovementProcessing();
    });
  }

  startMovementProcessing() {
    if (this.movementInterval) {
      return; // Already processing movement
    }

    // Use player's movement speed
    const movementSpeed = this.player ? this.player.movementSpeed : 150;
    this.movementInterval = setInterval(() => {
      if (this.started && this.player) {
        this.processMovement();
      } else {
        this.stopMovementProcessing();
      }
    }, movementSpeed);
  }

  stopMovementProcessing() {
    if (this.movementInterval) {
      clearInterval(this.movementInterval);
      this.movementInterval = null;
    }
  }

  initKeyboard() {
    document.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      if (["w", "a", "s", "d"].includes(key)) {
        this.keysPressed[key] = true;
        event.preventDefault();
      }
    });

    document.addEventListener("keyup", (event) => {
      const key = event.key.toLowerCase();
      if (["w", "a", "s", "d"].includes(key)) {
        this.keysPressed[key] = false;
        event.preventDefault();
      }
    });
  }

  processMovement() {
    if (!this.started || !this.player) {
      return;
    }

    const currentPos = this.player.position;
    let deltaX = 0;
    let deltaY = 0;

    // Calculate movement delta based on pressed keys
    if (this.keysPressed["w"]) deltaY -= 1; // Up
    if (this.keysPressed["s"]) deltaY += 1; // Down
    if (this.keysPressed["a"]) deltaX -= 1; // Left
    if (this.keysPressed["d"]) deltaX += 1; // Right

    // Only move if there's input
    if (deltaX === 0 && deltaY === 0) {
      return;
    }

    // Calculate new position with bounds checking
    const newX = Math.max(
      0,
      Math.min(this.map.width - 1, currentPos.x + deltaX)
    );
    const newY = Math.max(
      0,
      Math.min(this.map.height - 1, currentPos.y + deltaY)
    );

    // Check if the new position is valid (not occupied by a wall)
    const newPosition = new Position(newX, newY);
    const entityAtNewPosition = this.map.getEntityByPosition(newPosition);

    if (!entityAtNewPosition || entityAtNewPosition === this.player) {
      // Remove player from old position
      this.removePlayerFromMap();

      // Move player to new position
      this.player.move(newPosition);
      this.map.addEntity(this.player, true);
      this.needUpdate = true;
    }
  }

  initMouse() {
    // Add mouse event listeners for continuous shooting
    this.ui.canvas.ele.addEventListener("mousedown", (event) => {
      if (!this.started || !this.player || event.button !== 0) {
        return; // Only handle left mouse button
      }

      this.mouseDown = true;
      this.updateMousePosition(event);

      // Shoot immediately on mouse down
      this.shootBullet(this.lastMouseX, this.lastMouseY);

      // Start continuous shooting
      this.startContinuousShooting();
    });

    this.ui.canvas.ele.addEventListener("mouseup", (event) => {
      if (event.button !== 0) {
        return; // Only handle left mouse button
      }

      this.mouseDown = false;
      this.stopContinuousShooting();
    });

    this.ui.canvas.ele.addEventListener("mousemove", (event) => {
      if (!this.started || !this.player) {
        return;
      }

      this.updateMousePosition(event);
    });

    // Stop shooting when mouse leaves canvas
    this.ui.canvas.ele.addEventListener("mouseleave", () => {
      this.mouseDown = false;
      this.stopContinuousShooting();
    });

    // Prevent context menu on right click
    this.ui.canvas.ele.addEventListener("contextmenu", (event) => {
      event.preventDefault();
    });
  }

  updateMousePosition(event) {
    const rect = this.ui.canvas.ele.getBoundingClientRect();
    this.lastMouseX = Math.floor(event.clientX - rect.left);
    this.lastMouseY = Math.floor(event.clientY - rect.top);
  }

  startContinuousShooting() {
    if (this.shootingInterval) {
      return; // Already shooting
    }

    // Use player's shooting speed
    const shootingSpeed = this.player ? this.player.shootingSpeed : 100;
    this.shootingInterval = setInterval(() => {
      if (this.mouseDown && this.started && this.player) {
        this.shootBullet(this.lastMouseX, this.lastMouseY);
      } else {
        this.stopContinuousShooting();
      }
    }, shootingSpeed);
  }

  stopContinuousShooting() {
    if (this.shootingInterval) {
      clearInterval(this.shootingInterval);
      this.shootingInterval = null;
    }
  }

  shootBullet(targetX, targetY) {
    if (!this.player) return;

    // Check shooting cooldown to prevent rapid clicking
    const currentTime = Date.now();
    const shootingSpeed = this.player.shootingSpeed;
    if (currentTime - this.lastShotTime < shootingSpeed) {
      return; // Still in cooldown period
    }

    this.lastShotTime = currentTime;

    const playerX = this.player.position.x;
    const playerY = this.player.position.y;

    // Calculate direction vector from player to target
    const dx = targetX - playerX;
    const dy = targetY - playerY;

    // Normalize the direction vector
    const length = Math.sqrt(dx * dx + dy * dy);
    if (length === 0) return; // Don't shoot if clicking on player position

    const directionX = dx / length;
    const directionY = dy / length;

    // Create bullet at player position
    const bulletPosition = new Position(playerX, playerY);
    const bullet = new Bullet(
      bulletPosition,
      { x: directionX, y: directionY },
      2, // speed
      (hitEntity) => {
        // Hit callback - call the hit method on the entity
        if (hitEntity && typeof hitEntity.hit === "function") {
          hitEntity.hit(bullet);
        }
      }
    );

    // Create bullet sprite for larger rendering
    const bulletSprite = new BulletSprite(bullet, 5); // 5x5 pixel bullet
    bullet.sprite = bulletSprite; // Store reference for cleanup

    this.bullets.push(bullet);
    this.map.sprites.push(bulletSprite);
    this.needUpdate = true;
  }

  updateBullets() {
    // Update all bullets and remove inactive ones
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];

      if (!bullet.active) {
        // Remove bullet sprite from map
        if (bullet.sprite) {
          const spriteIndex = this.map.sprites.indexOf(bullet.sprite);
          if (spriteIndex !== -1) {
            this.map.sprites.splice(spriteIndex, 1);
          }
        }
        this.bullets.splice(i, 1);
        continue;
      }

      // Store old position
      const oldX = Math.floor(bullet.position.x);
      const oldY = Math.floor(bullet.position.y);

      // Update bullet position
      bullet.update();

      // Check new position
      const newX = Math.floor(bullet.position.x);
      const newY = Math.floor(bullet.position.y);

      // Check if bullet is out of bounds
      if (
        newX < 0 ||
        newX >= this.map.width ||
        newY < 0 ||
        newY >= this.map.height
      ) {
        bullet.onOutOfBounds();
        // Remove bullet sprite from map
        if (bullet.sprite) {
          const spriteIndex = this.map.sprites.indexOf(bullet.sprite);
          if (spriteIndex !== -1) {
            this.map.sprites.splice(spriteIndex, 1);
          }
        }
        this.bullets.splice(i, 1);
        continue;
      }

      // Check for collision with entities (only if position changed to a new grid cell)
      if (newX !== oldX || newY !== oldY) {
        const hitEntity = this.map.getEntityByPosition(
          new Position(newX, newY)
        );
        if (hitEntity && hitEntity !== this.player) {
          bullet.onHit(hitEntity);
          // Remove bullet sprite from map
          if (bullet.sprite) {
            const spriteIndex = this.map.sprites.indexOf(bullet.sprite);
            if (spriteIndex !== -1) {
              this.map.sprites.splice(spriteIndex, 1);
            }
          }
          this.bullets.splice(i, 1);
        }
      }
    }
  }

  spawnPlayer() {
    const playerPosition = this.findRandomSpawnPosition();
    this.player = new Player(playerPosition);
    this.map.addEntity(this.player, true);

    // Create and add player sprite for larger rendering
    this.playerSprite = new PlayerSprite(this.player, 8); // 8x8 pixel player
    this.map.sprites.push(this.playerSprite);

    console.log(this.map.map);
  }

  findRandomSpawnPosition() {
    const maxAttempts = 1000; // Prevent infinite loop
    let attempts = 0;

    while (attempts < maxAttempts) {
      // Generate random coordinates within map bounds
      const randomX = Math.floor(Math.random() * this.map.width);
      const randomY = Math.floor(Math.random() * this.map.height);
      const position = new Position(randomX, randomY);

      // Check if position is unoccupied
      const entityAtPosition = this.map.getEntityByPosition(position);
      if (!entityAtPosition) {
        return position; // Found empty position
      }

      attempts++;
    }

    // Fallback: if no empty position found after many attempts, use default
    console.warn("Could not find empty spawn position, using fallback");
    return new Position(10, 10);
  }

  removePlayerFromMap() {
    if (!this.player) return;

    const row = this.map.map[this.player.position.y];
    const playerIndex = row.findIndex((entity) => entity === this.player);
    if (playerIndex !== -1) {
      row.splice(playerIndex, 1);
    }
  }

  setLoading(isLoading) {
    this.isLoading = isLoading;
    if (this.isLoading) {
      this.ui.setLoading(true);
    } else {
      this.ui.setLoading(false);
    }
  }

  reset() {
    this.started = false;
    this.loaded = false;
    this.needUpdate = false;
    this.player = null;
    this.playerSprite = null;
    this.bullets = [];
    this.mouseDown = false;
    this.keysPressed = {};
    this.lastShotTime = 0;
    this.stopContinuousShooting();
    this.stopMovementProcessing();

    // Clear sprites from map if it exists
    if (this.map) {
      this.map.sprites = [];
    }
  }

  render() {
    if (this.map && this.map.loaded) {
      // Update bullets if game is started
      if (this.started) {
        this.updateBullets();
      }

      // TODO only render the area in viewport
      let doUpdate = false;
      if (this.needUpdate) {
        doUpdate = true;
        this.needUpdate = false;
      } else if (this.started) {
        doUpdate = true;
      }
      if (doUpdate) {
        // Pass bullets to map for rendering
        this.map.bullets = this.bullets;
        this.ui.canvas.setImageData(this.map.toImageData());
      }
    }
    window.requestAnimationFrame(this.render.bind(this));
  }
}

module.exports = { Jungle };
