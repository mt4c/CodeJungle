const { UI } = require('../ui');

class Jungle {
    constructor() {
    }

    init() {
        this.initUI();
        this.initOpen();

        window.dispatchEvent(new Event('resize'));
        window.requestAnimationFrame(this.render.bind(this));
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
                    }
                });

                console.log(content);
                this.imageData = null;
                this.ui.canvas.clear();
                this.ui.canvas.printText(content);
                this.imageData = this.ui.canvas.getImageData();
            }
        });

        this.ui.toolbar.buttons['open'].addEventListener('click', () => {
            openInput.click();
        });
    }

    render() {
        if (this.imageData) {
            this.ui.canvas.setImageData(this.imageData);
        }
        window.requestAnimationFrame(this.render.bind(this));
    }
}

module.exports = { Jungle };