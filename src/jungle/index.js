const { JungleMap } = require("./map");
const { UI } = require("../ui");
const text2Image = require("./common/text2image");
const { Position } = require("./entity/position");
const { Player } = require("./entity/player");
const { PlayerSprite } = require("./entity/sprite/playerSprite");

class Jungle {
  constructor() {
    this.loaded = false;
    this.isLoading = false;
    this.started = false;
    this.needUpdate = false;
    this.player = null;
  }

  init() {
    this.initUI();
    this.initOpen();
    this.initRun();
    this.initKeyboard();

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
    });
  }

  initKeyboard() {
    document.addEventListener("keydown", (event) => {
      if (!this.started || !this.player) {
        return;
      }

      const currentPos = this.player.position;
      let newX = currentPos.x;
      let newY = currentPos.y;

      // Handle WASD movement
      switch (event.key.toLowerCase()) {
        case "w":
          newY = Math.max(0, currentPos.y - 1);
          break;
        case "a":
          newX = Math.max(0, currentPos.x - 1);
          break;
        case "s":
          newY = Math.min(this.map.height - 1, currentPos.y + 1);
          break;
        case "d":
          newX = Math.min(this.map.width - 1, currentPos.x + 1);
          break;
        default:
          return; // Ignore other keys
      }

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

      // Prevent default browser behavior for these keys
      event.preventDefault();
    });
  }

  spawnPlayer() {
    const playerPosition = new Position(10, 10);
    this.player = new Player(playerPosition);
    this.map.addEntity(this.player, true);

    // Create and add player sprite for larger rendering
    this.playerSprite = new PlayerSprite(this.player, 8); // 8x8 pixel player
    this.map.sprites.push(this.playerSprite);

    console.log(this.map.map);
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

    // Clear sprites from map if it exists
    if (this.map) {
      this.map.sprites = [];
    }
  }

  render() {
    if (this.map && this.map.loaded) {
      // TODO only render the area in viewport
      let doUpdate = false;
      if (this.needUpdate) {
        doUpdate = true;
        this.needUpdate = false;
      } else if (this.started) {
        doUpdate = true;
      }
      if (doUpdate) {
        this.ui.canvas.setImageData(this.map.toImageData());
      }
    }
    window.requestAnimationFrame(this.render.bind(this));
  }
}

module.exports = { Jungle };
