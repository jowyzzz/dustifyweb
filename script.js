document.addEventListener('DOMContentLoaded', () => {

  // Navbar Scroll
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
  });

  // Tab System
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.getAttribute('data-tab');
      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const activePanel = document.querySelector(`.panel[data-panel="${target}"]`);
      if (activePanel) activePanel.classList.add('active');
    });
  });

  // Smooth Scroll
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const target = document.querySelector(this.getAttribute('href'));
      if (target) window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    });
  });

  // ── Slider JS-driven (loop infinito + drag para acelerar) ─────────────────
  const track = document.getElementById('slider-track');
  if (!track) return;

  // La pista tiene 12 tarjetas (6 originales + 6 clones).
  // El loop hace que cuando desplazamos el ancho de las 6 originales, reseteamos a 0.
  const CARD_W = 320;
  const GAP = 24;
  const N_ORIGINALS = 6;
  const LOOP_WIDTH = (CARD_W + GAP) * N_ORIGINALS; // px antes de reiniciar

  const BASE_SPEED = 80;   // px/s — velocidad automática normal
  const MAX_SPEED = 900;  // px/s — velocidad máxima al arrastrar rápido

  let offset = 0;       // posición actual (px, crece →, se reinicia al llegar a LOOP_WIDTH)
  let speed = BASE_SPEED;  // velocidad actual px/s
  let lastTs = null;

  // Drag state
  let isDragging = false;
  let dragLastX = 0;
  let dragLastTs = 0;
  let dragVel = 0;      // velocidad instántanea del drag (px/s, positivo = izquierda)

  // RAF loop
  function tick(ts) {
    if (lastTs === null) lastTs = ts;
    const dt = Math.min((ts - lastTs) / 1000, 0.05); // segundos, cap 50ms
    lastTs = ts;

    if (isDragging) {
      // Durante el drag: suma la velocidad del dedo directamente
      speed = Math.max(BASE_SPEED, Math.abs(dragVel));
    } else {
      // Sin drag: vuelve suavemente a BASE_SPEED
      speed += (BASE_SPEED - speed) * Math.min(dt * 2.5, 1);
    }

    offset += speed * dt;
    if (offset >= LOOP_WIDTH) offset -= LOOP_WIDTH;

    track.style.transform = `translateX(${-offset}px)`;
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);

  // ── Drag handlers ────────────────────────────────────────────────────────
  function dragStart(x) {
    isDragging = true;
    dragLastX = x;
    dragLastTs = performance.now();
    dragVel = 0;
  }

  function dragMove(x) {
    if (!isDragging) return;
    const now = performance.now();
    const dt = now - dragLastTs;
    if (dt > 0) {
      const dx = dragLastX - x;          // positivo = mueve hacia la izquierda
      dragVel = dx / (dt / 1000);       // px/s
    }
    dragLastX = x;
    dragLastTs = performance.now();
  }

  function dragEnd() {
    if (!isDragging) return;
    isDragging = false;
    // La velocidad se mantiene brevemente y luego el loop la devuelve a BASE
  }

  // Mouse
  track.addEventListener('mousedown', e => { e.preventDefault(); dragStart(e.clientX); });
  window.addEventListener('mousemove', e => dragMove(e.clientX));
  window.addEventListener('mouseup', () => dragEnd());

  // Touch
  track.addEventListener('touchstart', e => dragStart(e.touches[0].clientX), { passive: true });
  track.addEventListener('touchmove', e => dragMove(e.touches[0].clientX), { passive: true });
  track.addEventListener('touchend', () => dragEnd());
  // ─────────────────────────────────────────────────────────────────────────

});
