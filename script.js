/**
 * 2-WASH KUWAIT — script.js
 * Modules: Loader · Navbar · AOS · Counters · PriceToggle · Slider · Form · Utils
 */
'use strict';

/* ================================================================
   1. LOADER
   ================================================================ */
window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  if (!loader) return;
  setTimeout(() => {
    loader.classList.add('out');
    // Trigger AOS for hero elements right away
    document.querySelectorAll('.hero [data-aos]').forEach(el => el.classList.add('visible'));
  }, 2000);
});

/* ================================================================
   2. NAVBAR
   ================================================================ */
(function initNav() {
  const nav    = document.getElementById('navbar');
  const burger = document.getElementById('burger');
  const drawer = document.getElementById('mobDrawer');

  // Sticky on scroll
  window.addEventListener('scroll', () => {
    nav?.classList.toggle('stuck', window.scrollY > 50);
  }, { passive: true });

  // Burger toggle
  burger?.addEventListener('click', () => {
    const open = drawer.classList.toggle('open');
    burger.classList.toggle('open', open);
    document.body.style.overflow = open ? 'hidden' : '';
  });

  // Close on drawer link click
  drawer?.querySelectorAll('.md-link, .mm-wa, .btn-call, .btn-wa').forEach(link => {
    link.addEventListener('click', () => {
      drawer.classList.remove('open');
      burger?.classList.remove('open');
      document.body.style.overflow = '';
    });
  });

  // Active link via IntersectionObserver
  const sections = document.querySelectorAll('section[id]');
  const navLinks  = document.querySelectorAll('.nav-a');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const id = e.target.id;
        navLinks.forEach(l => l.classList.toggle('active', l.getAttribute('href') === `#${id}`));
      }
    });
  }, { threshold: 0.35, rootMargin: '-80px 0px -40% 0px' });
  sections.forEach(s => obs.observe(s));
})();

/* ================================================================
   3. SMOOTH SCROLL
   ================================================================ */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const t = document.querySelector(a.getAttribute('href'));
    if (!t) return;
    e.preventDefault();
    window.scrollTo({ top: t.offsetTop - 78, behavior: 'smooth' });
  });
});

/* ================================================================
   4. AOS — Animate on Scroll
   ================================================================ */
(function initAOS() {
  const els = document.querySelectorAll('[data-aos]');
  if (!els.length) return;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const delay = parseInt(e.target.dataset.aosDelay || '0');
        setTimeout(() => e.target.classList.add('visible'), delay);
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

  els.forEach(el => obs.observe(el));
})();

/* ================================================================
   5. COUNTER ANIMATION
   ================================================================ */
(function initCounters() {
  const counters = document.querySelectorAll('.count-up[data-target]');
  if (!counters.length) return;

  function ease(t) { return 1 - Math.pow(1 - t, 3); }

  function animate(el) {
    const target = parseInt(el.dataset.target);
    const dur    = 2000;
    let startTime;

    (function tick(ts) {
      if (!startTime) startTime = ts;
      const progress = Math.min((ts - startTime) / dur, 1);
      el.textContent = Math.round(ease(progress) * target).toLocaleString('ar-KW');
      if (progress < 1) requestAnimationFrame(tick);
    })(performance.now());
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { animate(e.target); obs.unobserve(e.target); } });
  }, { threshold: 0.5 });
  counters.forEach(c => obs.observe(c));
})();

/* ================================================================
   6. PRICE TOGGLE (صالون / جيب)
   ================================================================ */
(function initPriceToggle() {
  const btns   = document.querySelectorAll('#priceToggle .pt-btn');
  const vals   = document.querySelectorAll('.price-val');
  const header = document.getElementById('priceHeader');
  if (!btns.length) return;

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const type = btn.dataset.type; // 'saloon' or 'jeep'
      if (header) header.textContent = type === 'saloon' ? 'صالون' : 'جيب';

      vals.forEach(cell => {
        const newVal = cell.dataset[type] || '—';
        // Animate number if numeric
        const numMatch = newVal.match(/\d+/);
        if (numMatch) {
          const from = parseInt(cell.textContent) || 0;
          const to   = parseInt(numMatch[0]);
          animateNum(cell, from, to, newVal, 350);
        } else {
          cell.textContent = newVal;
        }
      });
    });
  });

  function animateNum(el, from, to, finalStr, dur) {
    const start = performance.now();
    (function tick(ts) {
      const p = Math.min((ts - start) / dur, 1);
      const cur = Math.round(from + (to - from) * p);
      el.textContent = finalStr.replace(/\d+/, cur);
      if (p < 1) requestAnimationFrame(tick);
    })(performance.now());
  }
})();

/* ================================================================
   7. TESTIMONIALS SLIDER
   ================================================================ */
(function initTestiSlider() {
  const track    = document.getElementById('testiTrack');
  const dotsWrap = document.getElementById('testiDots');
  const prevBtn  = document.getElementById('testiPrev');
  const nextBtn  = document.getElementById('testiNext');
  if (!track) return;

  const cards = track.querySelectorAll('.testi-card');
  let current = 0, cardW, visible, maxIdx;
  let autoTimer;

  function calc() {
    cardW   = cards[0].offsetWidth + 20;
    visible = Math.max(1, Math.floor(track.parentElement.offsetWidth / (cardW)));
    maxIdx  = Math.max(0, cards.length - visible);
  }

  function buildDots() {
    dotsWrap.innerHTML = '';
    for (let i = 0; i <= maxIdx; i++) {
      const d = document.createElement('button');
      d.className = `td${i === 0 ? ' on' : ''}`;
      d.addEventListener('click', () => go(i));
      dotsWrap.appendChild(d);
    }
  }

  function go(idx) {
    current = Math.max(0, Math.min(idx, maxIdx));
    track.style.transform = `translateX(${current * cardW}px)`;
    dotsWrap?.querySelectorAll('.td').forEach((d, i) => d.classList.toggle('on', i === current));
  }

  function startAuto() {
    autoTimer = setInterval(() => go(current >= maxIdx ? 0 : current + 1), 4500);
  }
  function stopAuto() { clearInterval(autoTimer); }

  prevBtn?.addEventListener('click', () => { go(current + 1); stopAuto(); startAuto(); });
  nextBtn?.addEventListener('click', () => { go(current - 1); stopAuto(); startAuto(); });

  // Touch swipe
  let sx = 0;
  track.addEventListener('touchstart', e => { sx = e.touches[0].clientX; stopAuto(); }, { passive: true });
  track.addEventListener('touchend', e => {
    const dx = sx - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) go(dx > 0 ? current + 1 : current - 1);
    startAuto();
  });

  track.addEventListener('mouseenter', stopAuto);
  track.addEventListener('mouseleave', startAuto);

  window.addEventListener('load', () => { calc(); buildDots(); go(0); startAuto(); });
  window.addEventListener('resize', () => { calc(); buildDots(); go(0); });
})();

/* ================================================================
   8. BOOKING FORM — WhatsApp integration
   ================================================================ */
(function initForm() {
  const form   = document.getElementById('bookForm');
  const okMsg  = document.getElementById('bformOk');
  const submit = document.getElementById('bsubmit');
  const stxt   = document.getElementById('bsubmitTxt');
  if (!form) return;

  const rules = {
    bname: {
      el:  document.getElementById('bname'),
      err: document.getElementById('bnameErr'),
      fn:  v => v.trim().length >= 2,
      msg: 'يرجى إدخال اسمك'
    },
    bphone: {
      el:  document.getElementById('bphone'),
      err: document.getElementById('bphoneErr'),
      fn:  v => /^\d{7,8}$/.test(v.replace(/\s/g, '')),
      msg: 'أدخل رقم هاتف كويتي صحيح (7-8 أرقام)'
    }
  };

  // Real-time validation
  Object.values(rules).forEach(r => {
    r.el?.addEventListener('blur',  () => validate(r));
    r.el?.addEventListener('input', () => { if (r.el.classList.contains('err')) validate(r); });
  });

  function validate(r) {
    const ok = r.fn(r.el.value);
    r.el.classList.toggle('err', !ok);
    if (r.err) r.err.textContent = ok ? '' : r.msg;
    return ok;
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const allOk = Object.values(rules).map(r => validate(r)).every(Boolean);
    if (!allOk) return;

    submit.disabled = true;
    stxt.textContent = 'جاري التحضير...';

    // Collect form data
    const name    = document.getElementById('bname').value.trim();
    const phone   = document.getElementById('bphone').value.trim();
    const car     = document.getElementById('bcar')?.value     || '';
    const service = document.getElementById('bservice')?.value || '';
    const area    = document.getElementById('barea')?.value    || '';
    const notes   = document.getElementById('bnotes')?.value   || '';

    // Build WhatsApp message
    let msg = `مرحباً 2-WASH 👋\n\n`;
    msg += `الاسم: ${name}\n`;
    msg += `الهاتف: ${phone}\n`;
    if (car)     msg += `نوع السيارة: ${car}\n`;
    if (service) msg += `الخدمة: ${service}\n`;
    if (area)    msg += `المنطقة: ${area}\n`;
    if (notes)   msg += `ملاحظات: ${notes}\n`;
    msg += `\nأرجو التواصل معي لتأكيد الموعد. شكراً!`;

    await new Promise(r => setTimeout(r, 1200));

    window.open(`https://wa.me/96555226675?text=${encodeURIComponent(msg)}`, '_blank');

    // Reset
    form.reset();
    submit.disabled = false;
    stxt.textContent = 'إرسال الطلب عبر واتساب';
    okMsg.classList.add('show');
    setTimeout(() => okMsg.classList.remove('show'), 6000);
  });
})();

/* ================================================================
   9. BACK TO TOP
   ================================================================ */
(function initBTT() {
  const btn = document.getElementById('btt');
  if (!btn) return;
  window.addEventListener('scroll', () => btn.classList.toggle('show', window.scrollY > 400), { passive: true });
  btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ================================================================
   10. RIPPLE EFFECT on buttons
   ================================================================ */
document.querySelectorAll('.cta-primary, .oc-btn-featured, .form-submit, .btn-wa, .btn-call').forEach(btn => {
  btn.addEventListener('click', function(e) {
    const rect = this.getBoundingClientRect();
    const rpl  = document.createElement('span');
    rpl.style.cssText = `
      position:absolute; border-radius:50%; transform:scale(0);
      animation:ripple 0.55s linear; pointer-events:none;
      background:rgba(255,255,255,0.25);
      left:${e.clientX - rect.left - 40}px; top:${e.clientY - rect.top - 40}px;
      width:80px; height:80px;
    `;
    this.appendChild(rpl);
    setTimeout(() => rpl.remove(), 560);
  });
});
const rs = document.createElement('style');
rs.textContent = '@keyframes ripple{to{transform:scale(4);opacity:0}}';
document.head.appendChild(rs);

/* ================================================================
   11. SERVICE CARDS — subtle tilt on hover (desktop)
   ================================================================ */
if (window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.srv-card, .offer-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width  - 0.5) * 6;
      const y = ((e.clientY - r.top)  / r.height - 0.5) * 6;
      card.style.transform = `translateY(-8px) rotateX(${-y}deg) rotateY(${x}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

/* ================================================================
   12. COPY phone on click (nice UX)
   ================================================================ */
document.querySelectorAll('[href^="tel:"]').forEach(a => {
  a.addEventListener('click', async () => {
    const num = a.href.replace('tel:', '');
    try {
      await navigator.clipboard.writeText(num);
      // Small toast
      const toast = document.createElement('div');
      toast.textContent = `✓ تم نسخ ${num}`;
      toast.style.cssText = `
        position:fixed; bottom:90px; left:50%; transform:translateX(-50%);
        background:#1a2e45; color:#fff; padding:10px 20px;
        border-radius:999px; font-size:0.85rem; font-weight:700;
        z-index:9999; animation:fadeIn 0.3s ease;
        font-family: 'Tajawal', sans-serif;
      `;
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2500);
    } catch {}
  });
});

