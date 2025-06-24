class Canvas {
  constructor(canvasEle) {
    this.ele = canvasEle;
    this.ele.classList.add("jungle-canvas");
    this.parentEle = this.ele.parentNode;

    this.context = this.ele.getContext("2d");

    this.pos = 0;

    this.resize(1024, 768);
  }

  resize(width, height) {
    width = width || this.parentEle.clientWidth;
    height = height || this.parentEle.clientHeight;
    this.ele.setAttribute("width", width);
    this.ele.setAttribute("height", height);
    this.context.width = width;
    this.context.height = height;
  }

  clear() {
    this.context.clearRect(0, 0, this.ele.width, this.ele.height);
  }

  copyCanvas(canvas) {
    this.context.drawImage(canvas, 0, 0);
  }

  getImageData() {
    return this.context.getImageData(0, 0, this.ele.width, this.ele.height);
  }

  setImageData(data) {
    this.context.putImageData(data, 0, 0);
  }
}

module.exports = { Canvas };
