
var Config={
    Width :400,
    Height:400,
    Range:{X:{Min:-10, Max:10}, Y:{Min:-10, Max:10}},
    MaxSplit:10
};

function $(id)
{
    return document.getElementById(id);
}

function ApplySetting()
{
    Config.Width= parseInt(CanvasWidth.value );
    Config.Height= parseInt(CanvasHeight.value );
    Config.Range.X.Min= parseFloat(XMin.value ,10);
    Config.Range.Y.Min= parseFloat(YMin.value ,10);
    Config.Range.X.Max= parseFloat(XMax.value ,10);
    Config.Range.Y.Max= parseFloat(YMax.value ,10);

    MainCanvas.width = Config.Width;
    MainCanvas.height= Config.Height;
    MainData=[];
    for (var y=0;y<Config.Height+1;++y)
    {
        MainData.push([]);
    }
    MainData[-1]=[];
}

function Plot()
{

    Config.MaxSplit = parseInt( MaxSplit.value, 10);
    // reset the DataArray
    for (var y=0;y<Config.Height;++y)
    {
        for(var x=0;x<Config.Width;++x)
        {
            MainData[y][x] = false;
        }
    }
    var FunctonStr = InputFunction.value;
    // FunctonStr = FunctonStr.toLowerCase();
    FunctonStr = FunctonStr.replace( (/E|LN2|LN10|LOG2E|LOG10E|PI|SQRT1_2|SQRT2|abs|acos|asin|atan|atan2|ceil|cos|exp|floor|log|max|min|pow|round|sin|sqrt|tan/g),function(x){return "Math."+x;})
    var Delta={X:(Config.Range.X.Max - Config.Range.X.Min)/Config.Width,
        Y:(Config.Range.Y.Max - Config.Range.Y.Min)/Config.Height};
    if (FunctonStr.indexOf("=") !== -1)
    {
        var matchs = FunctonStr.match(/(.*?)={1,}(.*)/);
        FunctonStr ="("+ matchs[1] + ")-(" + matchs[2]+")";
        eval("var func_equ=function(x,y, dx, dy){ var oldx=x;var t1 = "+FunctonStr+
            "; x+=dx;  t2 = " + FunctonStr+
            "; y+=dy;  t3 = " + FunctonStr+
            "; x=oldx;  t4 = " + FunctonStr+
            "; return t1*t2<=0 || t1*t3<=0 || t1*t4<=0 ;};");
    } else
    {
        eval("var func_equ=function(x,y){ return "+ FunctonStr + "; };");
    }

    var Y = Config.Range.Y.Max;
    var y=0;
    var lasty =0;
    var max_y =0;

    var split = 1;
    var DX = Delta.X/split, DY = Delta.Y/split;

    var pass = 1;


    intervalID = setInterval(function(){
            if (y<Config.Height)
            {
                var X = Config.Range.X.Min;
                var lineModified = false;
                for (var x=0; x<Config.Width; ++x, X+=Delta.X)
                {
                    if (MainData[y][x])
                        continue;
                    if (y <= max_y
                        && !MainData[y][x+1]
                        && !MainData[y][x-1]
                        && !MainData[y+1][x+1]
                        && !MainData[y+1][x]
                        && !MainData[y+1][x-1]
                        && !MainData[y-1][x+1]
                        && !MainData[y-1][x]
                        && !MainData[y-1][x-1]
                    ) continue;

                    Y2 = Y;
                    CellLoop:
                    for (var idx=0;idx<split;idx++, Y2+=DY)
                    {
                        X2 = X;
                        for (var idy=0;idy<split;idy++, X2+=DX)
                        {
                            if (func_equ(X2, Y2, DX, DY))
                            {
                                MainCtx.fillRect(x,y,1,1);
                                MainData[y][x] = true;
                                lineModified = true;
                                break CellLoop;
                            }
                        }
                    }
                }

                if (y>max_y) max_y = y;

                if (!lineModified)
                {
                    
                    lasty = y;

                    Y -= Delta.Y;
                    y++;
                    if (y>max_y)
                    {
                        split=Math.floor(split/2);
                        // split--;
                        if (split<1) split=1;
                    }
                } else
                {
                    if (lasty < y)
                    {
                        split*=2;
                        // split++;
                        if (split>Config.MaxSplit) split = Config.MaxSplit;
                    }
                    lasty = y;

                    if (y!== 0)
                    {
                        y--;
                        Y+=Delta.Y
                    }
                }
                DX = Delta.X/split, DY = Delta.Y/split;
            } else
            {
                Stop();
            }
        }, 0);
    BtnSet.disabled = true; 
    BtnPlot.disabled = true; 
    BtnStop.style.display="inline";
}

function Stop()
{
    clearInterval(intervalID);
    BtnSet.disabled = false; 
    BtnPlot.disabled = false; 
    BtnStop.style.display="none";
}

function init()
{
    MainCanvas = $("Main")
    MainCtx = MainCanvas.getContext("2d");
    CanvasWidth = $("CanvasWidth");
    CanvasHeight = $("CanvasHeight");
    XMin = $("XMin");
    XMax = $("XMax");
    YMin = $("YMin");
    YMax = $("YMax");
    MaxSplit = $("MaxSplit");

    InputFunction = $("InputFunction");
    BtnSet = $("BtnSet");
    BtnPlot = $("BtnPlot");
    BtnStop = $("BtnStop");

    CanvasWidth.value = Config.Width;
    CanvasHeight.value = Config.Height;
    XMin.value = Config.Range.X.Min;
    YMin.value = Config.Range.Y.Min;
    XMax.value = Config.Range.X.Max;
    YMax.value = Config.Range.Y.Max;
    MaxSplit.value = Config.MaxSplit;

    BtnSet.addEventListener("click", ApplySetting ,false);
    BtnPlot.addEventListener("click", Plot ,false);
    BtnStop.addEventListener("click", Stop ,false);

    ApplySetting();
}

window.onload=init;
