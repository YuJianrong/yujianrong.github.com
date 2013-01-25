
!function(){



  <!-- hwedewdfew-->
  var nonStrictEval = function(str){
    return eval(str);
  };

  var StrictEval = function(str){
    "use strict";
    return eval(str);
  };

  var $=function(id) {
    return document.getElementById(id);
  };

  var $$=function(selector) {
    return document.querySelector(selector);
  };

  var console = {
    log: function(message) {
      if (!this.__consoleDom) {
        return window.console.log(message);
      }
      this.__appendMessage(message);
    },
    info: function(message) {
      return this.log(message);
    },
    warn: function(message) {
      if (!this.__consoleDom) {
        return window.console.warn(message);
      }
      this.__appendMessage(message, "warning");
    },
    error: function(message) {
      if (!this.__consoleDom) {
        return window.console.error(message);
      }
      this.__appendMessage(message, "error");
    },
    __appendMessage: function(message, domClass) {
      var messageDom = document.createElement("xmp");
      if (domClass) {
        messageDom.className = domClass;
      }
      messageDom.appendChild(document.createTextNode(message));
      this.__consoleDom.appendChild(messageDom);
      // this.__consoleDom.appendChild(document.createElement('br'));
      this.__consoleDom.scrollTop = 1e10;
    }
  };

  var keyCode = {
    RETURN: 13,
    UP: 38,
    DOWN: 40
  };

  var evalStr = function( code, strictMode, noReturnValue) {
    try{
      var result = strictMode? StrictEval(code) : nonStrictEval(code);
    } catch(e) {
      console.error( e.toString() );
      return;
    };
    if (noReturnValue) {
      return;
    }

    var type = typeof result, strResult;

    if (type === "string") {
      strResult = '"' + result + '"';
    } else if (type !== "object") {
      strResult = '' + result;
    } else {
      try{
        strResult = JSON.stringify(result, null, "  ");
      } catch(e) {
      }
      if (strResult=== undefined || strResult.split("\n").length > 40){
        strResult = "" + result;
      }
    }
    console.info(strResult);
  };

  var history = [], currentIndex = 0;


  window.addEventListener("load", function(){
      "use strict";

      document.body.addEventListener("keydown", function(event){
          if (event.keyCode === keyCode.RETURN ) {
            if (event.target.tagName === "INPUT" 
              && [].indexOf.call(event.target.parentElement.classList, "JSConsole") !== -1) {
              // find the target
              event.preventDefault();
              console.__consoleDom = event.target.parentElement.querySelector(".output");
                var code = event.target.value;
                if (code === "") {
                  return;
                }
                event.target.history = event.target.history || [];

                event.target.history.currentIndex = event.target.history.push(code) ;
                event.target.value = "";
                evalStr(code);
            }
          } else if (event.keyCode === keyCode.UP || event.keyCode === keyCode.DOWN) {
            event.target.history = event.target.history || [];

            if (event.target.history.length === 0) {
              return;
            }
            event.target.history.currentIndex += event.keyCode === keyCode.UP ? -1 : 1;
            if (event.target.history.currentIndex < 0) {
              event.target.history.currentIndex = 0;
              return;
            } else if (event.target.history.currentIndex >= event.target.history.length) {
              event.target.history.currentIndex = event.target.history.length -1;
              return;
            }
            event.target.value = event.target.history[event.target.history.currentIndex];
            event.target.setSelectionRange(
              event.target.value.length,
              event.target.value.length
            );
            event.preventDefault();

          }
      }, false);

      // init the code editors

      [].forEach.call( document.querySelectorAll(".JSCodePad"), function(domCodePad) {
          var codeDom = domCodePad.querySelector(".code");
          var runBtn = domCodePad.querySelector(".run");
          var consoleDom = domCodePad.querySelector(".output");
          if (!codeDom || !runBtn ||!consoleDom) {
            return;
          }

          var editor = ace.edit(codeDom);
          editor.setShowFoldWidgets(false);
          editor.setTheme("ace/theme/eclipse");
          editor.getSession().setMode("ace/mode/javascript")
          editor.getSession().setTabSize(2)
          editor.getSession().setUseSoftTabs(true);
          domCodePad.editor = editor;

          runBtn.addEventListener("click", function(e) {
              console.__consoleDom = consoleDom;
              consoleDom.innerHTML="";
              var code = editor.getValue();
              evalStr(code, false, true );

          }, false);
      });

      var $testground = $("testground");

      var hideTestGround = function( hide ){
          $testground.setAttribute("class", hide ? "" : "show");
          $testground.shown = !hide;
      };

      $$("#testground>.startButton").addEventListener("click", function(e){ hideTestGround( false );}, false);

      window.addEventListener("keydown", function(e) {
          if ($testground.shown) {
            if (e.keyCode === 27) {
              hideTestGround( true);
            }
            if (!(e.target && ["INPUT","TEXTAREA"].indexOf(e.target.tagName)!== -1 )) {
              e.stopPropagation();
            }
          } else {
            if (e.keyCode === 192) {
              hideTestGround(false);
            }
          }
      }, true);

      $$(".switchToPad").addEventListener("click", function(e) {
          $$("#testground>.pad").setAttribute("data-type", "codepad");
      }, false);

      $$(".switchToConsole").addEventListener("click", function(e) {
          $$("#testground>.pad").setAttribute("data-type", "console");
      }, false);

      $$(".closeButton").addEventListener("click", function(e) {
          hideTestGround( true);
      }, false);

      // add placeholder for all the codeconsole
      [].forEach.call( document.querySelectorAll("div.JSConsole > input"), function(domInput){
          domInput.setAttribute("placeholder", "Input JavaScript code here");
      });

  }, false);

  

}();
