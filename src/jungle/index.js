const { JungleMap } = require("./map");
const { UI } = require("../ui");
const text2Image = require("./common/text2image");
const { Position } = require("./entity/position");
const { Player } = require("./entity/player");

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

  spawnPlayer() {
    const playerPosition = new Position(10, 10);
    this.player = new Player(playerPosition);
    this.map.addEntity(this.player, true);
    console.log(this.map.map);
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
