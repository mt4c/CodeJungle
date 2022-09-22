const { UI } = require('../ui');

class Jungle {
    constructor() {
    }

    init() {
        this.initUI();
        this.initOpen();
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
            }
        });

        this.ui.toolbar.buttons['open'].addEventListener('click', () => {
            openInput.click();
        });
    }
}

module.exports = { Jungle };