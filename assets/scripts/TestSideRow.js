const TestTile = require('TestTile');
const Direction = require('Direction');

cc.Class({
    extends: cc.Component,

    properties: {
        test: false,
        direction: {
            type: Direction,
            default: 0
        },
        tileTexture: cc.SpriteFrame,
        tileCount: 0,
        tileText: cc.SpriteFrame,
        textPos: cc.Vec2,
        textRotation: 0,
        textSkew: cc.Vec2,
        // skewStepSign: 0,
        textScale: cc.Vec2,
        // textScaleStep: 1,
        tileStep: cc.Vec2,
        tilePrefab: cc.Prefab
        // rowOffset: cc.p(0, 0), // new row position add to this vec
        // rowScaleStep: 1,
    },

    onLoad () {
        if (this.test) {
            this.initRow();
        }
    },

    initRow () {
        let tileCount = this.tileCount;
        let curPos = cc.p(0, 0);
        for (let i = 0; i < tileCount; ++i) {
            let tileN = cc.instantiate(this.tilePrefab);
            let tile = tileN.getComponent('TestTile');
            this.node.addChild(tileN);
            tileN.position = curPos;
            let zStep = this.getZStep(i, tileCount);
            tileN.setLocalZOrder(zStep);
            tile.init(this.tileTexture, this.tileText, {
                scale: this.textScale,
                skew: this.textSkew,
                position: this.textPos,
                rotation: this.textRotation
            });
            curPos = cc.pAdd(curPos, this.tileStep);            
        }
    },

    getZStep (index, total) {
        let zStep = 0;
        if (this.direction === Direction.Bottom || this.direction === Direction.Top) {
            zStep = index <= total / 2 ? index : -index;
        } else if (this.direction === Direction.Left) {
            zStep = index;
        } else {
            zStep = -index;
        }
        return zStep;
    }
});