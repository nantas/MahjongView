cc.Class({
    extends: cc.Component,

    properties: {
        tileBody: cc.Sprite,
        tileText: cc.Sprite
    },

    init (tileSF, textSF, textTrans) {//{scale, skew, position}
        this.tileBody.spriteFrame = tileSF;
        this.tileText.spriteFrame = textSF;
        this.tileText.node.position = textTrans.position;
        this.tileText.node.scale = textTrans.scale;        
        this.tileText.node.rotation = textTrans.rotation;
        this.tileText.node.skewX = textTrans.skew.x;        
        this.tileText.node.skewY = textTrans.skew.y;        
    }
});
