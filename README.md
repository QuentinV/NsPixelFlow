# Config structure

```typescript
{
    startBtn: boolean, // whether or not to display a button to start the song. Required by broswer to have a user action.
    texts: [
        { 
          text: string; 
          background?: boolean;
          smallCaps?: boolean;
          startTimer?: number;
          endTimer?: number; 
          event?: 'songEnded';
          position?: 'center' | 'top'; // default top
        }
    ],
    songDelay: number, // delay loading of song (milliseconds)
    songUrl: string, // url of song to be loaded and analize for frequency and beat
    backgroundImage: string, // url of background image
    backgroundColor: string, // background color
    glitch: boolean,
    glitchPortrait: boolean,
    cornersPulse: boolean,
    resize: boolean, // auto resize when screen (viewport) change

    maxFreqValue: number, // frequency update max for variation change

    views: [
        {
            id: string,

            shape: string, // either "*cynlinder*" or "*box*" or "*random*" "*drawing*"
            imagesSyncUrl: string, // url of json files that includes `{ start, url }[]` where url is json drawing
            imageUrl: string,

            fadeOutTimer: number,

            effect: string, // border, explosion, matrix, morphing, tornado, vortex
            effectDuration: number,
            animator: string, // drawing, attraction
            text: string,

            increaseDetails: number, // multiplier to increase points count

            startColor: string, // start color of shape lines
            endColor: string, // end color of shape lines
            color: 'autoFull' | 'autoSingle' | 'fixed',

            autoMix: boolean, // auto mix *(default: true)*
            autoRotate: boolean, // auto rotate *(default: true)*
            autoNext: boolean,
            keepRotate: boolean, // keep rotate - repeat from start when duration ends

            rotateDuration: number, // rotate duration (slower or faster) in seconds. Default is 3.
            rotateYoyo: number, // rotate yoyo efect. Include repeat infinite.

            w: string, // fixed width (replace wMin & wMax)
            wMin: string,
            wMax: string,
            h: string, // fixed height (replace hMin & hMax)
            hMin: string,
            hMax: string,
            d: string, // fixed depth (replace dMin & dMax)
            dMin: string, // min depth
            dMax: string, // max depth
            radial: number, // (replace rMin & rMax)
            radialMin: number, // min radial
            radialMax: number, // max radial
            posZ: number, // set zoom. If undefined use default

            viewWidth: string,
            viewHeight: string
        },
        {
            waitUntil: string, // id of view
        }
    ]
}
```


### Examples

#### Tiktok

```json
{
  "startBtn": true,
  "texts": [
    {
      "text": "Bettle juice 2!",
      "endTimer": 1500,
      "background": true,
      "smallCaps": true
    },
    {
      "text": "Write in comments your what you think the drawing is !",
      "startTimer": 4000,
      "position": "center"
    },
    {
      "text": "Listen to the full music on youtube! ",
      "background": true,
      "startTimer": 76500
    }
  ],
  "songUrl": "http://192.168.1.84:8585/storage/123/song.mp3",
  "glitch": true,
  "glitchPortrait": true,
  "cornersPulse": true,
  "resize": true,
  "views": [
    {
      "id": "draw",
      "shape": "drawing",
      "imageUrl": "http://192.168.1.84:8585/storage/randompictures/99.json",
      "autoMix": false,
      "autoRotate": false,
      "autoNext": false,
      "posZ": 3,
      "effect": "border",
      "effectDuration": 75000,
      "animator": "drawing",
      "animatorMode": "timeline",
      "viewHeight": "50%",
      "startColor": "yellow"
    },
    {
      "id": "box",
      "shape": "box",
      "autoMix": true,
      "autoRotate": true,
      "autoNext": false,
      "keepRotate": true,
      "viewHeight": "50%",
      "posZ": 10.2
    }
  ]
}
```