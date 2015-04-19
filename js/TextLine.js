/**
 * Created by naeioi on 2015/4/3.
 */
/*
 TextLine
 TextLine由Bitmap继承而来
 TextLine保存一行文字的信息

 Property
 Text    @type string
 文字。
 image   @type Bitmap
 图片格式的文字
 dir     @type integer
 文字方向。0横1竖
 letterSpacing   @type integer
 文字间距。
 fontSize    @type integer
 文字大小。
 fontFamily  @type String
 字体。
 color   @type string
 颜色。
 */
define(['createjs'], function(createjs) {

    /*console.log('messsage frome TextLine: ');
    console.log(createjs);*/

    function TextLine(text, dir, space, size, family, color) {
        this.Bitmap_constructor();

        this.text = text || "";
        this.dir = dir || 0;
        this.image = null;
        this.letterSpacing = space || 0;
        this.fontSize = size || 12;
        this.fontFamily = family || "";     //需要选择默认字体
        this.color = color || '#000000';
        this.name = 'TextLine';
        this.cursor = "text";
    }

    var p = createjs.extend(TextLine, createjs.Bitmap);

    p.trimPic = function(img, dir)
    {
        dir = dir || 0;

        var _can = document.createElement('canvas');
        var ctx = _can.getContext('2d');
        var _w = img.width, _h = img.height;
        var bitmap;

        _can.width = _w;
        _can.height = _h;

        ctx.drawImage(img, 0, 0);

        bitmap = ctx.getImageData(0, 0, _can.width, _can.height);

        function pos(x, y)
        {
            return (y*_w + x)*4 + 3;    //retrieve alpha channel
        }

        if(dir == 0){
            for(var x = _w-1; x >= 0; x--){
                var flag = false;
                for(var y = 0; y < _h; y++)
                    if(bitmap.data[pos(x,y)] != 0)
                    {
                        flag = true;
                        break;
                    }
                if(flag)
                {
                    _can.width = x+2;
                    ctx.drawImage(img, 0, 0, x+2, _h, 0, 0, x+2, _h);
                    img.src = _can.toDataURL('image/png');
                    break;
                }
            }
        }
        // else if(dir == 1){
        for(var y = _h-1; y >= 0; y--){
            var flag = false;
            for(x = 0; x < _w; x++)
                if(bitmap.data[pos(x,y)] != 0)
                {
                    flag = true;
                    break;
                }
            if(flag)
            {
                _can.height = y+2;
                ctx.drawImage(img, 0, 0, _w, y+2, 0, 0, _w, y+2);
                img.src = _can.toDataURL('image/png');
                return;
            }
        }
        //}
    }


    p.imageLoader = function(t)
    {
        var def = $.Deferred();
        //def.resolve();

        var onsucess = function(data){

            /*debug
             var img_e = document.getElementById('img');
             img_e.src = data;
             */

            //here we assign base64 to img.src, so it is not necessary to treat it in async way
            var img = document.createElement('img');
            img.src = data;

            p.trimPic(img);

            //document.getElementById('test_img').src = img.src;

            def.resolve(img);
        }

        //console.log('text=' + encodeURI(t.text));

        $.ajax({
            url: 'pcs.1.1.php?'
            +'text=' + t.text
            +'&dir=' + t.dir
            +'&space=' + t.letterSpacing
            +'&font=' + t.fontFamily
            +'&size=' + t.fontSize
            +'&color=' + t.color,
            success: onsucess
        })

        return def.promise();
    }

    p.load = function(text)
    {
        text = text || this.text;
        var self = this;
        this.text = text;

        //console.log("in testLine.load: text = " + text);

        var d = $.Deferred();
        var def = p.imageLoader(this);

        def.then(function(data){
            //console.log("in testLine.load: received data from imageLoader");
            self.image = data;

            //set HitArea so that a click on white space between letter will be captured
            var shape = new createjs.Shape();
            shape.graphics.beginFill("#000000").drawRect(0, 0, data.width, data.height);
            self.hitArea = shape;

            d.resolve(self);
        });

        return d.promise();
    }

    createjs.TextLine = TextLine;
    return createjs.promote(TextLine, "Bitmap");
});