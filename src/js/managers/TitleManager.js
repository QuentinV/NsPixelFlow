export default class TitleManager {
    constructor({ text }) {
        this.text = text;
        this.build();
    }

    build() {
        const content = document.getElementById('content');
        this.element = document.createElement('div');
        this.element.textContent = this.text;
        this.element.id = "title";
        content.append(this.element);
    }

    show() {
        this.element.style.display = "flex";
    }

    hideAfter(time, callback) {
        setTimeout(() => {
            this.element.style.display = "none";
            callback?.()
        }, time);
    }
}