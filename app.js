(() => {
  'use strict';

  const slides = [...document.querySelectorAll('.slide')];
  const stage = document.querySelector('.stage');
  const slideButtons = [...document.querySelectorAll('.slide-nav [data-go]')];
  const previousButton = document.querySelector('.previous');
  const nextButton = document.querySelector('.next');
  const announcer = document.querySelector('#slide-announcer');
  const fullscreenButton = document.querySelector('#fullscreen-button');
  const furiganaToggle = document.querySelector('#furigana-toggle');
  const furiganaState = document.querySelector('#furigana-state');
  const mobileSlideTrigger = document.querySelector('#mobile-slide-trigger');
  const mobileSlideLabel = document.querySelector('#mobile-slide-label');
  const slideNav = document.querySelector('#slide-nav-list');
  const mobile = window.matchMedia('(max-width: 900px)');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  const strokePaths = [...document.querySelectorAll('#writer-active-strokes .stroke-path')];
  const strokeNumbers = [...document.querySelectorAll('#writer-stroke-nums .stroke-num')];
  const strokeStepButtons = [...document.querySelectorAll('[data-stroke-step]')];
  const writerNib = document.querySelector('#writer-nib');
  const strokePlayBtn = document.querySelector('#stroke-play-btn');
  const strokePlayLabel = document.querySelector('#stroke-play-label');
  const strokeResetBtn = document.querySelector('#stroke-reset-btn');
  const strokePhaseLabel = document.querySelector('#stroke-phase-label');
  const strokeCueTitle = document.querySelector('#stroke-cue-title');
  const strokeCueDesc = document.querySelector('#stroke-cue-desc');

  const partButtons = [...document.querySelectorAll('[data-part]')];
  const mnemonicStrokes = [...document.querySelectorAll('#mnemonic-kanji-svg [data-part-stroke]')];
  const mnemonicBadgeText = document.querySelector('#mnemonic-badge-text');
  const mnemonicFocusTitle = document.querySelector('#mnemonic-focus-title');
  const mnemonicFocusBody = document.querySelector('#mnemonic-focus-body');

  let currentSlide = 0;
  let transitionTimer;
  let toastTimer;

  const STROKE_INFO = [
    {
      name: '横画（一）',
      desc: 'Tarik garis datar panjang di bagian atas dari kiri ke kanan.'
    },
    {
      name: '縦画（丨）',
      desc: 'Tarik garis tegak sisi kiri kotak 口 dari atas ke bawah.'
    },
    {
      name: '横折（𠃍）',
      desc: 'Tarik bagian atas kotak 口 ke kanan lalu tekuk tajam ke bawah.'
    },
    {
      name: '横画（一）',
      desc: 'Tutup bagian bawah kotak 口 dengan garis datar ke kanan.'
    },
    {
      name: '縦鉤（亅）',
      desc: 'Tarik garis tegak panjang di kanan, lalu buat kail pendek ke kiri.'
    }
  ];

  const MNEMONIC_DATA = {
    all: {
      badge: 'Asal Bentuk & Cerita Visual',
      title: 'Mulut (<span lang="ja">口</span>) Dikunci Palu Izin (<span lang="ja">丁</span>)',
      body: 'Garis datar atas <strong lang="ja">一</strong> dan kail tegak <strong lang="ja">亅</strong> membentuk tanda paku <strong lang="ja">丁</strong> yang memayungi mulut <strong lang="ja">口</strong>. Bayangkan ucapan setuju yang sah disematkan: <strong>boleh, dapat, dan mungkin</strong>.',
      lit: ['s1', 'mouth', 's5']
    },
    s1: {
      badge: 'Komponen 1 · Guratan 1',
      title: 'Atap Datar (<span lang="ja">一</span>)',
      body: 'Garis datar paling atas berfungsi sebagai penanda naungan dan awal tarikan huruf <strong lang="ja">可</strong> sekaligus bagian kepala komponen <strong lang="ja">丁</strong>.',
      lit: ['s1']
    },
    mouth: {
      badge: 'Komponen 2 · Radikal Utama',
      title: 'Radikal Mulut (<span lang="ja">口</span> · Kuchi)',
      body: 'Kotak kecil di tengah adalah radikal <strong lang="ja">口</strong> (mulut, 3 guratan). Dalam kanji <strong lang="ja">可</strong>, mulut menjadi inti suara yang mengucapkan kata persetujuan.',
      lit: ['mouth']
    },
    s5: {
      badge: 'Komponen 3 · Guratan Terakhir',
      title: 'Kail Penutup (<span lang="ja">亅</span>)',
      body: 'Guratan ke-5 turun lurus di sisi kanan lalu berkait ke arah kiri, mengunci struktur kanan dan memberi kesan tegas pada kanji <strong lang="ja">可</strong>.',
      lit: ['s5']
    },
    tei: {
      badge: 'Gabungan Ringkas (2 Bagian)',
      title: 'Rumus Cepat: <span lang="ja">丁 + 口 = 可</span>',
      body: 'Agar paling cepat dihafal saat ujian: bayangkan paku berbentuk T berkail (<strong lang="ja">丁</strong>) mengetuk persetujuan di samping mulut (<strong lang="ja">口</strong>), menandakan hal itu diizinkan.',
      lit: ['s1', 'mouth', 's5']
    }
  };

  let strokeLengths = [];
  let writerRafId = null;
  let isWriterPlaying = !reducedMotion.matches;
  let activeStrokeIdx = 0;
  let phaseStartMs = 0;
  let writerPhase = 'draw'; // 'draw' | 'gap' | 'hold'

  const DRAW_MS = 780;
  const GAP_MS = 240;
  const HOLD_MS = 1050;

  function easeOutCubic(t) {
    return 1 - Math.pow(1 - t, 3);
  }

  function initStrokeMetrics() {
    strokeLengths = strokePaths.map(path => {
      const len = path.getTotalLength();
      path.style.strokeDasharray = `${len} ${len}`;
      return len;
    });
  }

  function updateStrokeCue(stepOneBased) {
    const info = STROKE_INFO[stepOneBased - 1];
    if (!info) return;
    if (strokePhaseLabel) strokePhaseLabel.textContent = `Guratan ${stepOneBased} dari ${strokePaths.length}`;
    if (strokeCueTitle) strokeCueTitle.textContent = info.name;
    if (strokeCueDesc) strokeCueDesc.textContent = info.desc;
    strokeStepButtons.forEach((btn, idx) => {
      const isCurrent = idx + 1 === stepOneBased;
      btn.classList.toggle('is-active', isCurrent);
      btn.setAttribute('aria-pressed', String(isCurrent));
    });
  }

  function renderStrokeFrame(strokeIdx, drawRatio, showNib = true) {
    if (!strokeLengths.length) initStrokeMetrics();
    strokePaths.forEach((path, idx) => {
      const len = strokeLengths[idx];
      path.classList.remove('is-hidden', 'is-done', 'is-active');
      if (idx < strokeIdx) {
        path.style.strokeDashoffset = '0';
        path.classList.add('is-done');
      } else if (idx === strokeIdx) {
        const offset = len * (1 - drawRatio);
        path.style.strokeDashoffset = `${offset}`;
        path.classList.add(drawRatio >= 1 && strokeIdx === strokePaths.length - 1 && writerPhase === 'hold' ? 'is-done' : 'is-active');
      } else {
        path.style.strokeDashoffset = `${len}`;
        path.classList.add('is-hidden');
      }
    });

    strokeNumbers.forEach((num, idx) => {
      num.classList.toggle('is-active', idx === strokeIdx);
    });

    updateStrokeCue(strokeIdx + 1);

    if (writerNib && strokePaths[strokeIdx]) {
      const len = strokeLengths[strokeIdx];
      const clamped = Math.max(0, Math.min(1, drawRatio));
      const pt = strokePaths[strokeIdx].getPointAtLength(len * clamped);
      writerNib.setAttribute('cx', pt.x.toFixed(2));
      writerNib.setAttribute('cy', pt.y.toFixed(2));
      writerNib.style.opacity = showNib ? '1' : '0';
    }
  }

  function renderStaticCompleted() {
    if (!strokeLengths.length) initStrokeMetrics();
    strokePaths.forEach(path => {
      path.classList.remove('is-hidden', 'is-active');
      path.classList.add('is-done');
      path.style.strokeDashoffset = '0';
    });
    strokeNumbers.forEach(num => num.classList.remove('is-active'));
    if (writerNib) writerNib.style.opacity = '0';
  }

  function updatePlayButtonUI() {
    if (!strokePlayBtn || !strokePlayLabel) return;
    strokePlayBtn.setAttribute('aria-pressed', String(isWriterPlaying));
    strokePlayLabel.textContent = isWriterPlaying ? 'Jeda' : 'Putar';
    const useEl = strokePlayBtn.querySelector('use');
    if (useEl) useEl.setAttribute('href', isWriterPlaying ? '#icon-pause' : '#icon-play');
  }

  function stopWriterLoop() {
    if (writerRafId !== null) {
      cancelAnimationFrame(writerRafId);
      writerRafId = null;
    }
  }

  function tickWriter(now) {
    if (!isWriterPlaying || currentSlide !== 1 || reducedMotion.matches || document.hidden) {
      stopWriterLoop();
      return;
    }
    if (!phaseStartMs) phaseStartMs = now;
    const elapsed = now - phaseStartMs;

    if (writerPhase === 'draw') {
      const t = Math.min(1, elapsed / DRAW_MS);
      const eased = easeOutCubic(t);
      renderStrokeFrame(activeStrokeIdx, eased, true);
      if (t >= 1) {
        writerPhase = activeStrokeIdx === strokePaths.length - 1 ? 'hold' : 'gap';
        phaseStartMs = now;
      }
    } else if (writerPhase === 'gap') {
      renderStrokeFrame(activeStrokeIdx, 1, false);
      if (elapsed >= GAP_MS) {
        activeStrokeIdx += 1;
        writerPhase = 'draw';
        phaseStartMs = now;
      }
    } else if (writerPhase === 'hold') {
      renderStrokeFrame(activeStrokeIdx, 1, false);
      if (elapsed >= HOLD_MS) {
        activeStrokeIdx = 0;
        writerPhase = 'draw';
        phaseStartMs = now;
      }
    }
    writerRafId = requestAnimationFrame(tickWriter);
  }

  function startWriterPlayback({ fromStart = false } = {}) {
    if (!strokePaths.length) return;
    if (reducedMotion.matches) {
      isWriterPlaying = false;
      updatePlayButtonUI();
      renderStrokeFrame(4, 1, false);
      return;
    }
    stopWriterLoop();
    if (fromStart) {
      activeStrokeIdx = 0;
      writerPhase = 'draw';
    }
    isWriterPlaying = true;
    phaseStartMs = 0;
    updatePlayButtonUI();
    writerRafId = requestAnimationFrame(tickWriter);
  }

  function pauseWriterAtStep(stepOneBased) {
    stopWriterLoop();
    isWriterPlaying = false;
    updatePlayButtonUI();
    activeStrokeIdx = Math.max(0, Math.min(strokePaths.length - 1, stepOneBased - 1));
    writerPhase = 'draw';
    renderStrokeFrame(activeStrokeIdx, 1, false);
    if (strokePaths[activeStrokeIdx] && strokeLengths.length) {
      const len = strokeLengths[activeStrokeIdx];
      const pt = strokePaths[activeStrokeIdx].getPointAtLength(len);
      if (writerNib) {
        writerNib.setAttribute('cx', pt.x.toFixed(2));
        writerNib.setAttribute('cy', pt.y.toFixed(2));
        writerNib.style.opacity = '1';
      }
    }
  }

  function selectMnemonicPart(partKey) {
    const entry = MNEMONIC_DATA[partKey];
    if (!entry) return;
    partButtons.forEach(btn => {
      const selected = btn.dataset.part === partKey;
      btn.classList.toggle('is-selected', selected);
      btn.setAttribute('aria-pressed', String(selected));
    });
    mnemonicStrokes.forEach(path => {
      const lit = entry.lit.includes(path.dataset.partStroke);
      path.classList.toggle('is-lit', lit);
    });
    if (mnemonicBadgeText) mnemonicBadgeText.textContent = entry.badge;
    if (mnemonicFocusTitle) mnemonicFocusTitle.innerHTML = entry.title;
    if (mnemonicFocusBody) mnemonicFocusBody.innerHTML = entry.body;
  }

  function fitStage() {
    stage.style.setProperty('--deck-scale', stage.clientWidth / 1440);
  }

  function readHash() {
    const match = location.hash.match(/^#slide-(\d+)$/);
    if (!match) return 0;
    const index = Number(match[1]) - 1;
    return index >= 0 && index < slides.length ? index : 0;
  }

  function goToSlide(index, { updateHash = true, focus = false, animate = true } = {}) {
    if (!Number.isInteger(index) || index < 0 || index >= slides.length) return;
    const changed = currentSlide !== index;
    const focusIsInSlide = slides.some(slide => slide.contains(document.activeElement));
    currentSlide = index;
    clearTimeout(transitionTimer);

    slides.forEach((slide, i) => {
      const active = i === index;
      slide.hidden = !active;
      slide.inert = !active;
      slide.classList.toggle('active', active);
      slide.classList.remove('entering');
    });

    if (changed && animate) {
      slides[index].classList.add('entering');
      transitionTimer = setTimeout(() => slides[index].classList.remove('entering'), 420);
    }

    slideButtons.forEach((button, i) => {
      button.classList.toggle('current', i === index);
      if (i === index) button.setAttribute('aria-current', 'step');
      else button.removeAttribute('aria-current');
    });

    previousButton.disabled = index === 0;
    nextButton.disabled = index === slides.length - 1;
    document.querySelector('.skip-link').href = '#slide-' + (index + 1);
    if (mobileSlideLabel) {
      mobileSlideLabel.textContent = 'Slide ' + (index + 1) + ' / ' + slides.length + ' · ' + slides[index].dataset.title;
    }
    closeMobileNav();

    if (updateHash && location.hash !== '#slide-' + (index + 1)) {
      try {
        history.replaceState(null, '', '#slide-' + (index + 1));
      } catch {
        location.hash = 'slide-' + (index + 1);
      }
    }

    if (index === 1) {
      if (isWriterPlaying && !reducedMotion.matches) {
        startWriterPlayback({ fromStart: true });
      } else {
        renderStrokeFrame(activeStrokeIdx, 1, false);
      }
    } else {
      stopWriterLoop();
    }

    if (focus || focusIsInSlide) slides[index].focus({ preventScroll: true });
    if (changed && mobile.matches) window.scrollTo({ top: 0, behavior: 'instant' });
    announcer.textContent = 'Slide ' + (index + 1) + ' dari ' + slides.length + ': ' + slides[index].dataset.title;
  }

  function closeMobileNav({ restoreFocus = false } = {}) {
    if (!slideNav || !mobileSlideTrigger) return;
    const wasOpen = slideNav.classList.contains('is-open');
    slideNav.classList.remove('is-open');
    mobileSlideTrigger.setAttribute('aria-expanded', 'false');
    if (wasOpen && restoreFocus) mobileSlideTrigger.focus({ preventScroll: true });
  }

  function toggleMobileNav() {
    if (!slideNav || !mobileSlideTrigger) return;
    const isOpen = slideNav.classList.toggle('is-open');
    mobileSlideTrigger.setAttribute('aria-expanded', String(isOpen));
  }

  function toggleFurigana() {
    const hidden = document.body.classList.toggle('furigana-hidden');
    const active = !hidden;
    furiganaToggle.setAttribute('aria-pressed', String(active));
    furiganaState.textContent = active ? 'Aktif' : 'Sembunyi';
    announcer.textContent = active ? 'Furigana ditampilkan.' : 'Furigana disembunyikan.';
  }

  function toast(message) {
    const element = document.querySelector('#toast');
    clearTimeout(toastTimer);
    element.textContent = message;
    element.hidden = false;
    toastTimer = setTimeout(() => {
      element.hidden = true;
    }, 4000);
  }

  const fullscreenUse = fullscreenButton.querySelector('use');
  let autoFullscreenPending = Boolean(document.fullscreenEnabled && document.documentElement.requestFullscreen);

  function disarmAutoFullscreen() {
    autoFullscreenPending = false;
    document.removeEventListener('click', handleFirstFullscreenGesture, true);
    document.removeEventListener('keydown', handleFirstFullscreenGesture, true);
  }

  async function enterFullscreenSilently() {
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        await document.documentElement.requestFullscreen();
      }
    } catch {
      // Ignore fullscreen denials when triggered opportunistically on first interaction
    }
  }

  function handleFirstFullscreenGesture(event) {
    if (!autoFullscreenPending || !event.isTrusted) return;
    if (event.type === 'click') {
      const clickedToggle = event.target?.closest?.('#fullscreen-button');
      disarmAutoFullscreen();
      if (clickedToggle || document.fullscreenElement) return;
      enterFullscreenSilently();
      return;
    }
    if (event.type === 'keydown') {
      if (['Escape', 'Tab', 'Shift', 'Control', 'Alt', 'Meta'].includes(event.key) || event.altKey || event.ctrlKey || event.metaKey) return;
      const pressedF = event.key.toLowerCase() === 'f';
      disarmAutoFullscreen();
      if (pressedF || document.fullscreenElement) return;
      enterFullscreenSilently();
    }
  }

  async function toggleFullscreen() {
    disarmAutoFullscreen();
    try {
      if (document.fullscreenElement) await document.exitFullscreen();
      else if (document.documentElement.requestFullscreen) await document.documentElement.requestFullscreen();
      else toast('Browser ini belum mendukung layar penuh. Gunakan mode lanskap untuk ruang lebih luas.');
    } catch {
      toast('Layar penuh tidak tersedia di jendela ini. Buka langsung di browser untuk memakai fitur ini.');
    }
  }

  document.querySelectorAll('[data-go]').forEach(button => {
    button.addEventListener('click', () => goToSlide(Number(button.dataset.go), { focus: true }));
  });

  document.querySelector('.brand').addEventListener('click', event => {
    event.preventDefault();
    goToSlide(0, { focus: true });
  });

  previousButton.addEventListener('click', () => goToSlide(currentSlide - 1, { focus: true }));
  nextButton.addEventListener('click', () => goToSlide(currentSlide + 1, { focus: true }));
  furiganaToggle.addEventListener('click', toggleFurigana);
  fullscreenButton.addEventListener('click', toggleFullscreen);
  if (mobileSlideTrigger) {
    mobileSlideTrigger.addEventListener('click', toggleMobileNav);
  }
  document.addEventListener('click', event => {
    if (slideNav?.classList.contains('is-open') && !event.target.closest('#slide-nav-list, #mobile-slide-trigger')) {
      closeMobileNav();
    }
  });

  if (strokePlayBtn) {
    strokePlayBtn.addEventListener('click', () => {
      if (isWriterPlaying) {
        stopWriterLoop();
        isWriterPlaying = false;
        updatePlayButtonUI();
      } else {
        startWriterPlayback({ fromStart: writerPhase === 'hold' || activeStrokeIdx === strokePaths.length - 1 });
      }
    });
  }

  if (strokeResetBtn) {
    strokeResetBtn.addEventListener('click', () => {
      if (reducedMotion.matches) {
        pauseWriterAtStep(1);
      } else {
        startWriterPlayback({ fromStart: true });
      }
    });
  }

  strokeStepButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const step = Number(btn.dataset.strokeStep);
      pauseWriterAtStep(step);
      announcer.textContent = `Guratan ${step} dari ${strokePaths.length}. ${STROKE_INFO[step - 1].desc}`;
    });
  });

  partButtons.forEach(btn => {
    btn.addEventListener('click', () => selectMnemonicPart(btn.dataset.part));
  });

  window.addEventListener('hashchange', () => goToSlide(readHash(), { updateHash: false }));
  new ResizeObserver(fitStage).observe(stage);

  if (autoFullscreenPending) {
    document.addEventListener('click', handleFirstFullscreenGesture, true);
    document.addEventListener('keydown', handleFirstFullscreenGesture, true);
  }

  document.addEventListener('fullscreenchange', () => {
    const active = Boolean(document.fullscreenElement);
    const label = active ? 'Keluar layar penuh' : 'Masuk layar penuh';
    fullscreenButton.setAttribute('aria-label', label);
    fullscreenButton.title = label + ' (F)';
    if (fullscreenUse) fullscreenUse.setAttribute('href', active ? '#collapse' : '#expand');
    fitStage();
    requestAnimationFrame(fitStage);
  });

  document.addEventListener('keydown', event => {
    if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey) return;
    if (event.key === 'Escape' && slideNav?.classList.contains('is-open')) {
      event.preventDefault();
      closeMobileNav({ restoreFocus: true });
      return;
    }
    const target = event.target;
    if (target.closest('input, textarea, select, [contenteditable="true"]')) return;

    if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(event.key)) {
      event.preventDefault();
      goToSlide(currentSlide + 1, { focus: true });
    } else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(event.key)) {
      event.preventDefault();
      goToSlide(currentSlide - 1, { focus: true });
    } else if (event.key === 'Home' || event.key === 'End') {
      event.preventDefault();
      goToSlide(event.key === 'Home' ? 0 : slides.length - 1, { focus: true });
    } else if (event.key.toLowerCase() === 'f') {
      event.preventDefault();
      toggleFullscreen();
    } else if (event.key === ' ' && !target.closest('button, a, summary')) {
      event.preventDefault();
      goToSlide(event.shiftKey ? currentSlide - 1 : currentSlide + 1, { focus: true });
    }
  });

  let touchStart = null;
  stage.addEventListener('touchstart', event => {
    if (event.touches.length !== 1 || event.target.closest('button, input, textarea, a')) {
      touchStart = null;
      return;
    }
    touchStart = { x: event.touches[0].clientX, y: event.touches[0].clientY };
  }, { passive: true });

  stage.addEventListener('touchend', event => {
    if (!touchStart || event.changedTouches.length !== 1) return;
    const deltaX = event.changedTouches[0].clientX - touchStart.x;
    const deltaY = event.changedTouches[0].clientY - touchStart.y;
    if (Math.abs(deltaX) > 75 && Math.abs(deltaX) > Math.abs(deltaY) * 1.8) {
      if (deltaX < 0) goToSlide(currentSlide + 1, { focus: true });
      else goToSlide(currentSlide - 1, { focus: true });
    }
    touchStart = null;
  }, { passive: true });

  stage.addEventListener('touchcancel', () => {
    touchStart = null;
  }, { passive: true });

  window.addEventListener('beforeprint', () => {
    stopWriterLoop();
    slides.forEach(slide => {
      slide.inert = false;
    });
    renderStaticCompleted();
  });

  window.addEventListener('afterprint', () => {
    slides.forEach((slide, index) => {
      slide.inert = index !== currentSlide;
    });
    if (currentSlide === 1 && isWriterPlaying && !reducedMotion.matches) {
      startWriterPlayback({ fromStart: true });
    }
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      stopWriterLoop();
    } else if (currentSlide === 1 && isWriterPlaying && !reducedMotion.matches) {
      startWriterPlayback({ fromStart: false });
    }
  });

  initStrokeMetrics();
  updatePlayButtonUI();
  selectMnemonicPart('all');
  fitStage();
  goToSlide(readHash(), { updateHash: Boolean(location.hash), animate: false });
})();
