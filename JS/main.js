// script.js (FINAL ONE-SHOT PROPER)
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
