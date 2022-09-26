class Color {
    static transparent() {
        return new Color(0, 0, 0, 0);
    }

    constructor(red, green, blue, alpha) {
        this.red = red;
        this.green = green;
        this.blue = blue;
        this.alpha = alpha;
    }
}

module.exports = { Color };