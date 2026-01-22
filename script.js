const pages = ["page1","page2","page3","game1","game4","bestFriend","apology","party"];
const $ = (id) => document.getElementById(id);

const sfxFaah = $("sfxFaah");
const sfxChaos = $("sfxChaos");
const sfxMaya = $("sfxMaya");
const sfxCheer = $("sfxCheer");

function showPage(id){
  pages.forEach(p => $(p).classList.remove("active"));
  $(id).classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });

  // maya.mp3 should play from page2 until final (stops when slideshow starts)
  if (id === "page1") stopMayaMusic();
  else {
    startMayaMusic();
    document.addEventListener("pointerdown", unlockMayaOnce, { once:true });
    document.addEventListener("click", unlockMayaOnce, { once:true });
  }

if (id === "page2") startDiscoMode();
  else stopDiscoMode();
}

function wordCount(str){
  return str.trim().length ? str.trim().split(/\s+/).length : 0;
}



let mayaUnlocked = false;
function unlockMayaOnce(){
  if (mayaUnlocked) return;
  mayaUnlocked = true;
  startMayaMusic();
  document.removeEventListener("pointerdown", unlockMayaOnce);
  document.removeEventListener("click", unlockMayaOnce);
}
function startMayaMusic(){
  const banner = $("musicBanner");
  try{
    sfxMaya.loop = true;
    sfxMaya.volume = 1.0;
    // don't restart if already playing
    if (!sfxMaya.paused) return;
    const p = sfxMaya.play();
    if (p && typeof p.then === "function"){
      p.then(() => { if (banner) banner.classList.add("hidden"); })
       .catch(() => { if (banner) banner.classList.remove("hidden"); });
    }
  } catch {
    if (banner) banner.classList.remove("hidden");
  }
}
function stopMayaMusic(){
  try{ sfxMaya.pause(); } catch {}
}
function playFaah(){
  try{
    const a = sfxFaah.cloneNode(true);
    a.volume = 1.0;
    a.play();
  } catch {}
}

// ---- Disco mode (Page 2)
function startDiscoMode(){
  try{
    if (sfxCheer){
      sfxCheer.currentTime = 0;
      sfxCheer.volume = 1.0;
      sfxCheer.play();
    }
  } catch {}

  const layer = $("discoPoppers");
  if (!layer) return;
  layer.innerHTML = "";

  if (window.__discoTimer) clearInterval(window.__discoTimer);
  window.__discoTimer = setInterval(() => {
    for (let i=0;i<28;i++){
      const p = document.createElement("div");
      p.className = "disco-pop";
      p.style.left = `${Math.random()*100}%`;
      p.style.top = `${-20 - Math.random()*80}px`;
      p.style.animationDuration = `${1.2 + Math.random()*1.6}s`;
      layer.appendChild(p);
      setTimeout(() => { if (p.parentNode) p.parentNode.removeChild(p); }, 2600);
    }
  }, 320);
}

function stopDiscoMode(){
  if (window.__discoTimer) { clearInterval(window.__discoTimer); window.__discoTimer = null; }
  const layer = $("discoPoppers");
  if (layer) layer.innerHTML = "";
  try { if (sfxCheer) sfxCheer.pause(); } catch {}
}

// ---- Page 1: 200-word cap (no minimum; never blocks Next)
$("desc200")?.addEventListener("input", () => {
  const box = $("desc200");
  const counter = $("count200");
  const n = wordCount(box.value);

  if (counter) counter.textContent = String(n);

  if (n > 200) {
    const words = box.value.trim().split(/\s+/).slice(0, 200);
    box.value = words.join(" ");
    if (counter) counter.textContent = "200";
  }
});

$("next1").addEventListener("click", () => { showPage("page2"); });
// ---- Dodge back button
function makeBackDodge(btnId){
  const btn = $(btnId);
  if (!btn) return;
  btn.addEventListener("mouseenter", () => {
    const parent = btn.parentElement;
    parent.style.position = "relative";
    btn.style.position = "relative";
    const dx = (Math.random() * 220) - 110;
    const dy = (Math.random() * 60) - 30;
    btn.style.transform = `translate(${dx}px, ${dy}px) rotate(${(Math.random()*8)-4}deg)`;
  });
}
["back2","back3","backG1","backG4","backApology"].forEach(makeBackDodge);

// If you actually manage to click Back, it works 😈
$("back2")?.addEventListener("click", () => showPage("page1"));
$("back3")?.addEventListener("click", () => { stopChaos(); showPage("page2"); });
$("backG1")?.addEventListener("click", () => showPage("page3"));
$("backG4")?.addEventListener("click", () => showPage("game1"));
$("backApology")?.addEventListener("click", () => showPage("bestFriend"));


// ---- Page 2: plot twist
$("next2").addEventListener("click", () => { showPage("page3"); });


// ---- Page 3 chaos
let chaosTimer = null;
let faahBombTimer = null;

function startChaos(){
  stopChaos();
  sfxChaos.loop = true;
  sfxChaos.volume = 1.0;
  try { sfxChaos.currentTime = 0; sfxChaos.play(); } catch {}

  const spam = $("emojiSpam");
  const emojis = ["💥","🔥","😈","🤯","💣","😂","⚠️","🎉","😵‍💫","🧨","💀","🫠"];

  chaosTimer = setInterval(() => {
    let chunk = "";
    for (let i=0;i<60;i++){
      chunk += emojis[Math.floor(Math.random()*emojis.length)];
    }
    spam.textContent = chunk + "\n" + spam.textContent.slice(0, 400);
  }, 120);

  let t = 0;
  const titleTimer = setInterval(() => {
    document.title = (t++ % 2 === 0) ? "HELP CENTER" : "VERIFICATION";
  }, 500);
  chaosTimer._titleTimer = titleTimer;

  faahBombTimer = setInterval(() => {
    if (Math.random() < 0.55) playFaah();
  }, 220);
}

function stopChaos(){
  if (chaosTimer){
    clearInterval(chaosTimer);
    if (chaosTimer._titleTimer) clearInterval(chaosTimer._titleTimer);
    chaosTimer = null;
  }
  if (faahBombTimer){
    clearInterval(faahBombTimer);
    faahBombTimer = null;
  }
  try { sfxChaos.pause(); } catch {}
  stopMayaMusic();
  document.title = "Help Center";
}

$("phraseInput").addEventListener("input", () => {
  const v = $("phraseInput").value.trim().toLowerCase();
  const target = "ok";

  const isPrefix = target.startsWith(v);
  const isExact = (v === target);

  $("next3").disabled = !isExact;

  if (isExact){
    stopChaos();
    $("emojiSpam").textContent = "✅ Verified.";
    return;
  }

  if (isPrefix){
    stopChaos();
    $("emojiSpam").textContent = "";
    return;
  }

  if (!chaosTimer) startChaos();
});

$("next3").addEventListener("click", () => {
  stopChaos();
  showPage("game1");
  startCatchGame();
});

// ---- Game 1: Catch the Face (6 hits)
function startCatchGame(){
  const area = $("catchArea");
  const target = $("catchTarget");

  $("catchHits").textContent = "0";
  $("nextG1").disabled = true;

  let hits = 0;
  const startedAt = Date.now();

  target.src = "assets/images/image.png";

  function placeTarget(){
    const r = area.getBoundingClientRect();
    const size = target.getBoundingClientRect().width || 96;
    const maxX = Math.max(10, r.width - size - 10);
    const maxY = Math.max(10, r.height - size - 10);
    target.style.left = `${10 + Math.random() * maxX}px`;
    target.style.top = `${10 + Math.random() * maxY}px`;
  }
  placeTarget();

  const missHandler = () => playFaah();
  area.addEventListener("mousedown", missHandler);

  const hitHandler = (e) => {
    e.stopPropagation();
    playFaah();
    hits++;
    $("catchHits").textContent = String(hits);

    const base = 96;
    const newSize = Math.max(72, base - hits * 3);
    target.style.width = `${newSize}px`;
    target.style.height = `${newSize}px`;

    placeTarget();

    if (hits >= 6){
      $("nextG1").disabled = false;
      cleanup();
    }
  };
  target.addEventListener("mousedown", hitHandler);

  const dodgeHandler = () => {
    if (Date.now() - startedAt < 2000) return;
    if (Math.random() < 0.7) placeTarget();
  };
  target.addEventListener("mouseenter", dodgeHandler);

  function cleanup(){
    area.removeEventListener("mousedown", missHandler);
    target.removeEventListener("mousedown", hitHandler);
    target.removeEventListener("mouseenter", dodgeHandler);
  }

  const obs = new MutationObserver(() => {
    if (!$("game1").classList.contains("active")){
      cleanup();
      obs.disconnect();
    }
  });
  obs.observe(document.body, { attributes:true, subtree:true, attributeFilter:["class"] });
}

$("nextG1").addEventListener("click", () => {
  showPage("game4");
  startFlappy();
});

// ---- Game 2: Flappy Face (easy)
let flappy = { running:false, raf:null };

function startFlappy(){
  const canvas = $("flappyCanvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;

  $("flappyScore").textContent = "0";
  $("nextG4").disabled = true;

  const birdImg = new Image();
  birdImg.src = "assets/images/bird.png";

  const overlayImg = new Image();
  overlayImg.src = "assets/images/bird_overlay.png"; // add this file


  const targetScore = 5;

  const state = {
    bird: { x: 170, y: H/2, r: 18, vy: 0 },
    pipes: [],
    score: 0,
    started: false,
    dead: false,
    t: 0
  };

  function makePipe(x){
    const gap = 220;
    const minTop = 50;
    const maxTop = H - 50 - gap;
    const topH = minTop + Math.random()*(maxTop - minTop);
    return { x, w: 76, topH, gap, passed:false };
  }

  function resetPipes(){
    state.pipes = [];
    for (let i=0;i<3;i++){
      state.pipes.push(makePipe(W + i*300));
    }
  }

  function resetGame(){
    state.bird.y = H/2;
    state.bird.vy = 0;
    state.score = 0;
    state.started = false;
    state.dead = false;
    $("flappyScore").textContent = "0";
    $("nextG4").disabled = true;
    resetPipes();
  }
  resetGame();

  function flap(){
    state.started = true;
    if (state.dead) return;
    state.bird.vy = -6.2;
  }

  function crash(){
    if (!state.dead){
      state.dead = true;
      playFaah();
    }
  }

  function onKey(e){
    // if crashed, any key restarts
    if (state.dead){
      resetGame();
      state.started = true;
      flap();
      return;
    }
    if (e.code === "Space") flap();
    if (e.code === "ArrowUp"){
      resetGame();
    }
  }
  function onClick(){ flap(); }

  window.addEventListener("keydown", onKey);
  canvas.addEventListener("mousedown", onClick);
  canvas.addEventListener("touchstart", (e)=>{ e.preventDefault(); flap(); }, {passive:false});

  const gravity = 0.30;
  const speed = 2.0;

  function circleRectCollide(cx, cy, cr, rx, ry, rw, rh){
    const nx = Math.max(rx, Math.min(cx, rx+rw));
    const ny = Math.max(ry, Math.min(cy, ry+rh));
    const dx = cx - nx;
    const dy = cy - ny;
    return (dx*dx + dy*dy) <= cr*cr;
  }

  function stop(){
    flappy.running = false;
    if (flappy.raf) cancelAnimationFrame(flappy.raf);
    window.removeEventListener("keydown", onKey);
    canvas.removeEventListener("mousedown", onClick);
  }

  flappy.running = true;

  function step(){
    if (!flappy.running) return;

    if (state.started && !state.dead){
      state.bird.vy += gravity;
      state.bird.y += state.bird.vy;

      for (const p of state.pipes){
        p.x -= speed;

        if (!p.passed && p.x + p.w < state.bird.x){
          p.passed = true;
          state.score++;
          $("flappyScore").textContent = String(state.score);
          if (state.score >= targetScore) $("nextG4").disabled = false;
        }

        const topRect = { x:p.x, y:0, w:p.w, h:p.topH };
        const botRect = { x:p.x, y:p.topH + p.gap, w:p.w, h:H - (p.topH + p.gap) };

        if (
          circleRectCollide(state.bird.x, state.bird.y, state.bird.r, topRect.x, topRect.y, topRect.w, topRect.h) ||
          circleRectCollide(state.bird.x, state.bird.y, state.bird.r, botRect.x, botRect.y, botRect.w, botRect.h)
        ) crash();
      }

      if (state.pipes[0].x + state.pipes[0].w < -20){
        state.pipes.shift();
        state.pipes.push(makePipe(state.pipes[state.pipes.length-1].x + 300));
      }

      if (state.bird.y + state.bird.r > H - 10 || state.bird.y - state.bird.r < 10) crash();
    }

    ctx.clearRect(0,0,W,H);

    for (const p of state.pipes){
      ctx.fillStyle = "rgba(0,0,0,0.20)";
      ctx.fillRect(p.x, 0, p.w, p.topH);
      ctx.fillRect(p.x, p.topH + p.gap, p.w, H - (p.topH + p.gap));
    }

    const b = state.bird;
    if (birdImg.complete && birdImg.naturalWidth > 0){
      const size = b.r*2.6;
      ctx.save();
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
      ctx.clip();
      ctx.drawImage(birdImg, b.x - size/2, b.y - size/2, size, size);
      // draw a small bird overlay on the face
      if (overlayImg.complete && overlayImg.naturalWidth > 0){
        const os = b.r*2.0;
        ctx.drawImage(overlayImg, b.x + b.r*0.05, b.y - b.r*0.9, os, os);
      }
      ctx.restore();
    } else {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI*2);
      ctx.fillStyle = "rgba(0,0,0,0.25)";
      ctx.fill();
    }

    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.font = "16px system-ui";
    if (!state.started) ctx.fillText("Click / Tap / Space to start", 18, 28);
    if (state.dead) ctx.fillText("Crashed. Press ↑ to restart.", 18, 52);

    flappy.raf = requestAnimationFrame(step);
  }

  const obs = new MutationObserver(() => {
    if (!$("game4").classList.contains("active")) stop();
  });
  obs.observe(document.body, { attributes:true, subtree:true, attributeFilter:["class"] });

  step();
}

$("nextG4").addEventListener("click", () => showPage("bestFriend"));

// ---------------- Selection overlay party (unchanged)
function showOverlayParty(message, mode){
  const overlay = $("overlay");
  const text = $("overlayText");
  const fx = $("overlayFX");

  fx.innerHTML = "";
  text.className = "overlay-text";
  overlay.classList.remove("hidden");

  if (mode === "ok"){
    text.classList.add("big-ok");
    text.textContent = "OK!";
    playFaah();
    setTimeout(() => overlay.classList.add("hidden"), 1400);
    return;
  }

  text.classList.add("party");
  text.textContent = message;

  const emojis = ["🎉","💖","💞","💗","✨","🥳","🎊","💝","🌸","🪩","💫","🕺","💃","🎈","🍰"];
  const N = 44;
  for (let i=0;i<N;i++){
    const s = document.createElement("div");
    s.className = "fx-emoji";
    s.textContent = emojis[Math.floor(Math.random()*emojis.length)];
    s.style.left = `${Math.random()*100}vw`;
    s.style.top = `${-40 - Math.random()*400}px`;
    s.style.animationDuration = `${1.2 + Math.random()*1.3}s`;
    s.style.fontSize = `${24 + Math.random()*28}px`;
    fx.appendChild(s);
  }

  const spam = setInterval(() => { if (Math.random() < 0.45) playFaah(); }, 160);
  setTimeout(() => { clearInterval(spam); overlay.classList.add("hidden"); }, 2200);
}

// Best friend choice
document.querySelectorAll(".choice").forEach(btn => {
  btn.addEventListener("click", () => {
    const c = btn.dataset.choice;
    const out = $("choiceResult");

    if (c === "basmallah"){
      out.innerHTML = "Selected: <b>Basmallah</b>";
      showOverlayParty("BASMALLAH SUPREMACY 💖", "party");
    } else if (c === "karthik"){
      out.innerHTML = "Selected: <b>Karthik</b>";
      showOverlayParty("KARTHIK ENERGY 🥳", "party");
    } else {
      out.innerHTML = "Selected: <b>Rajit</b>";
      showOverlayParty("", "ok");
    }
    $("nextFinal").disabled = false;
  });
});

$("nextFinal").addEventListener("click", () => {
  showPage("apology");
});


// ---- Apology gate (right before final reveal)
const APOLOGY_MIN_WORDS = 450;

$("apologyText").addEventListener("input", () => {
  const n = wordCount($("apologyText").value);
  $("apologyCount").textContent = n;
  const err = $("apologyError");
  if (err) err.classList.remove("show");

  if (n > 500) {
    const words = $("apologyText").value.trim().split(/\s+/).slice(0, 500);
    $("apologyText").value = words.join(" ");
    $("apologyCount").textContent = 500;
  }
});

$("nextApology").addEventListener("click", () => {
  const n = wordCount($("apologyText").value);
  if (n < APOLOGY_MIN_WORDS) {
    const err = $("apologyError");
    if (err){
      err.textContent = `Please write at least ${APOLOGY_MIN_WORDS} words to unlock the final page. Current: ${n}.`;
      err.classList.add("show");
    }
    // little shake for realism
    $("apologyText").classList.remove("shake");
    void $("apologyText").offsetWidth;
    $("apologyText").classList.add("shake");
    return;
  }
  showPage("party");
  startPartyMode();
  startMediaPlaylist();
});

// ---------------- PARTY MODE (FINAL REVEAL)
const partyGifs = [
  "https://tenor.com/embed/9472470858311093882",
  "https://tenor.com/embed/10799637110820905144",
  "https://tenor.com/embed/1787924727892494944",
  "https://tenor.com/embed/11830777984154970500",
  "https://tenor.com/embed/12004912814618205756",
  "https://tenor.com/embed/16663749",
  "https://tenor.com/embed/18308244892322948774"
];

let emojiTimer = null;

function ensurePartyMusicUnlocked(){
  // If browser blocks autoplay, allow first tap/click anywhere on party page to start music
  const party = $("party");
  if (!party) return;
  const handler = () => {
    try{
      if (sfxMaya && sfxMaya.paused){
        sfxMaya.loop = true;
        sfxMaya.volume = 1.0;
        sfxMaya.play();
      }
    } catch {}
    party.removeEventListener("pointerdown", handler);
    party.removeEventListener("click", handler);
  };
  party.addEventListener("pointerdown", handler, { once:true });
  document.addEventListener("pointerdown", handler, { once:true });
  party.addEventListener("click", handler, { once:true });
}
function startPartyMode(){
  // final page music
  try{
    sfxMaya.loop = true;
    sfxMaya.volume = 1.0;
    sfxMaya.play();
  } catch {}

  // place gifs in the gif stage area
  const stage = $("gifStage");
  stage.innerHTML = "";
  const howMany = 8;

  for (let i=0;i<howMany;i++){
    const frame = document.createElement("iframe");
    frame.className = "party-gif-frame";
    frame.src = partyGifs[Math.floor(Math.random()*partyGifs.length)];
    frame.loading = "lazy";
    frame.setAttribute("frameborder","0");
    frame.setAttribute("allowfullscreen","true");
    frame.style.left = `${Math.random()*82}%`;
    frame.style.top = `${Math.random()*40}%`;
    frame.style.width = `${110 + Math.random()*120}px`;
    frame.style.height = frame.style.width;
    frame.style.animationDuration = `${2.0 + Math.random()*2.8}s`;
    stage.appendChild(frame);
  }

  // party poppers/confetti across whole page
  const conf = $("partyConfetti");
  if (conf){
    conf.innerHTML = "";
    for (let i=0;i<260;i++){
      const c = document.createElement("div");
      c.className = "confetti";
      c.style.left = `${Math.random()*100}%`;
      c.style.top = `${-40 - Math.random()*600}px`;
      c.style.animationDuration = `${2.2 + Math.random()*3.2}s`;
      c.style.animationDelay = `${Math.random()*1.6}s`;
      conf.appendChild(c);
    }
  }

  // emoji float layer across whole party page (behind everything)
  const layer = $("partyEmojiLayer");
  layer.innerHTML = "";
  const emojis = ["🎉","🎊","✨","🥳","🎈","🪩","💃","🕺","🍰","🎁","💖","💞","💗","💝","🌸","💫","🍬","🎵"];

  if (emojiTimer) clearInterval(emojiTimer);
  emojiTimer = setInterval(() => {
    for (let i=0;i<6;i++){
      const e = document.createElement("div");
      e.className = "party-emoji";
      e.textContent = emojis[Math.floor(Math.random()*emojis.length)];
      e.style.left = `${Math.random()*100}%`;
      e.style.top = `${-40 - Math.random()*120}px`;
      e.style.animationDuration = `${2.0 + Math.random()*2.8}s`;
      e.style.fontSize = `${22 + Math.random()*26}px`;
      layer.appendChild(e);
      setTimeout(() => { if (e.parentNode) e.parentNode.removeChild(e); }, 5200);
    }
  }, 260);
}

// ---------------- Messages playlist (videos + texts)
// You can add more items anytime.
// - Video local: assets/videos/Rajit.mp4
// - Video discord: https://cdn.discordapp.com/attachments/.../file.mp4
// - Text local: assets/texts/Friend.txt
const mediaPlaylist = [
  // VIDEOS
  { type: "video", src: "assets/videos/Andre.mp4", author: "Andre" },

  { type: "video", src: "assets/videos/Basmallah.mp4", author: "Basmallah" },
  // FIX: ensure text shows

  { type: "video", src: "assets/videos/Yugantika.mp4", author: "yugantika" },
  { type: "video", src: "assets/videos/Karthik.mp4", author: "Karthik" },
  { type: "video", src: "assets/videos/Ahmed.mp4", author: "Ahmed" },
  { type: "video", src: "assets/videos/Yousef.mp4", author: "Yousef" },

  // AUDIO
  { type: "audio", src: "assets/audios/Veronica.mp3", author: "Veronica" },
  { type: "audio", src: "assets/audios/Naitik.mp3", author: "Naitik" },

  // TEXT
  { type: "text", file: "assets/texts/avi.txt", author: "Avi" },
  { type: "text", file: "assets/texts/Rajit.txt", author: "Rajit" }
];

let mediaIdx = 0;
let slideshowStarted = false;
let mediaCacheBuster = 0;

function escapeHtml(s){
  return s.replace(/[&<>"']/g, (c) => ({ "&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;","'":"&#39;" }[c]));
}

async function loadTextFromFile(path){
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to load text file");
  return await res.text();
}

async function renderMedia(forcePlay=false){
  if (!mediaPlaylist.length) return;

  const item = mediaPlaylist[mediaIdx % mediaPlaylist.length];

  $("mediaAuthor").textContent = `From: ${item.author || "—"}`;
  $("mediaCount").textContent = `${(mediaIdx % mediaPlaylist.length) + 1} / ${mediaPlaylist.length}`;

  const vid = $("mediaVideo");
  const aud = $("mediaAudio");
  const frame = $("mediaTextFrame");
  const textCard = $("mediaTextCard");
  const textBody = $("mediaTextBody");

  // Reset
  vid.pause();
  vid.removeAttribute("src");
  vid.load();

  if (aud){
    try { aud.pause(); } catch {}
    aud.removeAttribute("src");
    aud.load();
  }

  if (aud) aud.classList.add("hidden");

  if (item.type === "text"){
    // Use iframe to display local .txt without fetch/CORS issues on file://
    vid.classList.add("hidden");
    if (aud) aud.classList.add("hidden");
    textCard.classList.add("hidden");

    if (frame){
      frame.classList.remove("hidden");
      frame.src = item.file + `?v=${mediaCacheBuster}`;
    } else {
      // fallback to old card if iframe missing
      textCard.classList.remove("hidden");
      textBody.innerHTML = escapeHtml("Text frame missing.");
    }
    return;
  }

  if (item.type === "audio"){
    if (!aud){
      // no audio element present
      return;
    }
    vid.classList.add("hidden");
  if (frame) frame.classList.add("hidden");
    textCard.classList.add("hidden");
  if (frame) frame.classList.add("hidden");
    aud.classList.remove("hidden");
    aud.src = item.src + `?v=${mediaCacheBuster}`;
    aud.onerror = () => { mediaIdx = (mediaIdx + 1) % mediaPlaylist.length; renderMedia(false); };
    aud.onended = () => {
      if (!slideshowStarted) return;
      mediaIdx = (mediaIdx + 1) % mediaPlaylist.length;
      renderMedia(false);
    };
    if (forcePlay){ if (forcePlay){ try { await aud.play(); } catch {} } }
    return;
  }

  // default: video
  textCard.classList.add("hidden");
  if (frame) frame.classList.add("hidden");
  vid.classList.remove("hidden");

  vid.src = item.src + `?v=${mediaCacheBuster}`;
  if (forcePlay){ if (forcePlay){ try { await vid.play(); } catch {} } }
}

function startMediaPlaylist(){
  mediaIdx = 0;

  // Auto-advance when a video ends
  const vid = $("mediaVideo");
  vid.onended = () => {
    if (!slideshowStarted) return;
    const item = mediaPlaylist[mediaIdx % mediaPlaylist.length];
    if (item.type === "video"){
      mediaIdx = (mediaIdx + 1) % mediaPlaylist.length;
      renderMedia(false);
    }
  };

  $("mediaPrev").onclick = () => {
    mediaIdx = (mediaIdx - 1 + mediaPlaylist.length) % mediaPlaylist.length;
    renderMedia(false);
  };
  $("mediaNext").onclick = () => {
    mediaIdx = (mediaIdx + 1) % mediaPlaylist.length;
    renderMedia(false);
  };
  $("mediaStart").onclick = () => {
    slideshowStarted = true;
    stopMayaMusic();
    try { if (window.__partyConfettiTimer) { clearInterval(window.__partyConfettiTimer); window.__partyConfettiTimer = null; } } catch {}
    try { setPartyFxPaused(true); } catch {}
    renderMedia(false);
  };

  $("stopSong").onclick = () => {
    try { stopMayaMusic(); } catch {}
  };

  $("playSong").onclick = () => {
    slideshowStarted = false;
    try { setPartyFxPaused(false); } catch {}
    const v = $("mediaVideo");
    const a = $("mediaAudio");
    try { v.pause(); } catch {}
    try { if (a) a.pause(); } catch {}
    startMayaMusic();
  };

  $("mediaReload").onclick = () => {
    mediaCacheBuster = Date.now();
    renderMedia(false);
  };

  $("mediaReplay").onclick = () => {
    const item = mediaPlaylist[mediaIdx % mediaPlaylist.length];
    if (item.type === "video"){
      const v = $("mediaVideo");
      v.currentTime = 0;
    } else if (item.type === "audio"){
      const a = $("mediaAudio");
      if (a) a.currentTime = 0;
    } else {
      renderMedia(false);
    }
  };
  renderMedia(false);
}



// Restart
$("restart").addEventListener("click", () => {
  if (emojiTimer) clearInterval(emojiTimer);
  emojiTimer = null;

  try { sfxChaos.pause(); } catch {}
  stopMayaMusic();
  $("gifStage").innerHTML = "";
  $("partyEmojiLayer").innerHTML = "";

  showPage("page1");
});

$("fakeSignIn").addEventListener("click", (e) => {
  e.preventDefault();
  alert("Sign-in is unavailable.");
});
