SystemConfig={
    width: 1024,
    height: 768
};

Pages = [];

clone=function(obj)
{
    var ret={};
    for (var x in obj)
    {
        switch (typeof obj[x]) {
        // case "object":
        //     ret[x] = obj[x].clone();
        //     break;
        case "function":
            break;
        default:
            ret[x] = obj[x];
            break;
        }
    }
    return ret;
};

function $(id)
{
    return document.getElementById(id);
}

function init()
{
    window.IsPlayer = location.search.indexOf("player") >= 0;

    window.focus={};
    if (localStorage["save"])
    {
        if (window.AllConfig)
            allConfig = window.AllConfig;
        else
            allConfig = JSON.parse(localStorage["save"]);
        for (var i=0;i<allConfig.length; ++i)
        {
            newPage();
            for (var id in allConfig[i].basicConfig)
            {
                if (typeof allConfig[i].basicConfig[id] !== "object")
                    continue;
                var item = newText(); 
                item.static_config = allConfig[i].basicConfig[id].static_config;
                item.config=allConfig[i].basicConfig[id].config;
                item.div.id = id;
                item.setTransform();
                if (item.static_config.type === "image")
                {
                    var newImage = new Image();
                    newImage.onload= (function(ITEM){return function(){
                        ITEM.div.style.width = ""+this.width+"px";
                        ITEM.div.style.height = ""+this.height+"px";
                    };})(item);
                    newImage.src = item.static_config.url;
                }
            }
            focus.div.frameConfig = allConfig[i].frameConfig;
            rebuildPageFrames();
        }
        focusOnPage(Pages[0]);
    }

    if (IsPlayer)
        initForPlayer();
    else
        initForDesigner();
}

function initForPlayer()
{
    $("PageControler").style.display = "none";
    $("AuthoringTool").style.display = "none";
    window.onresize=scalePage;
    window.onkeyup = player_keyup;
    $("main").addEventListener("touchstart", player_touch, false);
    setTimeout(scalePage, 0);
    setInterval(function(){
        var request = new XMLHttpRequest();
        request.open("GET", "/getData", false);
        request.send();
        data = JSON.parse(request.responseText);
        for (var i=0;i<data.length;++i)
        {
            switch(data[i])
            {
            case "next":
                player_next();
                break;
            case "pre":
                player_previous();
                break;
            }
        }
    }, 400);
}

function scalePage()
{
    var ratio = window.innerHeight / 768;
    $("main").style.webkitTransformOrigin="0px 0px";
    $("main").style.webkitTransform= "scale("+ratio + ") ";
    $("main").style.position="fixed";
    $("main").style.left = ""+ Math.floor((window.innerWidth - 1024*ratio) /2) +"px";
}


function player_next()
{
    var pageIdx = Pages.indexOf(focus.div);
    var frameIdx = focus.div.frameConfig.indexOf(focus.frame);
    if (frameIdx === focus.div.frameConfig.length -1)
    {
        if (pageIdx !== Pages.length -1)
            focusOnPage(Pages[pageIdx+1]);
    } else
    {
        focusOnPageFrame(focus.div.frameConfig[frameIdx+1]);
    }
}

function player_previous()
{
    var pageIdx = Pages.indexOf(focus.div);
    var frameIdx = focus.div.frameConfig.indexOf(focus.frame);
    if (frameIdx === 0)
    {
        if (pageIdx !== 0)
        {
            focusOnPage(Pages[pageIdx-1]);
            focusOnPageFrame(focus.div.frameConfig[focus.div.frameConfig.length-1]);
        }
    } else
    {
        focusOnPageFrame(focus.div.frameConfig[frameIdx-1]);
    }
}

function player_keyup(E)
{
    switch(E.keyCode)
    {
    case 38:
        player_pageSelect();
        break;
    case 37:
        player_previous();
        break;
    case 39:
    case 32:
        player_next();
        break;
    }
}

function player_touch(E)
{
    var x =E.touches[0].clientX;
    if (x < 1024/3)
        player_previous();
    else if (x> 1024/3*2)
        player_next();
    else
        player_pageSelect();
    return false;
}

function player_pageSelect()
{
    if ($("PageControler").style.display !== "none")
        $("PageControler").style.display = "none";
    else
        $("PageControler").style.display = "block";
}

function initForDesigner()
{
    $("Tool_NewText").onclick= newText;
    $("Tool_DeleteNode").onclick = deleteNode;
    $("Tool_NewPage").onclick= newPage;
    $("Tool_DeletePage").onclick = deletePage;
    $("Page_NewFrame").onclick= newPageFrame;
    $("Page_deleteFrame").onclick = deletePageFrame;
    $("Tool_clearAll").onclick = clearAll;
    $("Tool_viewConfig").onclick = viewConfig;

    document.body.onmousemove = CustomText.prototype.onMouseMove;

    var allProperties = document.querySelectorAll("div[id='properties']>input");
    for (var i=0; i<allProperties.length; ++i)
        allProperties[i].onchange=OnPropertyChange;

    if (!localStorage["save"])
        newPage();

    setInterval( function() {
        window.serializationResult = serialization();
        localStorage["save"] = serializationResult;
        $("text_config").value = "AllConfig = "+serializationResult;
    } , 2000);
}

function viewConfig()
{
    if ($("config").style.display !== "none")
        $("config").style.display = "none";
    else
        $("config").style.display = "block";
    $("text_config").select();
}

function clearAll()
{
    if (confirm("Ar you sure to clear the presentation?"))
    {
        localStorage.clear();
        location.reload();
    }
}

function newPage()
{
    var pageDiv = document.createElement("div");
    if (IsPlayer)
        pageDiv.style.cssText ="width:1024px; height:768px; padding:0px; margin:0px;";
    else
        pageDiv.style.cssText ="width:1024px; height:768px; padding:0px; margin:0px; border-style:solid; border-width:1px; border-color:blue";
    if (focus.div)
        var focusIndex = Pages.indexOf(focus.div);
    else
        var focusIndex = -1;
    Pages.splice(focusIndex+1,0, pageDiv);

    $("main").appendChild( pageDiv);

    pageDiv.addEventListener("drop", onDrop, false);
    pageDiv.addEventListener("dragover", function(E){E.preventDefault(); return false; }, false);
    pageDiv.addEventListener("dragenter", function(E){E.preventDefault(); return false; }, false);
    rebuildPageButtons();
    pageDiv.frameConfig = [];
    focusOnPage(pageDiv);
    newPageFrame();
}

function deletePage()
{
    if (Pages.length > 1 )
    {
        var pageIdx = Pages.indexOf(focus.div);
        var pageToBeDelete = Pages.splice(pageIdx,1)[0];
        pageIdx -= pageIdx === 0?0:1;
        $("main").removeChild(pageToBeDelete);
        rebuildPageButtons();
        focusOnPage(Pages[pageIdx]);
    }
}

function newPageFrame()
{
    var newFrame = {};
    if (focus.frame)
        var focusIndex = focus.div.frameConfig.indexOf(focus.frame);
    else
        var focusIndex = -1;
    focus.div.frameConfig.splice(focusIndex+1,0, newFrame);
    rebuildPageFrames();
    focusOnPageFrame(newFrame);
}

function deletePageFrame()
{
    if (focus.div.frameConfig.length > 1 )
    {
        var frameIdx = focus.div.frameConfig.indexOf(focus.frame);
        focus.div.frameConfig.splice(frameIdx,1);
        frameIdx -= frameIdx === 0?0:1;
        rebuildPageFrames();
        focusOnPageFrame(focus.div.frameConfig[frameIdx]);
    }
}

function rebuildPageFrames()
{
    $("pageFrameButtons").innerHTML = "";
    var frameConfig = focus.div.frameConfig;
    focus.div.frameBtns = [];
    for (var i=0; i<frameConfig.length;++i)
    {
        var thePageFrameBtn = document.createElement("input");
        thePageFrameBtn.value = i+1;
        thePageFrameBtn.type="BUTTON";
        thePageFrameBtn.onclick = (function(theFrame){return function(){focusOnPageFrame(theFrame); };})(frameConfig[i]);
        $("pageFrameButtons").appendChild(thePageFrameBtn);
        focus.div.frameBtns.push(thePageFrameBtn);
    }
}

function focusOnPageFrame(theFrame)
{
    focus.frame = theFrame;
    for (var i=0; i<focus.div.frameConfig.length ;++i)
    {
        focus.div.frameBtns[i].style.backgroundColor = focus.div.frameConfig[i] === theFrame?"#fbb":"";
    }
    for (var id in theFrame)
    {
        var item = $(id);
        if (item)
        {
            var itemObj = item.obj;
            itemObj.config = clone(theFrame[id]);
            itemObj.setTransform();
            if (focus.obj === itemObj)
                itemObj.postToDiv();
        }
    }
}

function rebuildPageButtons()
{
    $("pageButtons").innerHTML = "";
    for (var i=0; i<Pages.length ;++i)
    {
        var thePageBtn = document.createElement("input");
        thePageBtn.value = i+1;
        thePageBtn.type="BUTTON";
        thePageBtn.onclick = (function(thePage){return function(){focusOnPage(thePage); };})(Pages[i]);
        $("pageButtons").appendChild(thePageBtn);
        Pages[i].theBtn = thePageBtn;
    }
}

function focusOnPage(thePage)
{
    for (var i=0; i<Pages.length ;++i)
    {
        Pages[i].style.display = Pages[i] === thePage?"block":"none";
        Pages[i].theBtn.style.backgroundColor = Pages[i] === thePage?"#fbb":"";
    }
    CustomText.prototype.releaseObjFocus();
    focus.obj = undefined;
    focus.div = thePage;
    rebuildPageFrames();
    focusOnPageFrame(thePage.frameConfig[0]);
}

function deleteNode()
{
    if (focus.obj)
    {
        focus.div.removeChild(focus.obj.div);
        focus.obj = undefined;
    }
}

function onDrop(E)
{
    // window.xE = E;
    E.preventDefault();

    if (E.dataTransfer.files.length !== 1)
        return false;

    var newImage = new Image();
    var imageurl = "imgs/"+E.dataTransfer.files[0].fileName;
    newImage.onload= function(){
        var newObj = newText();
        newObj.static_config.text="";
        newObj.static_config.type="image";
        newObj.static_config.url = imageurl;

        newObj.div.style.width = ""+this.width+"px";
        newObj.div.style.height = ""+this.height+"px";
        newObj.setTransform();

    };
    newImage.src = imageurl;

    return false;
}

function newText(E) 
{
    //create the new Div
    var newDiv = new CustomText();
    focus.div.appendChild(newDiv.div);
    return newDiv;
};

function OnPropertyChange(E)
{
    if (focus.obj)
    {
        focus.obj.getFromDiv();
    }
}

function CustomText()
{
    this.div = document.createElement("div");
    this.div.style.cssText="display:table; position:absolute; padding:1px; margin:0px; font-size:24px; border-width:1px; border-color:red;";
    this.config={
        scale : 100,
        color : "Blue",
        angle : 0,
        x:SystemConfig.width/2,
        y:SystemConfig.height/2,
        opacity:100
    };
    this.static_config={
        type:"text",
        id:generateID(),
        text:"New Text",
        align : "center"
    };
    this.div.id = this.static_config.id;

    this.setTransform();

    if (window.IsPlayer)
        this.div.style.webkitTransitionDuration="0.5s";
    else
    {
        this.div.onmousedown = (function(obj){return function(E){ obj.onMouseDown(E);};})(this);
        this.div.onmouseup = (function(obj){return function(E){ obj.onMouseUp(E);};})(this);
    }
    this.div.obj = this;

    return this;
}

CustomText.prototype = 
{
    onMouseDown:function(E)
    {
        this.MousePos = {x:E.pageX - focus.div.offsetLeft, y:E.pageY - focus.div.offsetTop};
        this.Drag = true;
        this.releaseObjFocus();
        focus.obj = this;
        focus.obj.div.style.padding = "0px";
        focus.obj.div.style.borderStyle = "solid";
        this.postToDiv();
    },
    onMouseUp:function(E)
    {
        this.onMouseDown(E);
        this.Drag = false;
    },
    onMouseMove:function(E)
    {
        if (focus.obj && focus.obj.Drag) {
            var newMousePos = {x:E.pageX - focus.div.offsetLeft, y:E.pageY - focus.div.offsetTop};
            focus.obj.config.x += newMousePos.x - focus.obj.MousePos.x;
            focus.obj.config.y += newMousePos.y - focus.obj.MousePos.y;
            focus.obj.MousePos = newMousePos;
            focus.obj.setTransform();
            focus.obj.postToDiv();
        }
    },
    releaseObjFocus:function()
    {
        if (focus.obj)
        {
            focus.obj.div.style.padding = "1px";
            focus.obj.div.style.borderStyle = "";
            focus.obj = undefined;
        }
    },
    setTransform: function()
    {
        var divTransfrom = "";
        if (this.static_config.align === "left" )
            divTransfrom +="translate( 0%, 0%) ";
        else if (this.static_config.align === "right")
            divTransfrom +="translate( -100%, 0%) ";
        else
            divTransfrom +="translate( -50%, 0%) ";
        divTransfrom += "scale("+(this.config.scale/100) + ") ";
        divTransfrom += "rotate("+this.config.angle+"deg) ";

        if (IsPlayer)
        {
            this.div.style.left = ""+( this.config.x)+"px";
            this.div.style.top = ""+( this.config.y)+"px";
        } else
        {
            this.div.style.left = ""+(focus.div.clientLeft +focus.div.offsetLeft + this.config.x)+"px";
            this.div.style.top = ""+(focus.div.clientTop +focus.div.offsetTop + this.config.y)+"px";
        }

        this.div.style.color = this.config.color;
        this.div.style.opacity = this.config.opacity/100;

        this.div.style.webkitTransform=divTransfrom;

        switch (this.static_config.type)
        {
        case "text":
            this.div.innerText = this.static_config.text;
            break;
        case "image":
            this.div.innerText = "";
            this.div.style.background = "url('" + this.static_config.url + "') top left no-repeat";
            break;
        }

        focus.frame[this.static_config.id] = clone(this.config);
        // window.serializationResult = serialization();
        // localStorage["save"] = serializationResult;

    },
    postToDiv:function()
    {
        $("Prop_text").value = this.static_config.text;
        $("Prop_text_scale").value = this.config.scale;
        $("Prop_range_scale").value = this.config.scale;
        $("Prop_color").value = this.config.color;
        $("Prop_text_angle").value = this.config.angle;
        $("Prop_range_angle").value = this.config.angle;
        $("Prop_radio_align_left").checked = this.static_config.align === "left";
        $("Prop_radio_align_center").checked = this.static_config.align === "center";
        $("Prop_radio_align_right").checked = this.static_config.align === "right";
        $("Prop_text_X").value = this.config.x;
        $("Prop_text_Y").value = this.config.y;
        $("Prop_text_opacity").value = this.config.opacity;
        $("Prop_range_opacity").value = this.config.opacity;
    },
    getFromDiv:function()
    {
        this.static_config.text = $("Prop_text").value;
        this.config.scale = parseInt( $("Prop_range_scale").value, 10);
        this.config.color = $("Prop_color").value;
        this.config.angle = parseInt( $("Prop_range_angle").value, 10);
        this.static_config.align = $("Prop_radio_align_left").checked ? "left":($("Prop_radio_align_right").checked?"right":"center");
        this.config.x = parseInt( $("Prop_text_X").value, 10);
        this.config.y = parseInt( $("Prop_text_Y").value, 10);
        this.config.opacity = parseInt( $("Prop_range_opacity").value, 10);
        this.setTransform();
        this.postToDiv();
    }
};


function generateID()
{
    var idCode="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    var ret="";
    for (var i=0;i<20;++i)
        ret+=idCode[Math.floor(Math.random()*idCode.length)];
    return ret;
}

function serialization()
{
    var configs=[];
    for (var i=0; i<Pages.length;++i)
    {
        var pageConfig={};
        pageConfig.basicConfig={};
        for (var j=0; j<Pages[i].childNodes.length;++j)
        {
            var item = Pages[i].childNodes[j];
            pageConfig.basicConfig[item.obj.static_config.id]={
                static_config: item.obj.static_config };
            for (var k=0;k<Pages[i].frameConfig.length;++k)
            {
                if (Pages[i].frameConfig[k][item.obj.static_config.id])
                {
                    pageConfig.basicConfig[item.obj.static_config.id].config = Pages[i].frameConfig[k][item.obj.static_config.id];
                    break;
                }
            }
        }
        pageConfig.frameConfig= Pages[i].frameConfig;
        configs.push(pageConfig);
    }
    return JSON.stringify(configs);
}



window.onload=init;
