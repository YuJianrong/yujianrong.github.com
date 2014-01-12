
var setting = {
  paths: {
    imgs: "./resources/imgs",
    music: "./resources/music"
  },
  imgs: {
    pic1: "1.jpg",
    pic2: "2.jpg"
  },
  music: {
    m1: "1.mp3",
    m2: "2.mp3"
  },
  game: {
    opacity: {
      tick : 1000,
      interval: 1000
    },
    jigsaw: {
      interval: 100
    }
  }
};

var cache = {
  imgs:{},
  music: {}
}

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

function $(selector){
  return document.querySelector(selector);
}

function createGrid(domElement, size, image){
  var ret = [];
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
  this.pause = function(){
    clearInterval(this._timer);
  };
  this.resume = function(){
    this.pause();
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
  this._audio = audio
  this.pause = function(){
    this._audio.pause();
  };
  this.resume = function(){
    this._audio.play();
  };
}



function main(){
  var grid = createGrid($(".container .image"), 5, getResource("imgs", "pic1"));
  // var game1 = new GameOpacity(grid);
  // var game1 = new GameJigsaw(grid);
  window.game1 = new GameMusic(getResource("music", "m1"));
  game1.resume();
}

main();
