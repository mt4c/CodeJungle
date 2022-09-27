const { ProgressBar } = require("./progress-bar");

class StatusBar {
    constructor(barEle) {
        this.ele = barEle;
        this.ele.classList.add('jungle-status-bar');

        for (let i = 0; i < 3; i++) {
            const placeholder = document.createElement('div');
            placeholder.classList.add('placeholder');
            this.ele.appendChild(placeholder);
        }

        const progressBarEle = document.createElement('div');
        this.ele.appendChild(progressBarEle);
        this.progressBar = new ProgressBar(progressBarEle);
    }
}

module.exports = { StatusBar };