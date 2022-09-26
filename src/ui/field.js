const { Canvas } = require('./canvas');

class Field {
    constructor(fieldEle) {
        this.ele = fieldEle;
        this.ele.classList.add('jungle-field');

        const canvasEle = document.createElement('canvas');
        this.ele.appendChild(canvasEle);
        this.canvas = new Canvas(canvasEle);
    }
}

module.exports = { Field };