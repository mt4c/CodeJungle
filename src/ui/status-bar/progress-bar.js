class ProgressBar {
    constructor(barEle) {
        this.ele = barEle;
        this.ele.classList.add('jungle-progress-bar');

        this.progressEle = document.createElement('div');
        this.ele.appendChild(this.progressEle);
        this.progressEle.classList.add('progress');
    }

    setProgress(num) {
        if (!Number.isFinite(num)) {
            num = 0;
        }
        num = Math.min(num, 100);
        num = Math.max(num, 0);
        this.progressEle.style.width = num + '%';
    }
}

module.exports = { ProgressBar };