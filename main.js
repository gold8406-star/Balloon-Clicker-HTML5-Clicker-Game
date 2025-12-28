/* CONFIG */
const LEVEL_TIME = 30;
const START_GOAL = 30;
const GOAL_MULT = 1.35;

/* STATE */
let level = 1;
let goal = START_GOAL;
let clicks = 0;
let time = LEVEL_TIME;
let timer = null;
let running = false;
let balloonSize = 50;
let soundOn = true;

/* ELEMENTS */
const levelEl = document.getElementById("level");
const goalEl = document.getElementById("goal");
const clicksEl = document.getElementById("clicks");
const timerEl = document.getElementById("timer");
const balloon = document.getElementById("balloon");
const clickBtn = document.getElementById("clickBtn");
const repeatBtn = document.getElementById("repeatBtn");
const restartBtn = document.getElementById("restartBtn");
const soundBtn = document.getElementById("soundBtn");
const table = document.getElementById("scores");

/* SOUNDS */
const sndClick = document.getElementById("sndClick");
const sndPop = document.getElementById("sndPop");
const sndFail = document.getElementById("sndFail");
const sndRecord = document.getElementById("sndRecord");

/* THEMES */
const themes = [
  { bg:"#ffecd2", c1:"#ff5555", c2:"#b20000", fx:20 },
  { bg:"#e0ffd8", c1:"#55ff55", c2:"#008800", fx:120 },
  { bg:"#dde7ff", c1:"#5555ff", c2:"#0000aa", fx:220 },
  { bg:"#ffe0ff", c1:"#ff55ff", c2:"#880088", fx:300 },
  { bg:"#fff8d8", c1:"#ffff55", c2:"#999900", fx:60 }
];

/* TIMER */
function startTimer() {
  if (running) return;
  running = true;
  timer = setInterval(() => {
    time--;
    timerEl.textContent = time;
    if (time <= 0) failLevel();
  }, 1000);
}

function resetTimer() {
  clearInterval(timer);
  running = false;
  time = LEVEL_TIME;
  timerEl.textContent = time;
}

/* LEVEL CONTROL */
function startLevel() {
  clicks = 0;
  balloonSize = 50;
  resetTimer();

  const t = themes[(level-1)%themes.length];
  document.body.style.background = t.bg;
  balloon.style.background = `radial-gradient(circle at 30% 30%, ${t.c1}, ${t.c2})`;
  balloon.style.width = "50px";
  balloon.style.height = "50px";

  levelEl.textContent = level;
  goalEl.textContent = goal;
  clicksEl.textContent = clicks;

  clickBtn.disabled = false;
  repeatBtn.style.display = "none";
  restartBtn.style.display = "none";
}

/* NEXT / FAIL */
function nextLevel() {
  clearInterval(timer);
  running = false;
  if(soundOn){ sndPop.play(); sndRecord.play(); }
  firework();
  saveScore(level, clicks);

  level++;
  goal = Math.round(goal * GOAL_MULT);
  startLevel();
}

function failLevel() {
  clearInterval(timer);
  running = false;
  if(soundOn) sndFail.play();
  clickBtn.disabled = true;
  repeatBtn.style.display = "inline-block";
  restartBtn.style.display = "inline-block";
}

/* BUTTONS */
clickBtn.onclick = () => {
  startTimer();
  if(soundOn){ sndClick.currentTime = 0; sndClick.play(); }

  clicks++;
  clicksEl.textContent = clicks;

  balloonSize += 1.5;
  balloon.style.width = balloonSize + "px";
  balloon.style.height = balloonSize + "px";

  if (clicks >= goal) nextLevel();
};

repeatBtn.onclick = () => startLevel();

restartBtn.onclick = () => {
  level = 1;
  goal = START_GOAL;
  startLevel();
};

soundBtn.onclick = () => {
  soundOn = !soundOn;
  soundBtn.textContent = soundOn ? "Sound ON" : "Sound OFF";
};

/* HIGHSCORES */
function saveScore(lvl, clk) {
  const scores = JSON.parse(localStorage.getItem("scores") || "[]");
  scores.push({lvl, clk});
  scores.sort((a,b)=>b.clk-a.clk);
  localStorage.setItem("scores", JSON.stringify(scores.slice(0,5)));
  renderScores();
}

function renderScores() {
  const scores = JSON.parse(localStorage.getItem("scores") || "[]");
  table.innerHTML = "<tr><th>#</th><th>Level</th><th>Clicks</th></tr>";
  scores.forEach((s,i)=>{
    table.innerHTML += `<tr><td>${i+1}</td><td>${s.lvl}</td><td>${s.clk}</td></tr>`;
  });
}

/* FIREWORK */
const canvas = document.getElementById("fx");
const ctx = canvas.getContext("2d");
canvas.width = innerWidth;
canvas.height = innerHeight;
let particles = [];

function firework() {
  const hue = themes[(level-1)%themes.length].fx;
  for(let i=0;i<60;i++){
    particles.push({
      x:innerWidth/2,y:innerHeight/3,
      vx:(Math.random()-0.5)*6,
      vy:(Math.random()-0.5)*6,
      a:1,h:hue
    });
  }
}

function animate() {
  ctx.clearRect(0,0,canvas.width,canvas.height);
  particles.forEach((p,i)=>{
    p.x+=p.vx; p.y+=p.vy; p.a-=.02;
    ctx.globalAlpha=p.a;
    ctx.fillStyle=`hsl(${p.h},100%,50%)`;
    ctx.beginPath();
    ctx.arc(p.x,p.y,3,0,Math.PI*2);
    ctx.fill();
    if(p.a<=0) particles.splice(i,1);
  });
  requestAnimationFrame(animate);
}
animate();

/* START */
renderScores();
startLevel();
