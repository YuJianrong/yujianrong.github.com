//
// Copyright 2010 Yu Jianrong, All Rights Reserved
// 
// Licensed under BSD License.


// add the scale checkbox
(function()
{
    if (!window.iPadExtensionEnable)
    {
        iPadExtensionEnable = true;
        var scale_span = document.createElement("span");
        scale_span.innerHTML = " <b>Scale to:</b><select id='ScaleRatio'></select>";
        var Element_SignOut=document.getElementById("sign-out");
        Element_SignOut.parentNode.insertBefore(scale_span, Element_SignOut.nextSibling);
        var Select_ScaleRatio = document.getElementById("ScaleRatio");
        for(i=0; i<=10; ++i)
        {
            var newoption=document.createElement("option");
            newoption.innerHTML=(100+i*10)+"%";
            newoption.value=1+i/10;
            Select_ScaleRatio.add(newoption,null);
        }
        Select_ScaleRatio.onchange = function()
        {
            localStorage.removeItem("iPadGoogleReaderScale");
            localStorage.setItem("iPadGoogleReaderScale", String(Select_ScaleRatio.value));
            document.getElementsByTagName("meta")[0].content="width=320,initial-scale="+Select_ScaleRatio.value+",maximum-scale="+Select_ScaleRatio.value+",user-scalable=0";
            alert("The page had been scaled to "+(Math.round(Select_ScaleRatio.value*10)*10)+"%, you may need rotate your device to make the page refresh!");
            setTimeout(function(){
                document.body.style.width="100%";
                setTimeout(function(){
                    document.body.style.display="none";
                    setTimeout(function(){
                        document.body.style.display="inline";
                    },0);
                },0);
            },0);
        };
        // load the old value, set to default if failed.
        var oldScale = localStorage.getItem("iPadGoogleReaderScale");
        if (oldScale)
            oldScale = parseFloat(oldScale);
        else
            oldScale = 1+2/10;
    
        Select_ScaleRatio.value = oldScale;
        Select_ScaleRatio.onchange();
    }

    // search for youku/tudou
    var EmbedElements = document.getElementsByTagName("embed");
    for (var i=0;i< EmbedElements.length; ++i)
    {
        var EmbedNode = EmbedElements[i];
        
        // check for youku
        var MovieID = (/^http:\/\/player.youku.com\/player.php\/sid\/(.*)\/v.swf/).exec(EmbedNode.src);
        
        if (MovieID)
        {
            // insert a link to youku
            EmbedNode.insertAdjacentHTML("afterEnd", "<a target='_blank' href='http:\/\/v.youku.com\/v_show\/id_"+ MovieID[1]+".html'> Open movie in new tab </a>");
            // remove the node
            EmbedNode.parentElement.removeChild(EmbedNode);
        } 
        
        // tudou, failed
    }

})();
