const TestTile = require('TestTile');
const Direction = require('Direction');

const Peng = cc.Class({
    name: 'Peng',

    properties: {
        tileTextures: [cc.SpriteFrame],
        tileText: cc.SpriteFrame,
        textPos: cc.Vec2,
        textStartSkew: cc.Vec2,
        skewStep: cc.Vec2,
        textScale: cc.Vec2,
        textScaleStep: 1,
        tileStep: cc.Vec2,
    }
});

cc.Class({
    extends: cc.Component,

    properties: {
        test: false,
        direction: {
            type: Direction,
            default: 0
        },
        stacks: [Peng],
        textRotation: 0,
        zStep: 0,
        gap: cc.Vec2,
        tilePrefab: cc.Prefab
    },

    onLoad () {
        this.curPos = cc.p(0, 0);
        if (this.test) {
            this.initPeng();
        }
    },

    initPeng () {
        for (let i = 0; i < this.stacks.length; ++i) {
            this.initStack(i);
        }
    },

    initStack (index) {
        let stack = this.stacks[index];
        let tileCount = stack.tileTextures.length;
        for (let i = 0; i < tileCount; ++i) {
            let tileN = cc.instantiate(this.tilePrefab);
            let tile = tileN.getComponent('TestTile');
            this.node.addChild(tileN);
            tileN.position = this.curPos;
            tileN.setLocalZOrder(this.zStep * (i + index * tileCount));
            let curSkew = cc.pAdd(stack.textStartSkew, cc.pMult(stack.skewStep, i));
            tile.init(stack.tileTextures[i], stack.tileText, {
                scale: cc.pMult(stack.textScale, Math.pow(stack.textScaleStep, i)),
                skew: curSkew,
                position: cc.pMult(stack.textPos, Math.pow(stack.textScaleStep, i)),
                rotation: this.textRotation
            });
            this.curPos = cc.pAdd(this.curPos, cc.pMult(stack.tileStep, Math.pow(stack.textScaleStep, i)));            
        }
        this.curPos = cc.pAdd(this.curPos, this.gap);
    }
});