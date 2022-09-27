const { JungleMap } = require('./map');
const { UI } = require('../ui');

class Jungle {
    constructor() {
        this.isLoading = false;
    }

    init() {
        this.initUI();
        this.initOpen();

        window.dispatchEvent(new Event('resize'));
    }

    initUI() {
        document.body.innerHTML = '';

        const wrapper = document.createElement('div');
        this.ui = new UI(wrapper);
        document.body.appendChild(wrapper);

        window.addEventListener('resize', () => {
            this.ui.canvas.resize();
            this.render();
        });
    }

    initOpen() {
        const openInput = document.createElement('input');
        openInput.type = 'file';
        openInput.style.display = 'none';
        document.body.appendChild(openInput);

        openInput.addEventListener('change', async (event) => {
            if (this.isLoading) {
                return;
            }
            const file = event.target.files[0];
            if (file) {
                this.setLoading(true);
                try {
                    this.map = null;
                    this.ui.statusBar.progressBar.setProgress(0);

                    const content = await new Promise((resolve, reject) => {
                        try {
                            const reader = new FileReader();

                            reader.addEventListener('load', (event) => {
                                const content = event.target.result;
                                resolve(content);
                            });

                            reader.readAsText(file, 'utf-8');
                        } catch (err) {
                            reject(err);
                        } finally {
                            openInput.value = null;
                        }
                    });

                    console.log(content);
                    this.imageData = null;
                    this.ui.canvas.clear();
                    this.ui.canvas.printText(content);

                    this.ui.statusBar.progressBar.setProgress(20);

                    this.map = new JungleMap();
                    await this.map.loadImageData(this.ui.canvas.getImageData(), progress => {
                        this.ui.statusBar.progressBar.setProgress(20 + Math.trunc(progress * 0.8));
                    });
                    this.ui.canvas.resize();
                    this.render(true);

                    this.ui.statusBar.progressBar.setProgress(100);
                    console.log(this.map);
                } catch (err) {
                    console.error(err);
                } finally {
                    this.setLoading(false);
                }
            }
        });

        this.ui.toolbar.buttons['open'].addEventListener('click', () => {
            if (this.isLoading) {
                return;
            }
            openInput.click();
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

    render(keep = false) {
        if (this.map && this.map.loaded) {
            // TODO only render the area in viewport
            this.ui.canvas.setImageData(this.map.toImageData());
        }
        if (keep) {
            window.requestAnimationFrame(this.render.bind(this));
        }
    }
}

module.exports = { Jungle };