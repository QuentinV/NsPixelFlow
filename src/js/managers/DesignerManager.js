export default class DesignerManager {
    constructor({ id, options }) {
        this.id = id;
        this.options = options;
    }

    build() {
        this.root = document.getElementById(this.id);
        this.root.innerHTML = this._html();

        const reloadBtn = document.getElementById('designerReload');
        reloadBtn.addEventListener('click', () => {
            const url = this.generateUrl();
            console.log(url)
            document.location.href = url;
        })
        const designerGenerate = document.getElementById('designerGenerate');
        designerGenerate.addEventListener('click', () => {
            const url = this.generateUrl();
            navigator.clipboard.writeText(JSON.stringify(
                url.replaceAll('192.168.1.84:8585', 'storageapi-rest:8585')
                    .replaceAll('localhost:8586', 'videosvisualizer:8586')
            ));
        });

        this.init(this.options);
        this.root.style.display = "block";
    }

    init(options) {
        this.root.querySelector('textarea').value = JSON.stringify(options, null, '  ');
    }

    save() {
        return JSON.parse(this.root.querySelector('textarea').value);
    }

    generateUrl() {
        const json = { config: JSON.stringify(this.save()) };
        const params = new URLSearchParams(json);
        return location.protocol + "//" + location.host + "/?" + params.toString();
    }

    _html() {
        return `
        <div>
            <textarea name="config"></textarea>
        </div>
        <div>
            <button id="designerReload">Reload</button><button id="designerGenerate">Copy</button>
        </div>
        `
    }
}