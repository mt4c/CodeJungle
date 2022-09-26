const { Entity } = require('./entity');

class Wall extends Entity {
    constructor(color) {
        super();

        this.color = color;
    }
}

module.exports = { Wall };