export default class TitleManager {
    constructor({ text, position, background, smallCaps, fontSize }) {
        this.text = text;
        this.background = background;
        this.position = position;
        this.smallCaps = smallCaps;
        this.fontSize = fontSize;
        this.build();
    }

    build() {
        const content = document.getElementById('content');
        this.element = document.createElement('div');
        this.element.textContent = this.text;
        this.element.className = `title title-${this.position} ${this.background ? 'title-background' : ''} ${this.smallCaps ? 'title-small-caps' : ''}`;
        this.element.style.fontSize = this.fontSize ? this.fontSize : '16px';
        content.append(this.element);
    }

    show() {
        this.element.style.display = "flex";
    }

    hide() {
        this.element.style.display = "none";
    }

    visibleAfter(time, callback) {
        setTimeout(() => {
            this.show();
            callback?.()
        }, time);
    }

    hideAfter(time, callback) {
        setTimeout(() => {
            this.hide();
            callback?.()
        }, time);
    }
}