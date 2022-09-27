const { JungleMap } = require('./map');
const { UI } = require('../ui');

class Jungle {
    constructor() {
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
    }

    initOpen() {
        const openInput = document.createElement('input');
        openInput.type = 'file';
        openInput.style.display = 'none';
        document.body.appendChild(openInput);

        openInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (file) {
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
                this.map = new JungleMap(this.ui.canvas.getImageData());
                this.ui.canvas.resize();
                console.log(this.map);
            }
        });

        this.ui.toolbar.buttons['open'].addEventListener('click', () => {
            openInput.click();
        });
    }

    render() {
        if (this.map) {
            // TODO only render the area in viewport
            this.ui.canvas.setImageData(this.map.toImageData());
        }
        window.requestAnimationFrame(this.render.bind(this));
    }
}

module.exports = { Jungle };