class Canvas {
    constructor(canvasEle) {
        this.ele = canvasEle;
        this.ele.classList.add('jungle-canvas');
        this.parentEle = this.ele.parentNode;

        this.context = this.ele.getContext('2d');

        window.addEventListener('resize', () => {
            this.resize();
        }, false);
    }

    resize(width, height) {
        width = width || this.parentEle.clientWidth;
        height = height || this.parentEle.clientHeight;
        this.ele.setAttribute('width', width);
        this.ele.setAttribute('height', height);
        this.context.width = width;
        this.context.height = height;
    }

    clear() {
        this.context.clearRect(0, 0, this.ele.width, this.ele.height);
    }

    printText(text) {
        // split the text
        let lines = []
        let buf = '';
        for (const char of text) {
            if (char === '\n') {
                if (buf.length > 0) {
                    lines.push(buf);
                    buf = '';
                }
            } else {
                buf += char;
                if (buf.length === 200) {
                    lines.push(buf);
                    buf = '';
                }
            }
        }
        lines.push(buf);

        if (lines.length > 200) {
            lines = lines.slice(0, 201);
        }

        this.resize(4060, 30 * lines.length + 60);

        const x = 30;
        let y = 30;
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