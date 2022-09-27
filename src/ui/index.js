const { Toolbar } = require('./toolbar');
const { Field } = require('./field');
const { StatusBar } = require('./status-bar');

class UI {
    constructor(wrapperEle) {
        this.ele = wrapperEle;
        this.ele.classList.add('jungle-wrapper');

        const toolbarEle = document.createElement('div');
        this.ele.appendChild(toolbarEle);
        this.toolbar = new Toolbar(toolbarEle);

        const statusBarEle = document.createElement('div');
        this.ele.appendChild(statusBarEle);
        this.statusBar = new StatusBar(statusBarEle);

        const fieldEle = document.createElement('div');
        this.ele.appendChild(fieldEle);
        this.field = new Field(fieldEle);
        this.canvas = this.field.canvas;
    }
}

module.exports = { UI }