var math = cc.math;
var perspectiveActivated = false;
var viewAngle = 90;

function BeforeVisitCmd (degree) {
    this._needDraw = true;
    this._degree = degree;
    this.rendering = function () {
        perspectiveActivated = true;
        viewAngle = this._degree;
    };
}

function AfterVisitCmd () {
    this._needDraw = true;
    this.rendering = function () {
        perspectiveActivated = false;
        viewAngle = 90;
    };
}

function visitPolyfill (parent) {
    cc.renderer.pushRenderCommand(this._beforeVisitCmd);
    _ccsg.Node.prototype.visit.call(this);
    cc.renderer.pushRenderCommand(this._afterVisitCmd);
}

function polyfillRenderCmd (RenderCmd) {
    var proto = RenderCmd.prototype;
    if (!proto.originUploadData) {
        proto.originUploadData = proto.uploadData;
    }
    proto.uploadData = function (f32buffer, ui32buffer, vertexDataOffset) {
        var len = this.originUploadData(f32buffer, ui32buffer, vertexDataOffset);
        if (perspectiveActivated) {
            var offset = vertexDataOffset, y;
            for (var i = 0; i < len; i++) {
                y = f32buffer[offset + 1];
                f32buffer[offset + 2] = -y / Math.tan(viewAngle * Math.PI/180);
                offset += 6;
            }
        }
        return len;
    };
}

function labelTransformPolyfill (parentCmd, recursive) {
    this.originTransform(parentCmd, recursive);

    var node = this._node,
        lx = 0, rx = this._labelCanvas.width,
        by = 0, ty = this._labelCanvas.height,
        wt = this._worldTransform;

    var vert = this._vertices;
    vert[0].x = lx * wt.a + ty * wt.c + wt.tx; // tl
    vert[0].y = lx * wt.b + ty * wt.d + wt.ty;
    vert[1].x = lx * wt.a + by * wt.c + wt.tx; // bl
    vert[1].y = lx * wt.b + by * wt.d + wt.ty;
    vert[2].x = rx * wt.a + ty * wt.c + wt.tx; // tr
    vert[2].y = rx * wt.b + ty * wt.d + wt.ty;
    vert[3].x = rx * wt.a + by * wt.c + wt.tx; // br
    vert[3].y = rx * wt.b + by * wt.d + wt.ty;

    if (!node._string || (node._labelType !== _ccsg.Label.Type.TTF &&
       node._labelType !== _ccsg.Label.Type.SystemFont)) {
        // No culling for bmfont
        return;
    }
    // Removed culling logic
}

function spriteRebuildQuadsPolyfill () {
    if (!this._spriteFrame || !this._spriteFrame._textureLoaded) {
        this._renderCmd._needDraw = false;
        return;
    }
    this._originRebuildQuads();
    // Avoid culling
    if (!this._renderCmd._needDraw) {
        this._renderCmd._needDraw = true;
    }
}

function removeCulling () {
    _ccsg.Label.WebGLRenderCmd.prototype.transform = labelTransformPolyfill;
    if (!cc.Scale9Sprite.prototype._originRebuildQuads) {
        cc.Scale9Sprite.prototype._originRebuildQuads = cc.Scale9Sprite.prototype._rebuildQuads;
    }
    cc.Scale9Sprite.prototype._rebuildQuads = spriteRebuildQuadsPolyfill;
}

var PerspectiveController = cc.Class({
    extends: cc.Component,
    
    editor: {
        executeInEditMode: true
    },

    statics: {
        globalInited: false
    },

    properties: {
        preview: {
            default: true,
            editorOnly: true,
            notify: CC_EDITOR && function () {
                if (this.preview) {
                    this.activate();
                }
                else {
                    this.desactivate();
                }
                cc.renderer.childrenOrderDirty = true;
                cc.engine.repaintInEditMode();
            },
            animatable: false
        },

        _angle: 90,
        angle: {
            get: function () {
                return this._angle;
            },
            set: function (value) {
                this._angle = value;
                this.node._sgNode._beforeVisitCmd._degree = this._angle;
                cc.engine.repaintInEditMode();
            },
            range: [0, 90]
        },
    },

    // use this for initialization
    onLoad () {
        if (cc._renderType === cc.game.RENDER_TYPE_WEBGL) {
            if (!PerspectiveController.globalInited) {
                // Setup projection
                // cc.director.setDelegate(this);
                cc.director.setProjection(cc.Director.PROJECTION_3D);

                removeCulling();

                polyfillRenderCmd(cc.Scale9Sprite.WebGLRenderCmd);
                polyfillRenderCmd(_ccsg.Sprite.WebGLRenderCmd);
                polyfillRenderCmd(_ccsg.Label.WebGLRenderCmd);
                PerspectiveController.globalInited = true;
            }

            this.node._sgNode._beforeVisitCmd = new BeforeVisitCmd(this.angle);
            this.node._sgNode._afterVisitCmd = new AfterVisitCmd();
            if (this.preview) {
                this.activate();
            }
        }
    },

    activate () {
        this.node._sgNode.visit = visitPolyfill;
    },

    desactivate () {
        this.node._sgNode.visit = _ccsg.Node.prototype.visit;
    }
});

module.exports = PerspectiveController;
