class Canvas {
    constructor(canvasEle) {
        this.ele = canvasEle;
        this.ele.classList.add('jungle-canvas');
        this.parentEle = this.ele.parentNode;

        this.context = this.ele.getContext('2d');
        //this.context.font = "30px Impact";

        this.initResize();
    }

    initResize() {
        window.addEventListener('resize', () => {
            const width = this.parentEle.clientWidth;
            const height = this.parentEle.clientHeight;
            this.ele.setAttribute('width', width);
            this.ele.setAttribute('height', height);
            this.context.width = width;
            this.context.height = height;
        }, false);
    }

    clear() {
        this.context.clearRect(0, 0, this.ele.width, this.ele.height);
    }

    printText(text) {
        const lines = text.split('\n');
        const x = 30;
        let y = 60;
        this.context.save();
        this.context.fillStyle = '#fff';
        this.context.font = "20px Consolas";
        lines.forEach(line => {
            this.context.fillText(line, x, y);
            y += 30;
        })
        this.context.restore();
    }

    getImageData() {
        return this.context.getImageData(0, 0, this.ele.width, this.ele.height);
    }

    setImageData(data) {
        this.context.putImageData(data, 0, 0);
    }
}

module.exports = { Canvas };