class Color {
  static transparent() {
    return new Color(0, 0, 0, 0);
  }

  static white() {
    return new Color(255, 255, 255, 255);
  }

  static Red() {
    return new Color(255, 0, 0, 255);
  }

  static yellow() {
    return new Color(255, 255, 0, 255);
  }

  constructor(red, green, blue, alpha) {
    this.red = red;
    this.green = green;
    this.blue = blue;
    this.alpha = alpha;
  }
}

module.exports = { Color };
