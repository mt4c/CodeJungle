const { Toolbar } = require('./toolbar');
const { Field } = require('./field');

class UI {
    constructor(wrapperEle) {
        this.ele = wrapperEle;
        this.ele.id = 'jungle-wrapper';

        const toolbarEle = document.createElement('div');
        this.toolbar = new Toolbar(toolbarEle);
        this.ele.appendChild(toolbarEle);

        const fieldEle = document.createElement('div');
        this.field = new Field(fieldEle);
        this.ele.appendChild(fieldEle);
    }
}

module.exports = { UI }