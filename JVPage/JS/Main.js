
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


//////////////////////////////



(function(){
  const modal  = document.getElementById('tpDemoModal');
  const video  = document.getElementById('tpDemoVideo');
  const btn    = document.querySelector('.tp-proof-btn');
  const box    = document.querySelector('.tp-proof-demo-box');
  const close  = document.querySelector('.tp-modal-close');

  function openModal(){
    if(!modal) return;
    modal.classList.add('tp-open');
    if(video){
      video.currentTime = 0;
      video.play().catch(()=>{});
    }
  }

  function closeModal(){
    if(!modal) return;
    modal.classList.remove('tp-open');
    if(video){
      video.pause();
    }
  }

  if(btn)  btn.addEventListener('click', openModal);
  if(box)  box.addEventListener('click', openModal);
  if(close) close.addEventListener('click', closeModal);

  if(modal){
    modal.addEventListener('click', function(e){
      if(e.target === modal){
        closeModal();
      }
    });
  }
})();






// Premium feature video slider (dynamic dots + stops auto on user interaction)
(function () {
  const track = document.querySelector(".fv-track");
  const cards = Array.from(document.querySelectorAll(".fv-card"));
  const dotsContainer = document.querySelector(".fv-dots");

  if (!track || cards.length === 0 || !dotsContainer) return;

  let currentIndex = 0;
  let autoTimer = null;
  const AUTO_DELAY = 7000; // 7 seconds
  let dots = [];
  let isUserInteracting = false;
  let positions = [];

  // --- Har slide ka exact X position (left) calculate karo
  function computePositions() {
    positions = cards.map((card) => card.offsetLeft);
  }

  function buildDots() {
    dotsContainer.innerHTML = "";
    dots = cards.map((_, i) => {
      const dot = document.createElement("button");
      dot.className = "fv-dot" + (i === 0 ? " is-active" : "");
      dotsContainer.appendChild(dot);

      dot.addEventListener("click", () => {
        isUserInteracting = true;
        goToSlide(i, false);
      });

      return dot;
    });
  }

  function syncVideos(activeIndex) {
    cards.forEach((card, index) => {
      const video = card.querySelector(".fv-video");
      const playBtn = card.querySelector('[data-role="play"]');
      if (!video) return;

      if (index === activeIndex && !video.paused && !video.ended) {
        // already playing
      } else if (index === activeIndex) {
        video.play().catch(() => {});
        if (playBtn) playBtn.textContent = "⏸ Pause";
      } else {
        video.pause();
        if (playBtn) playBtn.textContent = "▶ Play";
      }
    });
  }

  function setActiveDot(activeIndex) {
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === activeIndex);
    });
  }

  /**
   * goToSlide
   * @param {number} index - slide index
   * @param {boolean} fromAuto - true if called from autoplay/resize
   */
  function goToSlide(index, fromAuto) {
    if (!positions.length) computePositions();

    currentIndex = (index + cards.length) % cards.length;

    // yaha se magic: jo card visible hona hai uska exact left offset
    const offset = positions[currentIndex] || 0;

    track.style.transform = `translateX(-${offset}px)`;

    setActiveDot(currentIndex);
    syncVideos(currentIndex);

    if (!fromAuto) {
      resetAuto();
    }
  }

  function resetAuto() {
    if (isUserInteracting) return;
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      goToSlide(currentIndex + 1, true); // fromAuto = true
    }, AUTO_DELAY);
  }

  // video control buttons
  cards.forEach((card) => {
    const video = card.querySelector(".fv-video");
    const playBtn = card.querySelector('[data-role="play"]');
    const muteBtn = card.querySelector('[data-role="mute"]');

    if (!video) return;

    video.muted = true; // start muted (for autoplay policy)

    if (playBtn) {
      playBtn.addEventListener("click", () => {
        isUserInteracting = true;
        if (video.paused) {
          video.play().catch(() => {});
          playBtn.textContent = "⏸ Pause";
        } else {
          video.pause();
          playBtn.textContent = "▶ Play";
        }
        if (autoTimer) {
          clearInterval(autoTimer);
          autoTimer = null;
        }
      });
    }

    if (muteBtn) {
      muteBtn.addEventListener("click", () => {
        isUserInteracting = true;
        video.muted = !video.muted;
        muteBtn.textContent = video.muted ? "🔇 Mute" : "🔊 Sound On";

        if (video.paused) {
          video.play().catch(() => {});
        }

        if (autoTimer) {
          clearInterval(autoTimer);
          autoTimer = null;
        }
      });
    }
  });

  // Resize pe layout change hoga, to positions dobara calculate karo
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      computePositions();
      goToSlide(currentIndex, true); // fromAuto = true, timer disturb na ho
    }, 150);
  });

  // INIT
  computePositions();
  buildDots();
  goToSlide(0, false);
  resetAuto();
})();






// Premium feature video slider 2 (dynamic dots + stops auto on user interaction)
(function () {
  const track = document.querySelector(".tpv-track");
  const cards = Array.from(document.querySelectorAll(".tpv-card"));
  const dotsContainer = document.querySelector(".tpv-dots");

  if (!track || cards.length === 0 || !dotsContainer) return;

  let currentIndex = 0;
  let autoTimer = null;
  const AUTO_DELAY = 7000; // 7 seconds
  let dots = [];
  let isUserInteracting = false;
  let positions = [];

  // --- Har slide ka exact X position (left) calculate karo
  function computePositions() {
    positions = cards.map((card) => card.offsetLeft);
  }

  function buildDots() {
    dotsContainer.innerHTML = "";
    dots = cards.map((_, i) => {
      const dot = document.createElement("button");
      dot.className = "tpv-dot" + (i === 0 ? " is-active" : "");
      dotsContainer.appendChild(dot);

      dot.addEventListener("click", () => {
        isUserInteracting = true;
        goToSlide(i, false);
      });

      return dot;
    });
  }

  function syncVideos(activeIndex) {
    cards.forEach((card, index) => {
      const video = card.querySelector(".tpv-video");
      const playBtn = card.querySelector('[data-role="play"]');
      if (!video) return;

      if (index === activeIndex && !video.paused && !video.ended) {
        // already playing
      } else if (index === activeIndex) {
        video.play().catch(() => {});
        if (playBtn) playBtn.textContent = "⏸ Pause";
      } else {
        video.pause();
        if (playBtn) playBtn.textContent = "▶ Play";
      }
    });
  }

  function setActiveDot(activeIndex) {
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === activeIndex);
    });
  }

  /**
   * goToSlide
   * @param {number} index - slide index
   * @param {boolean} fromAuto - true if called from autoplay/resize
   */
  function goToSlide(index, fromAuto) {
    if (!positions.length) computePositions();

    currentIndex = (index + cards.length) % cards.length;

    // yaha se magic: jo card visible hona hai uska exact left offset
    const offset = positions[currentIndex] || 0;

    track.style.transform = `translateX(-${offset}px)`;

    setActiveDot(currentIndex);
    syncVideos(currentIndex);

    if (!fromAuto) {
      resetAuto();
    }
  }

  function resetAuto() {
    if (isUserInteracting) return;
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      goToSlide(currentIndex + 1, true); // fromAuto = true
    }, AUTO_DELAY);
  }

  // video control buttons
  cards.forEach((card) => {
    const video = card.querySelector(".tpv-video");
    const playBtn = card.querySelector('[data-role="play"]');
    const muteBtn = card.querySelector('[data-role="mute"]');

    if (!video) return;

    video.muted = true; // start muted (for autoplay policy)

    if (playBtn) {
      playBtn.addEventListener("click", () => {
        isUserInteracting = true;
        if (video.paused) {
          video.play().catch(() => {});
          playBtn.textContent = "⏸ Pause";
        } else {
          video.pause();
          playBtn.textContent = "▶ Play";
        }
        if (autoTimer) {
          clearInterval(autoTimer);
          autoTimer = null;
        }
      });
    }

    if (muteBtn) {
      muteBtn.addEventListener("click", () => {
        isUserInteracting = true;
        video.muted = !video.muted;
        muteBtn.textContent = video.muted ? "🔇 Mute" : "🔊 Sound On";

        if (video.paused) {
          video.play().catch(() => {});
        }

        if (autoTimer) {
          clearInterval(autoTimer);
          autoTimer = null;
        }
      });
    }
  });

  // Resize pe layout change hoga, to positions dobara calculate karo
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      computePositions();
      goToSlide(currentIndex, true); // fromAuto = true, timer disturb na ho
    }, 150);
  });

  // INIT
  computePositions();
  buildDots();
  goToSlide(0, false);
  resetAuto();
})();




// Premium feature video slider (Section 3) – independent instance
// Premium feature video slider (dynamic dots + stops auto on user interaction)
(function () {
  const track = document.querySelector(".tp3-track");
  const cards = Array.from(document.querySelectorAll(".tp3-card"));
  const dotsContainer = document.querySelector(".tp3-dots");

  if (!track || cards.length === 0 || !dotsContainer) return;

  let currentIndex = 0;
  let autoTimer = null;
  const AUTO_DELAY = 7000; // 7 seconds
  let dots = [];
  let isUserInteracting = false;
  let positions = [];

  // --- Har slide ka exact X position (left) calculate karo
  function computePositions() {
    positions = cards.map((card) => card.offsetLeft);
  }

  function buildDots() {
    dotsContainer.innerHTML = "";
    dots = cards.map((_, i) => {
      const dot = document.createElement("button");
      dot.className = "tp3-dot" + (i === 0 ? " is-active" : "");
      dotsContainer.appendChild(dot);

      dot.addEventListener("click", () => {
        isUserInteracting = true;
        goToSlide(i, false);
      });

      return dot;
    });
  }

  function syncVideos(activeIndex) {
    cards.forEach((card, index) => {
      const video = card.querySelector(".tp3-video");
      const playBtn = card.querySelector('[data-role="play"]');
      if (!video) return;

      if (index === activeIndex && !video.paused && !video.ended) {
        // already playing
      } else if (index === activeIndex) {
        video.play().catch(() => {});
        if (playBtn) playBtn.textContent = "⏸ Pause";
      } else {
        video.pause();
        if (playBtn) playBtn.textContent = "▶ Play";
      }
    });
  }

  function setActiveDot(activeIndex) {
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === activeIndex);
    });
  }

  /**
   * goToSlide
   * @param {number} index - slide index
   * @param {boolean} fromAuto - true if called from autoplay/resize
   */
  function goToSlide(index, fromAuto) {
    if (!positions.length) computePositions();

    currentIndex = (index + cards.length) % cards.length;

    // yaha se magic: jo card visible hona hai uska exact left offset
    const offset = positions[currentIndex] || 0;

    track.style.transform = `translateX(-${offset}px)`;

    setActiveDot(currentIndex);
    syncVideos(currentIndex);

    if (!fromAuto) {
      resetAuto();
    }
  }

  function resetAuto() {
    if (isUserInteracting) return;
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      goToSlide(currentIndex + 1, true); // fromAuto = true
    }, AUTO_DELAY);
  }

  // video control buttons
  cards.forEach((card) => {
    const video = card.querySelector(".tp3-video");
    const playBtn = card.querySelector('[data-role="play"]');
    const muteBtn = card.querySelector('[data-role="mute"]');

    if (!video) return;

    video.muted = true; // start muted (for autoplay policy)

    if (playBtn) {
      playBtn.addEventListener("click", () => {
        isUserInteracting = true;
        if (video.paused) {
          video.play().catch(() => {});
          playBtn.textContent = "⏸ Pause";
        } else {
          video.pause();
          playBtn.textContent = "▶ Play";
        }
        if (autoTimer) {
          clearInterval(autoTimer);
          autoTimer = null;
        }
      });
    }

    if (muteBtn) {
      muteBtn.addEventListener("click", () => {
        isUserInteracting = true;
        video.muted = !video.muted;
        muteBtn.textContent = video.muted ? "🔇 Mute" : "🔊 Sound On";

        if (video.paused) {
          video.play().catch(() => {});
        }

        if (autoTimer) {
          clearInterval(autoTimer);
          autoTimer = null;
        }
      });
    }
  });

  // Resize pe layout change hoga, to positions dobara calculate karo
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      computePositions();
      goToSlide(currentIndex, true); // fromAuto = true, timer disturb na ho
    }, 150);
  });

  // INIT
  computePositions();
  buildDots();
  goToSlide(0, false);
  resetAuto();
})();


// Premium feature video slider #3 (Section 4) – independent instance

(function () {
  const track = document.querySelector(".tp4-track");
  const cards = Array.from(document.querySelectorAll(".tp4-card"));
  const dotsContainer = document.querySelector(".tp4-dots");

  if (!track || cards.length === 0 || !dotsContainer) return;

  let currentIndex = 0;
  let autoTimer = null;
  const AUTO_DELAY = 7000; // 7 seconds
  let dots = [];
  let isUserInteracting = false;
  let positions = [];

  // --- Har slide ka exact X position (left) calculate karo
  function computePositions() {
    positions = cards.map((card) => card.offsetLeft);
  }

  function buildDots() {
    dotsContainer.innerHTML = "";
    dots = cards.map((_, i) => {
      const dot = document.createElement("button");
      dot.className = "tp4-dot" + (i === 0 ? " is-active" : "");
      dotsContainer.appendChild(dot);

      dot.addEventListener("click", () => {
        isUserInteracting = true;
        goToSlide(i, false);
      });

      return dot;
    });
  }

  function syncVideos(activeIndex) {
    cards.forEach((card, index) => {
      const video = card.querySelector(".tp4-video");
      const playBtn = card.querySelector('[data-role="play"]');
      if (!video) return;

      if (index === activeIndex && !video.paused && !video.ended) {
        // already playing
      } else if (index === activeIndex) {
        video.play().catch(() => {});
        if (playBtn) playBtn.textContent = "⏸ Pause";
      } else {
        video.pause();
        if (playBtn) playBtn.textContent = "▶ Play";
      }
    });
  }

  function setActiveDot(activeIndex) {
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === activeIndex);
    });
  }

  /**
   * goToSlide
   * @param {number} index - slide index
   * @param {boolean} fromAuto - true if called from autoplay/resize
   */
  function goToSlide(index, fromAuto) {
    if (!positions.length) computePositions();

    currentIndex = (index + cards.length) % cards.length;

    // yaha se magic: jo card visible hona hai uska exact left offset
    const offset = positions[currentIndex] || 0;

    track.style.transform = `translateX(-${offset}px)`;

    setActiveDot(currentIndex);
    syncVideos(currentIndex);

    if (!fromAuto) {
      resetAuto();
    }
  }

  function resetAuto() {
    if (isUserInteracting) return;
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      goToSlide(currentIndex + 1, true); // fromAuto = true
    }, AUTO_DELAY);
  }

  // video control buttons
  cards.forEach((card) => {
    const video = card.querySelector(".tp4-video");
    const playBtn = card.querySelector('[data-role="play"]');
    const muteBtn = card.querySelector('[data-role="mute"]');

    if (!video) return;

    video.muted = true; // start muted (for autoplay policy)

    if (playBtn) {
      playBtn.addEventListener("click", () => {
        isUserInteracting = true;
        if (video.paused) {
          video.play().catch(() => {});
          playBtn.textContent = "⏸ Pause";
        } else {
          video.pause();
          playBtn.textContent = "▶ Play";
        }
        if (autoTimer) {
          clearInterval(autoTimer);
          autoTimer = null;
        }
      });
    }

    if (muteBtn) {
      muteBtn.addEventListener("click", () => {
        isUserInteracting = true;
        video.muted = !video.muted;
        muteBtn.textContent = video.muted ? "🔇 Mute" : "🔊 Sound On";

        if (video.paused) {
          video.play().catch(() => {});
        }

        if (autoTimer) {
          clearInterval(autoTimer);
          autoTimer = null;
        }
      });
    }
  });

  // Resize pe layout change hoga, to positions dobara calculate karo
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      computePositions();
      goToSlide(currentIndex, true); // fromAuto = true, timer disturb na ho
    }, 150);
  });

  // INIT
  computePositions();
  buildDots();
  goToSlide(0, false);
  resetAuto();
})();



// Premium feature video slider #4 (Section 5) – independent instance

(function () {
  const track = document.querySelector(".tp5-track");
  const cards = Array.from(document.querySelectorAll(".tp5-card"));
  const dotsContainer = document.querySelector(".tp5-dots");

  if (!track || cards.length === 0 || !dotsContainer) return;

  let currentIndex = 0;
  let autoTimer = null;
  const AUTO_DELAY = 7000; // 7 seconds
  let dots = [];
  let isUserInteracting = false;
  let positions = [];

  // --- Har slide ka exact X position (left) calculate karo
  function computePositions() {
    positions = cards.map((card) => card.offsetLeft);
  }

  function buildDots() {
    dotsContainer.innerHTML = "";
    dots = cards.map((_, i) => {
      const dot = document.createElement("button");
      dot.className = "tp5-dot" + (i === 0 ? " is-active" : "");
      dotsContainer.appendChild(dot);

      dot.addEventListener("click", () => {
        isUserInteracting = true;
        goToSlide(i, false);
      });

      return dot;
    });
  }

  function syncVideos(activeIndex) {
    cards.forEach((card, index) => {
      const video = card.querySelector(".tp5-video");
      const playBtn = card.querySelector('[data-role="play"]');
      if (!video) return;

      if (index === activeIndex && !video.paused && !video.ended) {
        // already playing
      } else if (index === activeIndex) {
        video.play().catch(() => {});
        if (playBtn) playBtn.textContent = "⏸ Pause";
      } else {
        video.pause();
        if (playBtn) playBtn.textContent = "▶ Play";
      }
    });
  }

  function setActiveDot(activeIndex) {
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === activeIndex);
    });
  }

  /**
   * goToSlide
   * @param {number} index - slide index
   * @param {boolean} fromAuto - true if called from autoplay/resize
   */
  function goToSlide(index, fromAuto) {
    if (!positions.length) computePositions();

    currentIndex = (index + cards.length) % cards.length;

    // yaha se magic: jo card visible hona hai uska exact left offset
    const offset = positions[currentIndex] || 0;

    track.style.transform = `translateX(-${offset}px)`;

    setActiveDot(currentIndex);
    syncVideos(currentIndex);

    if (!fromAuto) {
      resetAuto();
    }
  }

  function resetAuto() {
    if (isUserInteracting) return;
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      goToSlide(currentIndex + 1, true); // fromAuto = true
    }, AUTO_DELAY);
  }

  // video control buttons
  cards.forEach((card) => {
    const video = card.querySelector(".tp5-video");
    const playBtn = card.querySelector('[data-role="play"]');
    const muteBtn = card.querySelector('[data-role="mute"]');

    if (!video) return;

    video.muted = true; // start muted (for autoplay policy)

    if (playBtn) {
      playBtn.addEventListener("click", () => {
        isUserInteracting = true;
        if (video.paused) {
          video.play().catch(() => {});
          playBtn.textContent = "⏸ Pause";
        } else {
          video.pause();
          playBtn.textContent = "▶ Play";
        }
        if (autoTimer) {
          clearInterval(autoTimer);
          autoTimer = null;
        }
      });
    }

    if (muteBtn) {
      muteBtn.addEventListener("click", () => {
        isUserInteracting = true;
        video.muted = !video.muted;
        muteBtn.textContent = video.muted ? "🔇 Mute" : "🔊 Sound On";

        if (video.paused) {
          video.play().catch(() => {});
        }

        if (autoTimer) {
          clearInterval(autoTimer);
          autoTimer = null;
        }
      });
    }
  });

  // Resize pe layout change hoga, to positions dobara calculate karo
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      computePositions();
      goToSlide(currentIndex, true); // fromAuto = true, timer disturb na ho
    }, 150);
  });

  // INIT
  computePositions();
  buildDots();
  goToSlide(0, false);
  resetAuto();
})();


// Premium feature video slider #5 (Section 6) – independent instance
(function () {
  const track = document.querySelector(".tp6-track");
  const cards = Array.from(document.querySelectorAll(".tp6-card"));
  const dotsContainer = document.querySelector(".tp6-dots");

  if (!track || cards.length === 0 || !dotsContainer) return;

  let currentIndex = 0;
  let autoTimer = null;
  const AUTO_DELAY = 7000; // 7 seconds
  let dots = [];
  let isUserInteracting = false;
  let positions = [];

  // --- Har slide ka exact X position (left) calculate karo
  function computePositions() {
    positions = cards.map((card) => card.offsetLeft);
  }

  function buildDots() {
    dotsContainer.innerHTML = "";
    dots = cards.map((_, i) => {
      const dot = document.createElement("button");
      dot.className = "tp6-dot" + (i === 0 ? " is-active" : "");
      dotsContainer.appendChild(dot);

      dot.addEventListener("click", () => {
        isUserInteracting = true;
        goToSlide(i, false);
      });

      return dot;
    });
  }

  function syncVideos(activeIndex) {
    cards.forEach((card, index) => {
      const video = card.querySelector(".tp6-video");
      const playBtn = card.querySelector('[data-role="play"]');
      if (!video) return;

      if (index === activeIndex && !video.paused && !video.ended) {
        // already playing
      } else if (index === activeIndex) {
        video.play().catch(() => {});
        if (playBtn) playBtn.textContent = "⏸ Pause";
      } else {
        video.pause();
        if (playBtn) playBtn.textContent = "▶ Play";
      }
    });
  }

  function setActiveDot(activeIndex) {
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === activeIndex);
    });
  }

  /**
   * goToSlide
   * @param {number} index - slide index
   * @param {boolean} fromAuto - true if called from autoplay/resize
   */
  function goToSlide(index, fromAuto) {
    if (!positions.length) computePositions();

    currentIndex = (index + cards.length) % cards.length;

    // yaha se magic: jo card visible hona hai uska exact left offset
    const offset = positions[currentIndex] || 0;

    track.style.transform = `translateX(-${offset}px)`;

    setActiveDot(currentIndex);
    syncVideos(currentIndex);

    if (!fromAuto) {
      resetAuto();
    }
  }

  function resetAuto() {
    if (isUserInteracting) return;
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      goToSlide(currentIndex + 1, true); // fromAuto = true
    }, AUTO_DELAY);
  }

  // video control buttons
  cards.forEach((card) => {
    const video = card.querySelector(".tp6-video");
    const playBtn = card.querySelector('[data-role="play"]');
    const muteBtn = card.querySelector('[data-role="mute"]');

    if (!video) return;

    video.muted = true; // start muted (for autoplay policy)

    if (playBtn) {
      playBtn.addEventListener("click", () => {
        isUserInteracting = true;
        if (video.paused) {
          video.play().catch(() => {});
          playBtn.textContent = "⏸ Pause";
        } else {
          video.pause();
          playBtn.textContent = "▶ Play";
        }
        if (autoTimer) {
          clearInterval(autoTimer);
          autoTimer = null;
        }
      });
    }

    if (muteBtn) {
      muteBtn.addEventListener("click", () => {
        isUserInteracting = true;
        video.muted = !video.muted;
        muteBtn.textContent = video.muted ? "🔇 Mute" : "🔊 Sound On";

        if (video.paused) {
          video.play().catch(() => {});
        }

        if (autoTimer) {
          clearInterval(autoTimer);
          autoTimer = null;
        }
      });
    }
  });

  // Resize pe layout change hoga, to positions dobara calculate karo
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      computePositions();
      goToSlide(currentIndex, true); // fromAuto = true, timer disturb na ho
    }, 150);
  });

  // INIT
  computePositions();
  buildDots();
  goToSlide(0, false);
  resetAuto();
})();



// Premium feature video slider #6 (Section 7) – independent instance

(function () {
  const track = document.querySelector(".tp7-track");
  const cards = Array.from(document.querySelectorAll(".tp7-card"));
  const dotsContainer = document.querySelector(".tp7-dots");

  if (!track || cards.length === 0 || !dotsContainer) return;

  let currentIndex = 0;
  let autoTimer = null;
  const AUTO_DELAY = 7000; // 7 seconds
  let dots = [];
  let isUserInteracting = false;
  let positions = [];

  // --- Har slide ka exact X position (left) calculate karo
  function computePositions() {
    positions = cards.map((card) => card.offsetLeft);
  }

  function buildDots() {
    dotsContainer.innerHTML = "";
    dots = cards.map((_, i) => {
      const dot = document.createElement("button");
      dot.className = "tp7-dot" + (i === 0 ? " is-active" : "");
      dotsContainer.appendChild(dot);

      dot.addEventListener("click", () => {
        isUserInteracting = true;
        goToSlide(i, false);
      });

      return dot;
    });
  }

  function syncVideos(activeIndex) {
    cards.forEach((card, index) => {
      const video = card.querySelector(".tp7-video");
      const playBtn = card.querySelector('[data-role="play"]');
      if (!video) return;

      if (index === activeIndex && !video.paused && !video.ended) {
        // already playing
      } else if (index === activeIndex) {
        video.play().catch(() => {});
        if (playBtn) playBtn.textContent = "⏸ Pause";
      } else {
        video.pause();
        if (playBtn) playBtn.textContent = "▶ Play";
      }
    });
  }

  function setActiveDot(activeIndex) {
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === activeIndex);
    });
  }

  /**
   * goToSlide
   * @param {number} index - slide index
   * @param {boolean} fromAuto - true if called from autoplay/resize
   */
  function goToSlide(index, fromAuto) {
    if (!positions.length) computePositions();

    currentIndex = (index + cards.length) % cards.length;

    // yaha se magic: jo card visible hona hai uska exact left offset
    const offset = positions[currentIndex] || 0;

    track.style.transform = `translateX(-${offset}px)`;

    setActiveDot(currentIndex);
    syncVideos(currentIndex);

    if (!fromAuto) {
      resetAuto();
    }
  }

  function resetAuto() {
    if (isUserInteracting) return;
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      goToSlide(currentIndex + 1, true); // fromAuto = true
    }, AUTO_DELAY);
  }

  // video control buttons
  cards.forEach((card) => {
    const video = card.querySelector(".tp7-video");
    const playBtn = card.querySelector('[data-role="play"]');
    const muteBtn = card.querySelector('[data-role="mute"]');

    if (!video) return;

    video.muted = true; // start muted (for autoplay policy)

    if (playBtn) {
      playBtn.addEventListener("click", () => {
        isUserInteracting = true;
        if (video.paused) {
          video.play().catch(() => {});
          playBtn.textContent = "⏸ Pause";
        } else {
          video.pause();
          playBtn.textContent = "▶ Play";
        }
        if (autoTimer) {
          clearInterval(autoTimer);
          autoTimer = null;
        }
      });
    }

    if (muteBtn) {
      muteBtn.addEventListener("click", () => {
        isUserInteracting = true;
        video.muted = !video.muted;
        muteBtn.textContent = video.muted ? "🔇 Mute" : "🔊 Sound On";

        if (video.paused) {
          video.play().catch(() => {});
        }

        if (autoTimer) {
          clearInterval(autoTimer);
          autoTimer = null;
        }
      });
    }
  });

  // Resize pe layout change hoga, to positions dobara calculate karo
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      computePositions();
      goToSlide(currentIndex, true); // fromAuto = true, timer disturb na ho
    }, 150);
  });

  // INIT
  computePositions();
  buildDots();
  goToSlide(0, false);
  resetAuto();
})();



// Premium feature video slider #7 (Section 8) – independent instance

(function () {
  const track = document.querySelector(".tp8-track");
  const cards = Array.from(document.querySelectorAll(".tp8-card"));
  const dotsContainer = document.querySelector(".tp8-dots");

  if (!track || cards.length === 0 || !dotsContainer) return;

  let currentIndex = 0;
  let autoTimer = null;
  const AUTO_DELAY = 7000; // 7 seconds
  let dots = [];
  let isUserInteracting = false;
  let positions = [];

  // --- Har slide ka exact X position (left) calculate karo
  function computePositions() {
    positions = cards.map((card) => card.offsetLeft);
  }

  function buildDots() {
    dotsContainer.innerHTML = "";
    dots = cards.map((_, i) => {
      const dot = document.createElement("button");
      dot.className = "tp8-dot" + (i === 0 ? " is-active" : "");
      dotsContainer.appendChild(dot);

      dot.addEventListener("click", () => {
        isUserInteracting = true;
        goToSlide(i, false);
      });

      return dot;
    });
  }

  function syncVideos(activeIndex) {
    cards.forEach((card, index) => {
      const video = card.querySelector(".tp8-video");
      const playBtn = card.querySelector('[data-role="play"]');
      if (!video) return;

      if (index === activeIndex && !video.paused && !video.ended) {
        // already playing
      } else if (index === activeIndex) {
        video.play().catch(() => {});
        if (playBtn) playBtn.textContent = "⏸ Pause";
      } else {
        video.pause();
        if (playBtn) playBtn.textContent = "▶ Play";
      }
    });
  }

  function setActiveDot(activeIndex) {
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === activeIndex);
    });
  }

  /**
   * goToSlide
   * @param {number} index - slide index
   * @param {boolean} fromAuto - true if called from autoplay/resize
   */
  function goToSlide(index, fromAuto) {
    if (!positions.length) computePositions();

    currentIndex = (index + cards.length) % cards.length;

    // yaha se magic: jo card visible hona hai uska exact left offset
    const offset = positions[currentIndex] || 0;

    track.style.transform = `translateX(-${offset}px)`;

    setActiveDot(currentIndex);
    syncVideos(currentIndex);

    if (!fromAuto) {
      resetAuto();
    }
  }

  function resetAuto() {
    if (isUserInteracting) return;
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      goToSlide(currentIndex + 1, true); // fromAuto = true
    }, AUTO_DELAY);
  }

  // video control buttons
  cards.forEach((card) => {
    const video = card.querySelector(".tp8-video");
    const playBtn = card.querySelector('[data-role="play"]');
    const muteBtn = card.querySelector('[data-role="mute"]');

    if (!video) return;

    video.muted = true; // start muted (for autoplay policy)

    if (playBtn) {
      playBtn.addEventListener("click", () => {
        isUserInteracting = true;
        if (video.paused) {
          video.play().catch(() => {});
          playBtn.textContent = "⏸ Pause";
        } else {
          video.pause();
          playBtn.textContent = "▶ Play";
        }
        if (autoTimer) {
          clearInterval(autoTimer);
          autoTimer = null;
        }
      });
    }

    if (muteBtn) {
      muteBtn.addEventListener("click", () => {
        isUserInteracting = true;
        video.muted = !video.muted;
        muteBtn.textContent = video.muted ? "🔇 Mute" : "🔊 Sound On";

        if (video.paused) {
          video.play().catch(() => {});
        }

        if (autoTimer) {
          clearInterval(autoTimer);
          autoTimer = null;
        }
      });
    }
  });

  // Resize pe layout change hoga, to positions dobara calculate karo
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      computePositions();
      goToSlide(currentIndex, true); // fromAuto = true, timer disturb na ho
    }, 150);
  });

  // INIT
  computePositions();
  buildDots();
  goToSlide(0, false);
  resetAuto();
})();



// Premium feature video slider #8 (Section 9) – independent instance

(function () {
  const track = document.querySelector(".tp9-track");
  const cards = Array.from(document.querySelectorAll(".tp9-card"));
  const dotsContainer = document.querySelector(".tp9-dots");

  if (!track || cards.length === 0 || !dotsContainer) return;

  let currentIndex = 0;
  let autoTimer = null;
  const AUTO_DELAY = 7000; // 7 seconds
  let dots = [];
  let isUserInteracting = false;
  let positions = [];

  // --- Har slide ka exact X position (left) calculate karo
  function computePositions() {
    positions = cards.map((card) => card.offsetLeft);
  }

  function buildDots() {
    dotsContainer.innerHTML = "";
    dots = cards.map((_, i) => {
      const dot = document.createElement("button");
      dot.className = "tp9-dot" + (i === 0 ? " is-active" : "");
      dotsContainer.appendChild(dot);

      dot.addEventListener("click", () => {
        isUserInteracting = true;
        goToSlide(i, false);
      });

      return dot;
    });
  }

  function syncVideos(activeIndex) {
    cards.forEach((card, index) => {
      const video = card.querySelector(".tp9-video");
      const playBtn = card.querySelector('[data-role="play"]');
      if (!video) return;

      if (index === activeIndex && !video.paused && !video.ended) {
        // already playing
      } else if (index === activeIndex) {
        video.play().catch(() => {});
        if (playBtn) playBtn.textContent = "⏸ Pause";
      } else {
        video.pause();
        if (playBtn) playBtn.textContent = "▶ Play";
      }
    });
  }

  function setActiveDot(activeIndex) {
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === activeIndex);
    });
  }

  /**
   * goToSlide
   * @param {number} index - slide index
   * @param {boolean} fromAuto - true if called from autoplay/resize
   */
  function goToSlide(index, fromAuto) {
    if (!positions.length) computePositions();

    currentIndex = (index + cards.length) % cards.length;

    // yaha se magic: jo card visible hona hai uska exact left offset
    const offset = positions[currentIndex] || 0;

    track.style.transform = `translateX(-${offset}px)`;

    setActiveDot(currentIndex);
    syncVideos(currentIndex);

    if (!fromAuto) {
      resetAuto();
    }
  }

  function resetAuto() {
    if (isUserInteracting) return;
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      goToSlide(currentIndex + 1, true); // fromAuto = true
    }, AUTO_DELAY);
  }

  // video control buttons
  cards.forEach((card) => {
    const video = card.querySelector(".tp9-video");
    const playBtn = card.querySelector('[data-role="play"]');
    const muteBtn = card.querySelector('[data-role="mute"]');

    if (!video) return;

    video.muted = true; // start muted (for autoplay policy)

    if (playBtn) {
      playBtn.addEventListener("click", () => {
        isUserInteracting = true;
        if (video.paused) {
          video.play().catch(() => {});
          playBtn.textContent = "⏸ Pause";
        } else {
          video.pause();
          playBtn.textContent = "▶ Play";
        }
        if (autoTimer) {
          clearInterval(autoTimer);
          autoTimer = null;
        }
      });
    }

    if (muteBtn) {
      muteBtn.addEventListener("click", () => {
        isUserInteracting = true;
        video.muted = !video.muted;
        muteBtn.textContent = video.muted ? "🔇 Mute" : "🔊 Sound On";

        if (video.paused) {
          video.play().catch(() => {});
        }

        if (autoTimer) {
          clearInterval(autoTimer);
          autoTimer = null;
        }
      });
    }
  });

  // Resize pe layout change hoga, to positions dobara calculate karo
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      computePositions();
      goToSlide(currentIndex, true); // fromAuto = true, timer disturb na ho
    }, 150);
  });

  // INIT
  computePositions();
  buildDots();
  goToSlide(0, false);
  resetAuto();
})();


// Premium feature video slider #9 (Section 10) – independent instance
// Premium feature video slider (dynamic dots + stops auto on user interaction)
(function () {
  const track = document.querySelector(".tp10-track");
  const cards = Array.from(document.querySelectorAll(".tp10-card"));
  const dotsContainer = document.querySelector(".tp10-dots");

  if (!track || cards.length === 0 || !dotsContainer) return;

  let currentIndex = 0;
  let autoTimer = null;
  const AUTO_DELAY = 7000; // 7 seconds
  let dots = [];
  let isUserInteracting = false;
  let positions = [];

  // --- Har slide ka exact X position (left) calculate karo
  function computePositions() {
    positions = cards.map((card) => card.offsetLeft);
  }

  function buildDots() {
    dotsContainer.innerHTML = "";
    dots = cards.map((_, i) => {
      const dot = document.createElement("button");
      dot.className = "tp10-dot" + (i === 0 ? " is-active" : "");
      dotsContainer.appendChild(dot);

      dot.addEventListener("click", () => {
        isUserInteracting = true;
        goToSlide(i, false);
      });

      return dot;
    });
  }

  function syncVideos(activeIndex) {
    cards.forEach((card, index) => {
      const video = card.querySelector(".tp10-video");
      const playBtn = card.querySelector('[data-role="play"]');
      if (!video) return;

      if (index === activeIndex && !video.paused && !video.ended) {
        // already playing
      } else if (index === activeIndex) {
        video.play().catch(() => {});
        if (playBtn) playBtn.textContent = "⏸ Pause";
      } else {
        video.pause();
        if (playBtn) playBtn.textContent = "▶ Play";
      }
    });
  }

  function setActiveDot(activeIndex) {
    dots.forEach((dot, index) => {
      dot.classList.toggle("is-active", index === activeIndex);
    });
  }

  /**
   * goToSlide
   * @param {number} index - slide index
   * @param {boolean} fromAuto - true if called from autoplay/resize
   */
  function goToSlide(index, fromAuto) {
    if (!positions.length) computePositions();

    currentIndex = (index + cards.length) % cards.length;

    // yaha se magic: jo card visible hona hai uska exact left offset
    const offset = positions[currentIndex] || 0;

    track.style.transform = `translateX(-${offset}px)`;

    setActiveDot(currentIndex);
    syncVideos(currentIndex);

    if (!fromAuto) {
      resetAuto();
    }
  }

  function resetAuto() {
    if (isUserInteracting) return;
    if (autoTimer) clearInterval(autoTimer);
    autoTimer = setInterval(() => {
      goToSlide(currentIndex + 1, true); // fromAuto = true
    }, AUTO_DELAY);
  }

  // video control buttons
  cards.forEach((card) => {
    const video = card.querySelector(".tp10-video");
    const playBtn = card.querySelector('[data-role="play"]');
    const muteBtn = card.querySelector('[data-role="mute"]');

    if (!video) return;

    video.muted = true; // start muted (for autoplay policy)

    if (playBtn) {
      playBtn.addEventListener("click", () => {
        isUserInteracting = true;
        if (video.paused) {
          video.play().catch(() => {});
          playBtn.textContent = "⏸ Pause";
        } else {
          video.pause();
          playBtn.textContent = "▶ Play";
        }
        if (autoTimer) {
          clearInterval(autoTimer);
          autoTimer = null;
        }
      });
    }

    if (muteBtn) {
      muteBtn.addEventListener("click", () => {
        isUserInteracting = true;
        video.muted = !video.muted;
        muteBtn.textContent = video.muted ? "🔇 Mute" : "🔊 Sound On";

        if (video.paused) {
          video.play().catch(() => {});
        }

        if (autoTimer) {
          clearInterval(autoTimer);
          autoTimer = null;
        }
      });
    }
  });

  // Resize pe layout change hoga, to positions dobara calculate karo
  let resizeTimeout;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
      computePositions();
      goToSlide(currentIndex, true); // fromAuto = true, timer disturb na ho
    }, 150);
  });

  // INIT
  computePositions();
  buildDots();
  goToSlide(0, false);
  resetAuto();
})();






//reel scroller

class TpReel {
  constructor(phoneEl) {
    this.phone = phoneEl;
    this.windowEl = phoneEl.querySelector('.tp-reel-window');
    this.track = phoneEl.querySelector('.tp-reel-track');
    this.slides = Array.from(phoneEl.querySelectorAll('.tp-reel-slide'));

    if (!this.windowEl || !this.track || this.slides.length === 0) return;

    this.index = 0;
    this.animating = false;
    this.INTERVAL = 5000;
    this.timer = null;

    this.setHeights = this.setHeights.bind(this);
    this.nextSlide = this.nextSlide.bind(this);
    this.onTransitionEnd = this.onTransitionEnd.bind(this);

    this.init();
  }

  setHeights() {
    const h = this.phone.getBoundingClientRect().height;
    this.windowEl.style.height = h + 'px';
    this.slides.forEach(slide => {
      slide.style.height = h + 'px';
    });
    this.track.style.transition = 'none';
    this.track.style.transform = `translateY(-${this.index * h}px)`;
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
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.nextSlide(), this.INTERVAL);
  }

  init() {
    this.setHeights();
    this.track.addEventListener('transitionend', this.onTransitionEnd);
    this.startAuto();
  }
}

window.addEventListener('load', () => {
  const phones = Array.from(document.querySelectorAll('#tp-phone-slider .tp-phone'));
  const reels = phones.map(p => new TpReel(p));

  window.addEventListener('resize', () => {
    reels.forEach(r => r && r.setHeights && r.setHeights());
  });
});

// Card feature OTO

const cards = document.querySelectorAll('.funnel-step');
  const bar   = document.getElementById('funnelProgressBar');
  const total = cards.length;
  let activeIndex = 0;

  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
      }
    });
  },{threshold:0.2});

  cards.forEach(c=>io.observe(c));

  function setActive(index){
    activeIndex = index;
    cards.forEach((card,i)=>{
      card.classList.toggle('active', i === index);
    });
    const progress = (index+1)/total;
    bar.style.transform = `scaleX(${progress})`;
  }
  setActive(0);

  let autoTimer = setInterval(()=>{
    const next = (activeIndex + 1) % total;
    setActive(next);
  }, 2600);

  cards.forEach((card,i)=>{
    card.addEventListener('mouseenter', ()=>{
      setActive(i);
      clearInterval(autoTimer);
    });
    card.addEventListener('click', ()=> setActive(i));
  });


  // simple scroll-in animation for each bullet
  const reasons = document.querySelectorAll('.reason');

  const observer = new IntersectionObserver((entries)=>{
    entries.forEach((entry)=>{
      if(entry.isIntersecting){
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  },{
    threshold:0.2
  });

  reasons.forEach((item,idx)=>{
    item.style.transitionDelay = (idx * 0.06) + 's'; // slight stagger
    observer.observe(item);
  });