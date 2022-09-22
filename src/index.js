require('../styles/styles.scss')
const { Jungle } = require('./jungle');

window.addEventListener('load', () => {
    console.log('ready');
    const jungle = new Jungle();
    jungle.init();
});