const { Color } = require('./color');

class Entity {
    constructor(position) {
        this.position = position;
        this.color = Color.transparent();
    }
}

module.exports = { Entity };