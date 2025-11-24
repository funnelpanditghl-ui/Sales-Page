// main.js (NO LOGIC CHANGE — SAME AS YOUR FINAL)

/* Reveal */
const reveals = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('show');
      io.unobserve(e.target);
    }
  });
},{threshold:0.12});
reveals.forEach(r=>io.observe(r));

/* FAQ */
document.querySelectorAll('.faq .card').forEach(card=>{
  const btn = card.querySelector('.faq-btn');
  btn.addEventListener('click', ()=>{
    card.classList.toggle('open');
    btn.querySelector('span').textContent = card.classList.contains('open') ? "−" : "+";
  });
});

/* Fake 24h countdown */
let t = 24*60*60;
const el = document.getElementById('countdown');
setInterval(()=>{
  t--; if(t<=0) t = 24*60*60;
  const h = String(Math.floor(t/3600)).padStart(2,'0');
  const m = String(Math.floor((t%3600)/60)).padStart(2,'0');
  const s = String(t%60).padStart(2,'0');
  el.textContent = `${h}:${m}:${s}`;
},1000);

/* Tilt */
const tilt = document.querySelector('.tilt');
if(tilt){
  tilt.addEventListener('mousemove', (e)=>{
    const r = tilt.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    const rx = ((y / r.height) - 0.5) * -8;
    const ry = ((x / r.width) - 0.5) * 8;
    tilt.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
  });
  tilt.addEventListener('mouseleave', ()=>{
    tilt.style.transform = `rotateX(0deg) rotateY(0deg)`;
  });
}

/* Counters */
const counters = document.querySelectorAll('[data-count]');
const cIO = new IntersectionObserver((entries)=>{
  entries.forEach(entry=>{
    if(!entry.isIntersecting) return;
    const el = entry.target;
    const target = parseInt(el.dataset.count,10);
    let val = 0;
    const step = Math.max(1, Math.floor(target/90));
    const id = setInterval(()=>{
      val += step;
      if(val >= target){ val = target; clearInterval(id); }
      el.textContent = val.toLocaleString();
    }, 18);
    cIO.unobserve(el);
  });
},{threshold:0.7});
counters.forEach(c=>cIO.observe(c));

/* DEMO VIDEO CONTROLS */
const video = document.getElementById("demoVideo");
const btnAutoplay = document.getElementById("toggleAutoplay");
const btnMute = document.getElementById("toggleMute");
const btnPlay = document.getElementById("togglePlay");
const centerBtn = document.getElementById("centerPlayBtn");

let autoplayOn = true;
let mutedOn = true;

if(video){
  video.muted = true;
  video.playsInline = true;
  video.loop = true;

  function syncUI(){
    if(btnAutoplay) btnAutoplay.textContent = `Autoplay: ${autoplayOn ? "ON" : "OFF"}`;
    if(btnMute) btnMute.textContent = `Mute: ${mutedOn ? "ON" : "OFF"}`;
    if(btnPlay) btnPlay.textContent = video.paused ? "Play" : "Pause";

    if(centerBtn){
      if(video.paused){
        centerBtn.classList.remove("is-playing");
        centerBtn.textContent = "▶";
      } else {
        centerBtn.classList.add("is-playing");
        centerBtn.textContent = "⏸";
      }
    }
  }

  const tryPlay = () => video.play().catch(()=>{});

  if(btnAutoplay){
    btnAutoplay.addEventListener("click", ()=>{
      autoplayOn = !autoplayOn;
      if(autoplayOn){
        video.muted = true;
        mutedOn = true;
        tryPlay();
      }
      syncUI();
    });
  }

  if(btnMute){
    btnMute.addEventListener("click", ()=>{
      mutedOn = !mutedOn;
      video.muted = mutedOn;
      if(!mutedOn) autoplayOn = false;
      syncUI();
    });
  }

  if(btnPlay){
    btnPlay.addEventListener("click", ()=>{
      if(video.paused) tryPlay();
      else video.pause();
      autoplayOn = !video.paused;
      syncUI();
    });
  }

  if(centerBtn){
    centerBtn.addEventListener("click", ()=>{
      if(video.paused) tryPlay();
      else video.pause();
      autoplayOn = !video.paused;
      syncUI();
    });
  }

  const vObserver = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting && autoplayOn){
        tryPlay();
        syncUI();
      }
    });
  },{threshold:0.35});

  vObserver.observe(video);

  video.addEventListener("play", syncUI);
  video.addEventListener("pause", syncUI);

  syncUI();
  if(autoplayOn) tryPlay();
}
