class StatusBar {
    constructor(barEle) {
        this.ele = barEle;
        this.ele.classList.add('jungle-status-bar');
    }
}

module.exports = { StatusBar };