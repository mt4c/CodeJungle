const { UI } = require("../ui");
const { JungleMap } = require("./jungle-map");

class Jungle {
  constructor() {
    this.loaded = false;
    this.isLoading = false;
    this.started = false;
    this.needUpdate = false;
    this.map = new JungleMap();
  }

  init() {
    this.initUI();
    this.initOpen();
    this.initRun();
    this.initKeyboardControls();
    this.initMouseControls();

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
          this.ui.canvas.clear();

          this.ui.statusBar.progressBar.setProgress(20);

          // Load content into the map with filename for language detection
          this.map.loadFromContent(content, file.name);

          this.ui.statusBar.progressBar.setProgress(60);

          this.ui.canvas.resize();
          this.renderMap();

          this.ui.statusBar.progressBar.setProgress(100);
          this.loaded = true;
          this.needUpdate = true;
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
      console.log("Run button clicked!");
      if (this.isLoading || !this.loaded) {
        console.log(
          "Cannot start - isLoading:",
          this.isLoading,
          "loaded:",
          this.loaded
        );
        return;
      }

      console.log("Start!");
      this.started = true;
      this.map.startGame();
      this.needUpdate = true;

      // Start the render loop when game starts
      this.render();
    });
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
    this.map.stopGame();
  }

  render() {
    if (this.started) {
      // Handle continuous shooting
      this.handleContinuousShooting();

      // Update game state (bullets, etc.)
      this.map.update();
      this.needUpdate = true;
    }

    if (this.needUpdate) {
      console.log("needUpdate is true, calling renderMap");
      this.renderMap();
      this.needUpdate = false;
    }
    window.requestAnimationFrame(this.render.bind(this));
  }

  handleContinuousShooting() {
    if (this.mousePressed && this.started && !this.isLoading) {
      const currentTime = Date.now();
      if (currentTime - this.lastShotTime >= this.shootInterval) {
        this.map.shootBullet(this.mouseX, this.mouseY);
        this.lastShotTime = currentTime;
      }
    }
  }

  renderMap() {
    console.log("renderMap() called");
    if (this.map && this.ui && this.ui.canvas) {
      this.ui.canvas.clear();
      this.map.render(this.ui.canvas);
    } else {
      console.log(
        "renderMap failed - map:",
        !!this.map,
        "ui:",
        !!this.ui,
        "canvas:",
        !!this.ui?.canvas
      );
    }
  }

  initKeyboardControls() {
    // Track pressed keys
    this.pressedKeys = new Set();

    document.addEventListener("keydown", (event) => {
      if (!this.started || this.isLoading) {
        return;
      }

      const key = event.key.toLowerCase();
      this.pressedKeys.add(key);

      // Handle movement
      this.handleMovement();
      event.preventDefault();
    });

    document.addEventListener("keyup", (event) => {
      const key = event.key.toLowerCase();
      this.pressedKeys.delete(key);
    });
  }

  handleMovement() {
    if (!this.started || !this.map) {
      return;
    }

    let deltaX = 0;
    let deltaY = 0;

    // Calculate movement based on pressed keys (8-directional)
    if (this.pressedKeys.has("w")) deltaY -= 1;
    if (this.pressedKeys.has("s")) deltaY += 1;
    if (this.pressedKeys.has("a")) deltaX -= 1;
    if (this.pressedKeys.has("d")) deltaX += 1;

    // Move player if there's input
    if (deltaX !== 0 || deltaY !== 0) {
      this.map.movePlayer(deltaX, deltaY);
      this.needUpdate = true;
    }
  }

  initMouseControls() {
    // Track mouse state for continuous shooting
    this.mousePressed = false;
    this.mouseX = 0;
    this.mouseY = 0;
    this.lastShotTime = 0;
    this.shootInterval = 150; // Milliseconds between shots when holding

    document.addEventListener("mousedown", (event) => {
      if (!this.started || this.isLoading) {
        return;
      }

      if (event.button === 0) {
        // Left mouse button
        this.mousePressed = true;

        // Get mouse position relative to canvas
        const rect = this.ui.canvas.ele.getBoundingClientRect();
        this.mouseX = event.clientX - rect.left;
        this.mouseY = event.clientY - rect.top;

        // Shoot immediately
        this.map.shootBullet(this.mouseX, this.mouseY);
        this.lastShotTime = Date.now();
        event.preventDefault();
      }
    });

    document.addEventListener("mouseup", (event) => {
      if (event.button === 0) {
        this.mousePressed = false;
      }
    });

    document.addEventListener("mousemove", (event) => {
      if (!this.started || this.isLoading) {
        return;
      }

      // Update mouse position for continuous shooting
      const rect = this.ui.canvas.ele.getBoundingClientRect();
      this.mouseX = event.clientX - rect.left;
      this.mouseY = event.clientY - rect.top;
    });
  }
}

module.exports = { Jungle };
