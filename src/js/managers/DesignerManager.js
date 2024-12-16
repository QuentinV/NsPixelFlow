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
            navigator.clipboard.writeText(this.generateUrl(true));
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

    generateUrl(prod) {
        const json = { config: JSON.stringify(this.save()) };
        if ( prod ) {
            json.config = json.config.replaceAll('192.168.1.84:8585', 'storageapi-rest:8585');
        }
        const params = new URLSearchParams(json);
        return location.protocol + "//" + (prod ? 'videosvisualizer:8586' : location.host )  + "/?" + params.toString();
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