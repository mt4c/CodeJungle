const { Color } = require('./color');

class Entity {
    constructor() {
        this.color = Color.transparent();
    }
}

module.exports = { Entity };