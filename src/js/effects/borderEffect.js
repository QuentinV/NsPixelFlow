export class BorderEffect {
    constructor({ width, height }) {
        this.width = width;
        this.height = height;
    }

    getType() {
        return 'preload';
    }

    init() {
        const borders = this._createBorder(this.width, this.height);
    }

    _createBorder(width, height) {
        return [
            [...[...Array(width)].map((v, i ) => ({x: i, y: -height})), { x: width, y: -height-1 }],
            [...[...Array(width)].map((v, i ) => ({x: -i, y: -height})), { x: -width, y: -height-1 }],        
            [...[...Array(width)].map((v, i ) => ({x: i, y: height})), { x: width, y: height-1 }],
            [...[...Array(width)].map((v, i ) => ({x: -i, y: height})), { x: -width, y: height-1 }],
            [...[...Array(height)].map((v, i ) => ({x: -width, y: i})), { x: -width-1, y: height }],
            [...[...Array(height)].map((v, i ) => ({x: -width, y: -i})), { x: -width-1, y: -height }],
            [...[...Array(height)].map((v, i ) => ({x: width, y: i})), { x: width-1, y: height }],
            [...[...Array(height)].map((v, i ) => ({x: width, y: -i})), { x: width-1, y: -height }]
        ]
    }
}