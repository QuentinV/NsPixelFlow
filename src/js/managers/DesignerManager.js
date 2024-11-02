export default class DesignerManager {
    constructor({ id, options }) {
        this.id = id;
        this.options = options;
    }

    build() {
        this.root = document.getElementById(this.id);
        this.root.innerHTML = this._html();

        const buttonAddShapes = document.getElementById('buttonAddShapes');
        const optShapes = document.getElementById('optShapes');
        buttonAddShapes.addEventListener('click', () => {
            const div = document.createElement('div');
            optShapes.append(div);
            div.innerHTML = this._modHtml();
        });

        const reloadBtn = document.getElementById('designerReload');
        reloadBtn.addEventListener('click', () => {
            const url = this.generateUrl();
            console.log(url)
            document.getElementById('generatedUrl').innerText = url;
        })

        if ( this.options.shape?.length ) {
            this.options.shape.forEach( s => {
                const div = document.createElement('div');
                optShapes.append(div);
                div.innerHTML = this._modHtml();
            })
        }

        this.init(this.options)
        this.root.style.display = "block";
    }

    init(options) {
        const inputs = this.root.querySelectorAll('input, select');
        const inputCounts = {};
        
        inputs.forEach(input => {
            const name = input.name;
            const value = options[name];
        
            if (value === undefined) {
                return;
            }

            if (Array.isArray(value)) {
                if (!inputCounts[name]) {
                    inputCounts[name] = 0;
                }
        
                if (inputCounts[name] < value.length) {
                    input.value = value[inputCounts[name]];
                    inputCounts[name]++;
                }
            } else {
                input.value = value;
            }
        });
    }

    save() {
        const inputs = this.root.querySelectorAll('input, select');
        const jsonObject = {};
      
        inputs.forEach(input => {
          const name = input.name;
          const value = input.value;

          if ( value === undefined || value === '' ) {
            return;
          }
      
          if (jsonObject[name] !== undefined) {
            if (!Array.isArray(jsonObject[name])) {
                jsonObject[name] = [jsonObject[name]];
            }
            jsonObject[name].push(value);
          } else {
            jsonObject[name] = value;
          }
        });

        console.log(jsonObject)
        
        return jsonObject;
    }

    generateUrl() {
        const json = this.save();
        const params = new URLSearchParams(json);
        return location.protocol + "//" + location.host + "/?" + params.toString();
    }

    _html() {
        return `
        <div>
          <label for="optStartBtn" title="Add a button because of the restriction to start audio">Start btn</label>
           <select name="startBtn" id="optStartBtn">
                <option></option>
                <option value="true">True</option>
                <option value="false">False</option>
            </select>
        </div>
        <div>
          <label for="optTitle" title="Opening title">Title</label>
          <input type="text" id="optTitle" name="title" />
        </div>
        <div>
          <label for="optTitleEnd" title="Written title at the end">Title end</label>
          <input type="text" id="optTitleEnd" name="titleEnd" />
        </div>
        <div>
          <label for="optTitleHide" title="how long title should stay default is 1000">Title hide delay</label>
          <input type="number" id="optTitleHide" name="titleHide" />
        </div>
        <div>
          <label for="optSongDelay" title="How long song should be delayed default is 0">Song delay</label>
          <input type="number" id="optSongDelay" name="songDelay" />
        </div>
        <div>
          <label for="optSongUrl">Song url</label>
          <input type="text" id="optSongUrl" name="songUrl" />
        </div>
        <div>
          <label for="optImagesSyncUrl">Images sync url</label>
          <input type="text" id="optImagesSyncUrl" name="imgsUrl" />
        </div>
        <div>
          <label for="optBackgroundImage">Background image</label>
          <input type="text" id="optBackgroundImage" name="bgImg" />
        </div>
        <div>
          <label for="optBackgroundColor">Background color</label>
          <input type="text" id="optBackgroundColor" name="bgc" />
        </div>
        <div>
          <label for="optResize" title="auto resize webgl view when browser is resize">Resize</label>
           <select name="resize" id="optResize">
                <option></option>
                <option value="true">True</option>
                <option value="false">False</option>
            </select>
        </div>
        <div>
          <label for="optMaxFreqValue">Max freq value</label>
          <input type="number" id="optMaxFreqValue" name="fMax" />
        </div>
        <div>
            <button id="buttonAddShapes">Add</button>
            <div id="optShapes">

            </div>
        </div>
        <div id="generatedUrl"></div>
        <div>
          <button id="designerReload">Reload</button>
        </div>
        `
    }

    _modHtml() {
        return `<div class="shapeOpts">
            <div>
                <label>Shape</label>
                <select name="shape">
                    <option value="random">Random</option>
                    <option value="box">Box</option>
                    <option value="cylinder">Cynlinder</option>
                    <option value="drawing">Drawing</option>
                </select>
            </div>
            <div>
                <label title="default is 1">Increase details</label>
                <input type="number" name="incd" />
            </div>
            <div>
                <label>Start color</label>
                <input type="text" name="sc" />
            </div>
            <div>
                <label>End color</label>
                <input type="text" name="ec" />
            </div>
            <div>
                <label>Auto mix</label>
                <select name="am">
                    <option></option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
            </div>
            <div>
                <label>Auto rotate</label>
                <select name="ar">
                    <option></option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
            </div>
            <div>
                <label>Auto next</label>
                <select name="an">
                    <option></option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
            </div>
            <div>
                <label>Keep rotate</label>
                <select name="kr">
                    <option></option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
            </div>
            <div>
                <label>Rotate duration</label>
                <input type="number" name="rd" />
            </div>
            <div>
                <label>Rotate yoyo</label>
                <select name="rYoyo">
                    <option></option>
                    <option value="true">True</option>
                    <option value="false">False</option>
                </select>
            </div>
            <div>
                <label>Width</label>
                <input type="number" name="w" />
            </div>
            <div>
                <label>Min width</label>
                <input type="number" name="wMin" />
            </div>
            <div>
                <label>Max width</label>
                <input type="number" name="wMax" />
            </div>
            <div>
                <label>Height</label>
                <input type="number" name="h" />
            </div>
            <div>
                <label>Min height</label>
                <input type="number" name="hMin" />
            </div>
            <div>
                <label>Max height</label>
                <input type="number" name="hMax" />
            </div>
            <div>
                <label>Depth</label>
                <input type="number" name="d" />
            </div>
            <div>
                <label>Min depth</label>
                <input type="number" name="dMin" />
            </div>
            <div>
                <label>Max depth</label>
                <input type="number" name="dMax" />
            </div>
            <div>
                <label>Radial</label>
                <input type="number" name="r" />
            </div>
            <div>
                <label>Min radial</label>
                <input type="number" name="rMin" />
            </div>
            <div>
                <label>Max radial</label>
                <input type="number" name="rMax" />
            </div>
            <div>
                <label>Zoom</label>
                <input type="number" name="z" />
            </div>
            <div>
                <label>view width</label>
                <input type="text" name="vw" />
            </div>
            <div>
                <label>view height</label>
                <input type="text" name="vh" />
            </div>
        </div>`
    }
}