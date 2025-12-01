
(function(){

  const slider = document.querySelector(".tp-slider");
  const track = document.querySelector(".tp-track");
  const cards = document.querySelectorAll(".phone-card");
  const prev = document.querySelector(".tp-prev");
  const next = document.querySelector(".tp-next");

  let index = 0;
  let cardsPerView = 3;

  function updateView(){
    let w = window.innerWidth;

    if(w > 860) cardsPerView = 3;
    else if(w > 580) cardsPerView = 2;
    else cardsPerView = 1;

    slider.dataset.view = cardsPerView;
    move();
  }

  function move(){
    const cardWidth = cards[0].offsetWidth + 20; // gap = 20px
    track.style.transform = `translateX(-${index * cardWidth}px)`;
  }

  function nextSlide(){
    if(index < cards.length - cardsPerView) index++;
    else index = 0;
    move();
  }

  function prevSlide(){
    if(index > 0) index--;
    else index = cards.length - cardsPerView;
    move();
  }

  next.onclick = nextSlide;
  prev.onclick = prevSlide;

  let auto = setInterval(nextSlide, 3000);

  slider.addEventListener("mouseenter", ()=> clearInterval(auto));
  slider.addEventListener("mouseleave", ()=> auto = setInterval(nextSlide, 3000));

  // Mobile flip
  cards.forEach(card=>{
    card.addEventListener("click", ()=>{
      if(window.innerWidth < 1024){
        card.classList.toggle("tp-flip");
      }
    });
  });

  window.addEventListener("resize", updateView);
  updateView();

})();



// ================== UTIL ==================
const clamp = (v, min, max) => v < min ? min : (v > max ? max : v);

// ================== SCROLL STACK (fs-card) ==================
const section   = document.getElementById('featureStackSection');
const cards     = section ? Array.from(section.querySelectorAll('.fs-card')) : [];
const stackEl   = document.getElementById('fsStack');

function setSectionHeight() {
  if (!section || !cards.length) return;

  const vh     = window.innerHeight;
  const moving = Math.max(cards.length - 1, 1); // first card fixed
  const total  = vh * (1 + moving * 3);         // har moving card ko ~2 viewport scroll

  section.style.height = total + 'px';
}

function updateStackOnScroll() {
  if (!section || !stackEl || !cards.length) return;

  const vh          = window.innerHeight;
  const sectionTop  = section.offsetTop;
  const scrollY     = window.scrollY;
  const sectionH    = section.offsetHeight;
  const stackHeight = stackEl.clientHeight;

  const raw        = scrollY - sectionTop;
  const scrollable = Math.max(sectionH - vh, 1);
  const t          = clamp(raw / scrollable, 0, 1); // 0..1 overall progress

  const moving = cards.length - 1;
  const step   = 1 / Math.max(moving, 1); // har moving card ka slot

  cards.forEach((card, index) => {
    card.style.zIndex = 10 + index;

    // CARD 0 pinned
    if (index === 0) {
      card.style.transform = 'translateY(0px)';
      card.style.opacity   = 1;
      return;
    }

    const slotIdx = index - 1;          // 0..moving-1
    const startT  = slotIdx * step;     // slot start
    const endT    = (slotIdx + 1) * step; // slot end

    let yPx, opacity;
    const startY = stackHeight + 140;
    const endY   = 20 * index;

    if (t <= startT) {
      // abhi time nahi aaya → niche hidden
      yPx     = startY;
      opacity = 0;
    } else if (t >= endT) {
      // poora stack ho chuka
      yPx     = endY;
      opacity = 1;
    } else {
      // active animation slot
      const local = (t - startT) / (endT - startT); // 0..1
      yPx     = startY - (startY - endY) * local;
      opacity = local;
    }

    card.style.transform = `translateY(${yPx}px)`;
    card.style.opacity   = opacity;
  });
}

// rAF throttling for scroll
let scrollTicking = false;
function onScroll() {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    updateStackOnScroll();
    scrollTicking = false;
  });
}

// ================== INNER SLIDERS (inner-slider) ==================
const sliders = Array.from(document.querySelectorAll('.inner-slider'));

sliders.forEach(slider => {
  const track = slider.querySelector('.inner-track');
  let slides  = Array.from(slider.querySelectorAll('.inner-slide'));
  const dots  = Array.from(slider.querySelectorAll('.inner-dot'));

  if (!track || slides.length <= 1) return;

  const slidesCount = slides.length;

  // loop ke liye first clone
  const firstClone = slides[0].cloneNode(true);
  track.appendChild(firstClone);
  slides = Array.from(slider.querySelectorAll('.inner-slide'));

  let index            = 0;
  let isTransitioning  = false;
  let autoTimer        = null;
  const INTERVAL_MS    = 3000;

  function updateDots() {
    if (!dots.length) return;
    const active = index % slidesCount;
    dots.forEach((d, i) => d.classList.toggle('is-active', i === active));
  }

  function goNext() {
    if (isTransitioning) return;
    isTransitioning = true;
    index++;
    track.style.transition = 'transform 0.6s ease';
    track.style.transform  = `translateX(-${index * 100}%)`;
    updateDots();
  }

  function resetToStartIfNeeded() {
    isTransitioning = false;
    if (index === slidesCount) {
      // clone par aa gaya → instant back
      track.style.transition = 'none';
      index = 0;
      track.style.transform = 'translateX(0)';
      // force reflow to re-enable transition
      void track.offsetWidth;
      track.style.transition = 'transform 0.6s ease';
      updateDots();
    }
  }

  track.addEventListener('transitionend', resetToStartIfNeeded);

  function startAuto() {
    stopAuto();
    autoTimer = setInterval(goNext, INTERVAL_MS);
  }
  function stopAuto() {
    if (autoTimer) {
      clearInterval(autoTimer);
      autoTimer = null;
    }
  }

  // user hover / touch → autoplay band (optimize UX)
  slider.addEventListener('mouseenter', stopAuto);
  slider.addEventListener('mouseleave', startAuto);
  slider.addEventListener('touchstart', stopAuto, { passive: true });

  // initial state
  updateDots();
  startAuto();
});

// ================== TIKTOK PHONE REEL SCROLLER ==================
class TpReel {
  constructor(phoneEl) {
    this.phone     = phoneEl;
    this.windowEl  = phoneEl.querySelector('.tp-reel-window');
    this.track     = phoneEl.querySelector('.tp-reel-track');
    this.slides    = Array.from(phoneEl.querySelectorAll('.tp-reel-slide'));
    this.index     = 0;
    this.animating = false;
    this.INTERVAL  = 5000;
    this.timer     = null;

    if (!this.windowEl || !this.track || !this.slides.length) return;

    this.setHeights       = this.setHeights.bind(this);
    this.nextSlide        = this.nextSlide.bind(this);
    this.onTransitionEnd  = this.onTransitionEnd.bind(this);

    this.init();
  }

  setHeights() {
    const h = this.phone.getBoundingClientRect().height;
    this.windowEl.style.height = h + 'px';
    this.slides.forEach(slide => {
      slide.style.height = h + 'px';
    });
    this.track.style.transition = 'none';
    this.track.style.transform  = `translateY(-${this.index * h}px)`;
  }

  moveTo(i, animate) {
    const h = this.phone.getBoundingClientRect().height;
    this.track.style.transition = animate
      ? 'transform 0.7s cubic-bezier(0.22,0.61,0.36,1)'
      : 'none';
    this.track.style.transform = `translateY(-${i * h}px)`;
  }

  nextSlide() {
    if (this.animating) return;
    this.animating = true;
    this.index += 1;
    this.moveTo(this.index, true);
  }

  onTransitionEnd() {
    const lastIndex = this.slides.length - 1;
    if (this.index === lastIndex) {
      this.index = 0;
      this.moveTo(this.index, false);
    }
    this.animating = false;
  }

  startAuto() {
    this.stopAuto();
    this.timer = setInterval(() => this.nextSlide(), this.INTERVAL);
  }

  stopAuto() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  init() {
    this.setHeights();
    this.track.addEventListener('transitionend', this.onTransitionEnd);
    this.startAuto();
  }
}

const reels = [];

window.addEventListener('load', () => {
  // init scroll stack height + position
  setSectionHeight();
  updateStackOnScroll();

  // init reels
  const phones = Array.from(document.querySelectorAll('#tp-phone-slider .tp-phone'));
  phones.forEach(p => {
    const reel = new TpReel(p);
    if (reel && reel.setHeights) {
      reels.push(reel);
    }
  });
});

// global scroll + resize
window.addEventListener('scroll', onScroll);

window.addEventListener('resize', () => {
  setSectionHeight();
  updateStackOnScroll();           // ensure stack position fixes on resize
  reels.forEach(r => r.setHeights && r.setHeights());
});

// ================== FUNNEL CARDS AUTOPLAY + PROGRESS ==================
const funnelCards = document.querySelectorAll('.funnel-step');
const bar         = document.getElementById('funnelProgressBar');
const total       = funnelCards.length;

let activeIndex   = 0;
let autoTimer     = null;

const funnelObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      funnelObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

funnelCards.forEach(c => funnelObserver.observe(c));

function setActive(index) {
  if (!total || !bar) return;

  activeIndex = index;
  funnelCards.forEach((card, i) => {
    card.classList.toggle('active', i === index);
  });

  const progress = (index + 1) / total;
  bar.style.transform = `scaleX(${progress})`;
}

function startFunnelAuto() {
  stopFunnelAuto();
  if (!total) return;
  autoTimer = setInterval(() => {
    const next = (activeIndex + 1) % total;
    setActive(next);
  }, 2600);
}

function stopFunnelAuto() {
  if (autoTimer) {
    clearInterval(autoTimer);
    autoTimer = null;
  }
}

if (total && bar) {
  setActive(0);
  startFunnelAuto();

  funnelCards.forEach((card, i) => {
    card.addEventListener('mouseenter', () => {
      setActive(i);
      stopFunnelAuto();
    });
    card.addEventListener('click', () => setActive(i));
  });
}

// ================== SCROLL-IN REASONS ==================
const reasons = document.querySelectorAll('.reason');

const reasonsObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      reasonsObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

reasons.forEach((item, idx) => {
  item.style.transitionDelay = (idx * 0.06) + 's';
  reasonsObserver.observe(item);
});
