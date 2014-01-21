
var setting = {
  paths: {
    imgs: "./resources/imgs",
    music: "./resources/music"
  },
  imgs: {
    "Any.do" : "Any.do.webp",
    "SAP Anywhere" : "Anywhere.webp",
    "SAP B1" : "B1.webp",
    "百度云" : "Baidu yun.webp",
    "SAP ByDesign" : "ByDesign.webp",
    "Camera+" : "Camera+.png",
    "Clear" : "Clear.png",
    "Facebook-messenger" : "Facebook-messenger.webp",
    "Flipboard" : "Flipboard.webp",
    "Foursquare" : "Foursquare.webp",
    "Google drive" : "Google drive.webp",
    "iCloud" : "iCloud.png",
    "Instagram" : "Instagram.webp",
    "Instapaper" : "Instapaper.webp",
    "iPhone camera" : "iPhone camera.jpg",
    "来往" : "laiwang.webp",
    "Moves" : "Moves.webp",
    "Nike run+" : "Nike run.png",
    "Pandora" : "Pandora.webp",
    "Path" : "Path.webp",
    "Pinterest" : "Pinterest.webp",
    "Pocket" : "Pocket.webp",
    "Press" : "Press.webp",
    "Quickoffice" : "Quickoffice.webp",
    "SAP leave request" : "SAP leave request.webp",
    "Skydrive" : "Skydrive.webp",
    "Snapchat" : "Snapchat.webp",
    "Tesla" : "Tesla.webp",
    "Tumblr" : "Tumblr.webp",
    "Tweetbot" : "Tweetbot.png",
    "Twitter(old)" : "Twitter old.jpg",
    "Twitter" : "Twitter.webp",
    "Viber" : "Viber.webp",
    "Vimeo" : "Vimeo.png",
    "Vine" : "Vine.webp",
    "微信" : "Wechat.webp",
    "whatsapp" : "whatsapp.webp",
    "迅雷" : "Xunlei.webp",
    "易信" : "yixin.webp",
    "Youtube" : "Youtube.webp",
    "Dropbox" : "Dropbox.webp",
    "Quora" : "Quora.webp"
  },
  music: {
    "Angry Birds": "AngryBirds.mp3",
    "保卫萝卜": "CarrotProtect.mp3",
    "植物大战僵尸": "PvZ.mp3"
  },
  game: {
    opacity: {
      tick : 1000,
      interval: 600
    },
    jigsaw: {
      interval: 100
    }
  }
  // WarmUp: {
  //   imgs: ["pic1", "pic2"],
  //   music: ["m1", "m2"]
  // }
};

var cache = {
  imgs:{},
  music: {}
};

// preload the resources
function preloadImages(){
  for (var id in setting.imgs) {
    var image = new Image();
    image.src = setting.paths.imgs + "/" + setting.imgs[id];
    cache.imgs[id] = image;
  }
}
function preloadMusic(){
  for (var id in setting.music) {
    var audio = new Audio();
    audio.src = setting.paths.music + "/" + setting.music[id];
    audio.load();
    cache.music[id] = audio;
  }
}
preloadImages();
preloadMusic();

function getResource(type, name){
  return cache[type][name];
}

function $(selector, elm){
  return (elm || document)["querySelector"](selector);
}

function createGrid(domElement, size, image){
  var ret = [];
  domElement.innerHTML = "";
  for (var y=0; y<size; ++y){
    var row = [];
    ret.push(row);
    for (var x=0; x<size; ++x){
      var div = document.createElement("div");
      div.style.position = "absolute";
      div.style.width = ""+ (100/size) + "%";
      div.style.height = ""+ (100/size) + "%";
      div.style.left = "" + (100/size*x) + "%";
      div.style.top= "" + (100/size*y) + "%";
      div.style.backgroundImage = "url("+image.src+")";
      div.style.backgroundRepeat="no-repeat";
      div.style.backgroundSize = size+"00%";
      div.style.backgroundPositionX = (x/(size-1))*100 + "%";
      div.style.backgroundPositionY = (y/(size-1))*100 + "%";
      domElement.appendChild(div);
      row.push(div);
    }
  }
  ret.size = size;
  return ret;
}


Array.prototype.shuffle=function(){
  var tmpArray = this.slice(), ret=[];
  while(tmpArray.length!==0){
    ret.push(tmpArray.splice(Math.floor(Math.random()*tmpArray.length), 1)[0]);
  }
  // tmpArray.forEach(function(item){
  //   this.push(item);
  // }.bind(this));
  // return this;
  return ret;
};

function GameLoopBase(interval){
  this._paused = true;
  this.pause = function(){
    this._paused = true;
    clearInterval(this._timer);
  };
  this.resume = function(){
    this.pause();
    this._paused = false;
    this._timer = setInterval(function(){
        if (!this.step()) {
          this.pause();
          this.resume=function(){};
        }
    }.bind(this),interval); 
  };
}

function GameOpacity( grid ){
  GameLoopBase.call(this, setting.game.opacity.interval);
  var cells = grid.reduce(function(arr, row){
      return arr.concat(row);
  }, []);
  cells.forEach(function(dom){
      dom.style.opacity = "0";
      dom.style.transitionDuration = setting.game.opacity.tick + "ms";
  });
  var shuffleGrid = cells.shuffle();
  this.step = function(){
    shuffleGrid[0].style.opacity = 1;
    shuffleGrid.shift();
    if (shuffleGrid.length === 0){
      return false;
    }
    return true;
  };
};

function GameJigsaw(grid){
  GameLoopBase.call(this, setting.game.jigsaw.interval);

  var emptyCell = {
    x: grid.size-1,
    y: grid.size-1
  };
  grid[grid.size-1][grid.size-1].style.opacity=0;
  this._direct = [
    {x: -1, y:0, inverse: 1},
    {x:  1, y:0, inverse: 0},
    {x:  0, y:1, inverse: 3},
    {x:  0, y:-1,inverse: 2}
  ];
  this.isDirectValid= function(directIndex) {
    var newX = emptyCell.x + this._direct[directIndex].x,
        newY = emptyCell.y + this._direct[directIndex].y;
    if ( newX < 0 || newX >= grid.size || newY < 0 || newY >= grid.size) {
      return false;
    }
    return true;
  };
  this.getRandomDirectIndex= function(oldDirect){
    while(1){
      var direct = Math.floor(Math.random()*4);
      if (this._direct[oldDirect].inverse === direct){
        continue;
      }
      if (this.isDirectValid(direct)){
        return direct;
      }
    }
  };
  this.move = function(directIndex){
    var newX = emptyCell.x + this._direct[directIndex].x,
        newY = emptyCell.y + this._direct[directIndex].y;
    var dom = grid[newY][newX];
    dom.style.left = (100/grid.size*emptyCell.x) + "%";
    dom.style.top= (100/grid.size*emptyCell.y) + "%";
    grid[emptyCell.y][emptyCell.x] = dom;
    emptyCell.x = newX;
    emptyCell.y = newY;
  };
  this._oldDirect = 0;
  this.step = function(){
    this.move(this._moves.pop());
    return this._moves.length !== 0;
  };

  this._moves=[];
  var iniitialSteps = grid.size * grid.size * 4;
  var lastDirect = 0;
  for (var i=0; i< iniitialSteps || emptyCell.x !== grid.size-1 || emptyCell.y !== grid.size-1; ++i) {
    var direct = this.getRandomDirectIndex(lastDirect);
    this.move(direct);
    lastDirect = direct;
    this._moves.push(this._direct[lastDirect].inverse);
  }

}

function GameMusic(audio){
  this._audio = audio;
  this._paused= true;
  this.pause = function(){
    this._paused = true;
    this._audio.pause();
  };
  this.resume = function(){
    this._paused = false;
    this._audio.play();
  };
}

function GameTimer(domTimer){
  this._tick = 200;
  this._paused = true;
  this._intervalId = 0;
  this.pause = function(){
    this._paused = true;
    clearInterval(this._intervalId);
    this._intervalId = 0;
  };
  this.resume = function(){
    this.pause();
    this._paused = false;
    this._intervalId = setInterval(function(){
        this._tick -= 1;
        if (this._tick <=0) {
          this._tick =0;
        };
        domTimer.innerHTML = (this._tick/10).toFixed(1);
    }.bind(this), 100)
  }
  domTimer.innerHTML = (this._tick/10).toFixed(1);
}

var Key={
  space: 32,
  1: 49,
  2: 50,
  enter: 13,
  R: 82,
  C: 67,
  G: 71
};

function scoreReset(){
  localStorage.setItem("GreenScore", 0);
  localStorage.setItem("RedScore", 0);
  updateScore();
};

if (localStorage.getItem("GreenScore") === null){
  scoreReset();
  $("#GreenScore").setAttribute("data-show", "false");
  $("#RedScore").setAttribute("data-show", "false");
  $("#RedScore").innerHTML = localStorage.getItem("RedScore");
}
updateScore();

$("#GreenScore").setAttribute("data-show", "false");
$("#RedScore").setAttribute("data-show", "false");

function updateScore(){
  $("#GreenScore").innerHTML = localStorage.getItem("GreenScore");
  $("#RedScore").innerHTML = localStorage.getItem("RedScore");

  var scoreGrid = 40;

  $("#GreenScore").style.height = ((localStorage.getItem("GreenScore")|0)+2) * scoreGrid + "px";
  $("#RedScore").style.height = ((localStorage.getItem("RedScore")|0)+2) * scoreGrid + "px";
  $("#GreenScore").style.lineHeight = ((localStorage.getItem("GreenScore")|0)+2) * scoreGrid + "px";
  $("#RedScore").style.lineHeight = ((localStorage.getItem("RedScore")|0)+2) * scoreGrid + "px";
}

function gameKeyPressed(ev){
  switch(ev.keyCode){
    case Key.space: 
    gameCenter._game && gameCenter._game.toggle();
    break;
    case Key.R:
    gameCenter._game && gameCenter._game.reset();
    break;
    case Key.enter:
    gameCenter._game && gameCenter._game.showAnswer();
    break;
    case Key[1]:
    localStorage.setItem("GreenScore", (localStorage.getItem("GreenScore")|0) + (ev.shiftKey ? -1 : 1));
    updateScore();
    break;
    case Key[2]:
    localStorage.setItem("RedScore", (localStorage.getItem("RedScore")|0) +(ev.shiftKey ? -1 : 1));
    updateScore();
    break;
    case Key.C:
    scoreReset();
    location.reload();
    break;
    case Key.G:
    if (ev.shiftKey) {
      getResource("music", "植物大战僵尸").pause();
    } else {
      getResource("music", "植物大战僵尸").play();
    }
    break;
  }

  if (Object.keys(Key).reduce(function(obj, key){ obj[Key[key]] = true; return obj;},{})[ev.keyCode]!== undefined) {
    ev.stopPropagation();
    ev.preventDefault();
  }
}

function startTitleAnim(){
  setInterval(function(){
      var div = document.createElement("div");
      div.setAttribute("class", "icon");
      div.style.left = (Math.random()*100)+"%";
      div.style.top = (Math.random()*100)+"%";
      $("#title").insertBefore(div, $("#title").children[0]);
      setTimeout(function(){
          $("#title").removeChild(div);
      },6000);
  }, 1000);
}

function SingleGame(init, showScore){
    this._sequence = [];
    this.reset= function(){
      $("#GreenScore").setAttribute("data-show", showScore);
      $("#RedScore").setAttribute("data-show", showScore);

      var option = this._sequence.shift();
      if (!option) {
        return;
      }
      this.stop();

      $(".ready", this._dom).setAttribute("data-show", "true");
      $(".musicPlaying", this._dom).setAttribute("data-show", "false");
      $(".container", this._dom).setAttribute("data-show", "false");
      $(".paused", this._dom).setAttribute("data-show", "false");
      $(".answer .app", this._dom).innerHTML = option.file;
      $(".answer .app", this._dom).setAttribute("data-show", "false");

      if (option.type === "music") {
        this._instance = new GameMusic(getResource("music", option.file));
      } else {
        this._instance = new GameOpacity(
          createGrid($(".container .image", this._dom), 4, getResource("imgs", option.file))
        );
      }

    };
    this.showAnswer = function(){
      $(".answer .app", this._dom).setAttribute("data-show", "true");
    };
    this.stop = function(){
      this._instance && this._instance.pause();
    };
    this.toggle = function(){
      if (this._instance._paused) {
        $(".paused", this._dom).setAttribute("data-show", "false")
        $(".ready", this._dom).setAttribute("data-show", "false")
        if (this._instance instanceof GameOpacity) {
          $(".container", this._dom).setAttribute("data-show", "true");
        } else {
          $(".musicPlaying", this._dom).setAttribute("data-show", "true");
        }
        this._instance.resume();
      } else {
        $(".paused", this._dom).setAttribute("data-show", "true")
        this._instance.pause();
      }
    };
    init.call(this);
}

function MultiGame(init){
  this.reset= function(){
    $("#GreenScore").setAttribute("data-show", "true");
    $("#RedScore").setAttribute("data-show", "true");

    this.stop();
    this._instance = new GameTimer($(".timer", this._dom));

    $(".ready", this._dom).setAttribute("data-show", "true");
    $(".containerM", this._dom).setAttribute("data-show", "false");
    $(".containerM", this._dom).innerHTML = "";
    $(".timer", this._dom).setAttribute("data-show", "false");
    $(".answer .apps", this._dom).setAttribute("data-show", "false");
    $(".answer .apps", this._dom).innerHTML = "";

    this._sequence.forEach(function(file){
        $(".containerM", this._dom).appendChild(getResource("imgs", file));

        var h2 = document.createElement("h2");
        var img = document.createElement("img");
        img.src = getResource("imgs", file).src;
        h2.appendChild(img);
        h2.appendChild(document.createTextNode(file));
        $(".answer .apps", this._dom).appendChild(h2);


    }.bind(this));

  };
  this.showAnswer = function(){
    $(".answer .apps", this._dom).setAttribute("data-show", "true");
  };
  this.stop = function(){
      this._instance && this._instance.pause();
  };
  this.toggle = function(){
    if (this._instance._paused) {
      $(".ready", this._dom).setAttribute("data-show", "false")
      $(".containerM", this._dom).setAttribute("data-show", "true");
      $(".timer", this._dom).setAttribute("data-show", "true");
      this._instance.resume();
    } 
  };
  init.call(this);
}


var gameCenter={
  _game : null,
  enter: function(gameType){
    if (this._game) {
      this._game.stop();
    };
    this._game = this[gameType];
    this._game._dom = $("[data-state='"+gameType+"']");
    this._game.reset();
  },
  "WarmUp": new SingleGame(function(){
      // build 100 random images
      // var imgs = [];
      // while (imgs.length < 100){
      //   var tmpSet = setting.WarmUp.imgs.shuffle();
      //   if (imgs[imgs.length-1] !== tmpSet[0]) {
      //     imgs = imgs.concat(tmpSet);
      //   }
      // }
      // var music = [];
      // while (music.length < 100){
      //   var tmpSet = setting.WarmUp.music.shuffle();
      //   if (music[music.length-1] !== tmpSet[0]) {
      //     music = music.concat(tmpSet);
      //   }
      // }
      // for (var i=0; i<100; ++i) {
      //   this._sequence.push({
      //       type: "music",
      //       file: music[i]
      //   });
      //   this._sequence.push({
      //       type: "image",
      //       file: imgs[i]
      //   });
      // }
      this._sequence= [
        { type:"music", file: "保卫萝卜"},
        { type:"music", file: "Angry Birds"}
      ];
  }, false),
  "Stage1": new SingleGame(function(){
      this._sequence=[
        { type:"image", file: "Flipboard"},
        { type:"image", file: "Instapaper"},
        { type:"image", file: "Foursquare"},
        { type:"image", file: "Dropbox"},
        { type:"image", file: "Youtube"},
        { type:"image", file: "Quora"},
        { type:"image", file: "Pocket" },
        { type:"image", file: "Snapchat" },
        { type:"image", file: "Moves"},
        { type:"image", file: "Pandora"},
        { type:"image", file: "Tweetbot"}
      ];
  }, true),

  "Stage2_Green": new MultiGame(function(){
      this._sequence=[
        "Path" ,
        "Pinterest" ,
        "Press" 
      ];
  }),

  "Stage2_Red": new MultiGame(function(){
      this._sequence=[
        "iPhone camera",
        "Instagram" ,
        "Camera+"
      ];
  }),


  "Stage3_Green": new MultiGame(function(){
      this._sequence=[
        "SAP ByDesign" ,
        "SAP B1" ,
        "SAP leave request" 
      ];
  }),

  "Stage3_Red": new MultiGame(function(){
      this._sequence=[
        "SAP Anywhere" ,
        "Twitter" ,
        "迅雷" 
      ];
  }),


  "Stage5_Green": new MultiGame(function(){
      this._sequence=[
        "微信" ,
        "来往" ,
        "易信" 
      ];
  }),

  "Stage5_Red": new MultiGame(function(){
      this._sequence=[
        "百度云" ,
        "Skydrive" ,
        "iCloud" 
      ];
  }),

  "Stage4_Green": new MultiGame(function(){
      this._sequence=[
        "Twitter(old)" ,
        "Tumblr" ,
        "Tesla" 
      ];
  }),


  "Stage4_Red": new MultiGame(function(){
      this._sequence=[
        "Any.do" ,
        "Nike run+" ,
        "Clear" 
      ];
  }),


  "Stage6_Green": new MultiGame(function(){
      this._sequence=[
        "Vimeo" ,
        "Vine" 
      ];
  }),

  "Stage6_Red": new MultiGame(function(){
      this._sequence=[
        "Quickoffice" ,
        "Google drive" 
      ];
  })

  // "Stage7_Green": new MultiGame(function(){
  //     this._sequence=[
  //       "Facebook-messenger" ,
  //       "Viber" ,
  //       "whatsapp" 
  //     ];
  // }),


};



function main(){
  // var grid = createGrid($(".container .image"), 5, getResource("imgs", "pic1"));
  // // var game1 = new GameOpacity(grid);
  // // var game1 = new GameJigsaw(grid);
  // window.game1 = new GameMusic(getResource("music", "m1"));
  // game1.resume();
  startTitleAnim();
  window.addEventListener("keydown", gameKeyPressed, true);
  Reveal.addEventListener('WarmUp', function(ev) { gameCenter.enter(ev.type); } );
  Reveal.addEventListener('Stage1', function(ev) { gameCenter.enter(ev.type); } );
  Reveal.addEventListener('Stage2_Green', function(ev) { gameCenter.enter(ev.type); } );
  Reveal.addEventListener('Stage2_Red', function(ev) { gameCenter.enter(ev.type); } );
  Reveal.addEventListener('Stage3_Green', function(ev) { gameCenter.enter(ev.type); } );
  Reveal.addEventListener('Stage3_Red', function(ev) { gameCenter.enter(ev.type); } );
  Reveal.addEventListener('Stage4_Green', function(ev) { gameCenter.enter(ev.type); } );
  Reveal.addEventListener('Stage4_Red', function(ev) { gameCenter.enter(ev.type); } );
  Reveal.addEventListener('Stage5_Green', function(ev) { gameCenter.enter(ev.type); } );
  Reveal.addEventListener('Stage5_Red', function(ev) { gameCenter.enter(ev.type); } );
  Reveal.addEventListener('Stage6_Green', function(ev) { gameCenter.enter(ev.type); } );
  Reveal.addEventListener('Stage6_Red', function(ev) { gameCenter.enter(ev.type); } );
}

main();
