cc.Class({
    extends: cc.Component,

    properties: {
        useRepeatTile: false,
        rowPrefab: cc.Prefab,
        rowCount: 0,
        rowScaleStep: 1,
        rowPositionStep:cc.Vec2,
        skewStep: cc.Vec2,
        zStep: 0
    },

    onLoad () {
        this.rows = [];
        this.initLayout();
    },

    initLayout () {
        let curPos = cc.p(0, 0);
        for (let i = 0; i < this.rowCount; ++i) {
            let rowN = cc.instantiate(this.rowPrefab);
            this.node.addChild(rowN);
            //next row could be bigger or smaller
            rowN.scale = Math.pow(this.rowScaleStep, i);
            rowN.position = cc.pMult(this.rowPositionStep, i);
            rowN.setLocalZOrder(this.zStep * i);            
            //for side layout, adjust row skew for perspective
            rowN.skewX = this.skewStep.x * i;
            rowN.skewY = this.skewStep.y * i;
            let rowCompName = this.useRepeatTile ? 'TestSideRow' : 'TestRow';
            let row = rowN.getComponent(rowCompName);
            row.initRow();
            this.rows.push(row);
            curPos = cc.pAdd(curPos, this.rowPositionStep * rowN.scale);
        }
    }
});