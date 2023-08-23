const { Entity } = require('./entity');

class Wall extends Entity {
    constructor(position, color) {
        super(position);

        this.color = color;
    }
}

module.exports = { Wall };