const { library, icon } = require('@fortawesome/fontawesome-svg-core');
const { faFolderOpen, faFloppyDisk, faPlay } = require('@fortawesome/sharp-solid-svg-icons');

library.add(
    faFolderOpen,
    faFloppyDisk,
    faPlay
);

class Toolbar {
    ele = null
    buttons = new Map()

    constructor(toolbarEle) {
        this.ele = toolbarEle;
        this.ele.id = 'jungle-toolbar';

        const title = document.createElement('div');
        title.className = 'title';
        title.innerText = 'CODE JUNGLE';
        this.ele.appendChild(title);

        this.createButton('open', 'folder-open');
        this.createButton('save', 'floppy-disk');
        this.createButton('run', 'play');
    }

    createButton(name, iconName) {
        const button = document.createElement('div');
        button.classList.add('button');
        button.classList.add(name);

        const iconEle = icon({ prefix: 'fass', iconName });
        button.innerHTML = iconEle.html;

        this.ele.appendChild(button);

        this.buttons[name] = button;
    }
}

module.exports = { Toolbar };