const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

if (window.innerHeight < window.innerWidth) {
  canvas.height = Math.min(window.innerWidth, window.innerHeight) - 30;
  canvas.width = canvas.height * 9 / 16;
} else {
  canvas.height = Math.max(window.innerWidth, window.innerHeight) - 30;
  canvas.width = canvas.height * 9 / 16;
}
const [WIDTH, HEIGHT] = [canvas.width, canvas.height];

const FONT = 'ニタラゴルイカ等幅清音教育漢-08';
const FPS = 60;
let frames = 0;

const Player = new class {
  constructor() {
    this.symbol = '⛮';
    this.r = WIDTH / 10;
    this.x = WIDTH / 2;
    this.y = HEIGHT / 2;
    this.mousedown = false;
    this.isHurt = false;
  }
  draw() {
    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = this.r * 2 + 'px ' + FONT;
    ctx.fillText(this.symbol, this.x, this.y);
  }
  update() {
    canvas.addEventListener('mousemove', function(e) {
      currentX = e.offsetX;
      currentY = e.offsetY;
      if (Player.movable) {
        Player.x += currentX - previousX;
        Player.y += currentY - previousY;
      }
      previousX = e.offsetX;
      previousY = e.offsetY;
    }, false);
  }
}

let bullets = [];
class Bullet {
  constructor(x, y) {
    this.x = x;
    this.y = y - Player.r;
    this.r = WIDTH / 100;
    this.v = HEIGHT / 200;
  }
  draw() {
    ctx.beginPath();
    ctx.fillStyle = 'white';
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
  }
  update() {
    this.y -= this.v
  }
}

let obstracles = [];
class Obstracle {
  constructor() {
    const random = n => Math.floor(Math.random() * n);
    this.x = random(WIDTH);
    this.y = -HEIGHT;
    this.r = WIDTH / 30;
    this.v = HEIGHT / 300;
  }
  draw() {
    ctx.beginPath();
    ctx.fillStyle = 'red';
    ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
    ctx.fill();
  }
  update() {
    this.y += this.v
  }
}

let previousX;
let previousY;
let currentX;
let currentY;

canvas.addEventListener('mousedown', function(e) {
  previousX = e.offsetX;
  previousY = e.offsetY;
  Player.movable = true;
}, false);

canvas.addEventListener('mouseup', function(e) {
  Player.movable = false;
}, false);

canvas.addEventListener('mouseout', function(e) {
  Player.movable = false;
}, false);

function draw() {
  frames += 1;

  ctx.beginPath();
  ctx.fillStyle = 'silver';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  if (frames % 25 == 0) {
    bullets.push(new Bullet(Player.x, Player.y));
    const sound = new Audio('./audio/laser05.mp3');
    sound.play();
  }
  bullets.forEach(bullet => bullet.update());
  bullets.forEach(bullet => bullet.draw());
  bullets = bullets.filter(b => b.y > 0);

  if (frames % 25 == 0) {
    obstracles.push(new Obstracle);
  }
  obstracles.forEach(obstracle => obstracle.update());
  obstracles.forEach(obstracle => obstracle.draw());
  obstracles = obstracles.filter(o => o.y < HEIGHT);

  const calcCollision = (obj1, obj2) =>
    (obj1.x - obj2.x) ** 2 + (obj1.y - obj2.y) ** 2 - (obj1.r + obj2.r) ** 2;

  for (obstracle of obstracles) {
    for (bullet of bullets) {
      if (calcCollision(obstracle, bullet) < 0) {
        obstracles = obstracles.filter(o => o != obstracle);
        bullets = bullets.filter(b => b != bullet);
        const sound = new Audio('./audio/hit07.mp3');
        sound.play();
      }
    }
  }

  for (obstracle of obstracles) {
    if (calcCollision(Player, obstracle) < 0 && !Player.isHurt) {
      Player.isHurt = true;
      const sound = new Audio('./audio/explosion06.mp3');
      sound.play();
      setTimeout(function() {
        Player.isHurt = false;
      }, 1000);
    }
  }

  Player.update();
  if (frames % 5 == 0 || !Player.isHurt) {
    Player.draw();
  }
}

setInterval(draw, 1000 / FPS);
