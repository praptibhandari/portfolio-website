/* ============================================================
   PRAPTI BHANDARI — 3D PORTFOLIO — main.js
   Three.js + Interactive animations + Scroll reveal
   ============================================================ */

'use strict';

// ============================================================
// 1. THREE.JS — Animated Particle Field Background
// ============================================================
(function initThree() {
  const canvas = document.getElementById('bg-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.z = 5;

  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  // --- Particle geometry ---
  const COUNT = 3500;
  const positions = new Float32Array(COUNT * 3);
  const colors = new Float32Array(COUNT * 3);

  const palette = [
    { r: 0.545, g: 0.361, b: 0.965 }, // purple #8b5cf6
    { r: 0.024, g: 0.714, b: 0.831 }, // cyan #06b6d4
    { r: 0.957, g: 0.247, b: 0.369 }, // rose #f43f5e
    { r: 0.2,   g: 0.2,   b: 0.5   }, // dark blue
  ];

  for (let i = 0; i < COUNT; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 30;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 20;

    const c = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3 + 0] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }

  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.PointsMaterial({
    size: 0.06,
    vertexColors: true,
    transparent: true,
    opacity: 0.75,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geo, mat);
  scene.add(points);

  // --- Grid lines ---
  const gridGeo = new THREE.BufferGeometry();
  const gridPoints = [];
  const gridSize = 40;
  const gridStep = 2.5;
  for (let i = -gridSize / 2; i <= gridSize / 2; i += gridStep) {
    gridPoints.push(-gridSize / 2, i, -12, gridSize / 2, i, -12);
    gridPoints.push(i, -gridSize / 2, -12, i, gridSize / 2, -12);
  }
  gridGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(gridPoints), 3));
  const gridMat = new THREE.LineBasicMaterial({ color: 0x8b5cf6, transparent: true, opacity: 0.045 });
  const grid = new THREE.LineSegments(gridGeo, gridMat);
  scene.add(grid);

  // --- Mouse interaction ---
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', e => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // --- Scroll interaction ---
  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; });

  // --- Animation loop ---
  let t = 0;
  function animate() {
    requestAnimationFrame(animate);
    t += 0.004;

    points.rotation.y += 0.0006;
    points.rotation.x += 0.0002;
    points.position.y = Math.sin(t * 0.3) * 0.3;

    camera.position.x += (mouseX * 1.5 - camera.position.x) * 0.04;
    camera.position.y += (-mouseY * 1.5 - camera.position.y) * 0.04;
    camera.lookAt(scene.position);

    const scrollFrac = scrollY / (document.documentElement.scrollHeight - window.innerHeight);
    camera.position.z = 5 + scrollFrac * 3;

    renderer.render(scene, camera);
  }
  animate();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });
})();

// ============================================================
// 2. CUSTOM CURSOR
// ============================================================
(function initCursor() {
  const cursor = document.getElementById('cursor');
  const follower = document.getElementById('cursor-follower');
  if (!cursor || !follower) return;

  let cx = 0, cy = 0;
  let fx = 0, fy = 0;
  const speed = 0.12;

  document.addEventListener('mousemove', e => {
    cx = e.clientX; cy = e.clientY;
  });

  function animateCursor() {
    fx += (cx - fx) * speed;
    fy += (cy - fy) * speed;

    cursor.style.left = cx + 'px';
    cursor.style.top = cy + 'px';
    follower.style.left = fx + 'px';
    follower.style.top = fy + 'px';

    requestAnimationFrame(animateCursor);
  }
  animateCursor();

  // Expand cursor on interactive elements
  document.querySelectorAll('a, button, input, textarea, .project-card, .skill-category, .contact-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(2.5)';
      cursor.style.opacity = '0.5';
      follower.style.transform = 'translate(-50%, -50%) scale(0.5)';
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.transform = 'translate(-50%, -50%) scale(1)';
      cursor.style.opacity = '1';
      follower.style.transform = 'translate(-50%, -50%) scale(1)';
    });
  });

  document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    follower.style.opacity = '0';
  });
  document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    follower.style.opacity = '0.6';
  });
})();

// ============================================================
// 3. NAVBAR — scroll active + hamburger
// ============================================================
(function initNavbar() {
  const navbar = document.getElementById('navbar');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.querySelector('.nav-links');
  const sections = document.querySelectorAll('section[id]');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');

    // Active link
    let current = '';
    sections.forEach(sec => {
      const top = sec.offsetTop - 120;
      if (window.scrollY >= top) current = sec.id;
    });
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === '#' + current);
    });
  });

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      const spans = hamburger.querySelectorAll('span');
      spans[0].style.transform = navLinks.classList.contains('open') ? 'rotate(45deg) translate(5px, 5px)' : '';
      spans[1].style.opacity = navLinks.classList.contains('open') ? '0' : '1';
      spans[2].style.transform = navLinks.classList.contains('open') ? 'rotate(-45deg) translate(5px, -5px)' : '';
    });

    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navLinks.classList.remove('open');
        hamburger.querySelectorAll('span').forEach(s => {
          s.style.transform = ''; s.style.opacity = '';
        });
      });
    });
  }
})();

// ============================================================
// 4. SCROLL REVEAL — Intersection Observer
// ============================================================
(function initReveal() {
  const revealEls = document.querySelectorAll(
    '.section-header, .project-card, .skill-category, .timeline-item, .highlight-item, .contact-card, .hero-badge, .about-card-3d'
  );
  revealEls.forEach(el => el.classList.add('reveal'));

  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  revealEls.forEach(el => obs.observe(el));
})();

// ============================================================
// 5. COUNTER ANIMATION — hero stats
// ============================================================
(function initCounters() {
  const counters = document.querySelectorAll('.stat-num[data-target]');
  const done = new Set();

  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting || done.has(entry.target)) return;
      done.add(entry.target);
      const target = parseInt(entry.target.dataset.target);
      let start = 0;
      const duration = 1800;
      const startTime = performance.now();

      function update(now) {
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        entry.target.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(update);
        else entry.target.textContent = target + (target === 1 ? '' : '+');
      }
      requestAnimationFrame(update);
    });
  }, { threshold: 0.5 });

  counters.forEach(c => obs.observe(c));
})();

// ============================================================
// 6. SKILL BARS — animate on scroll
// ============================================================
(function initSkillBars() {
  const fills = document.querySelectorAll('.pill-fill');
  const obs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('animated');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.3 });
  fills.forEach(f => obs.observe(f));
})();

// ============================================================
// 7. 3D TILT EFFECT — about card & project cards
// ============================================================
(function initTilt() {
  function addTilt(el, intensity = 15) {
    if (!el) return;
    el.addEventListener('mousemove', e => {
      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      el.style.transform = `perspective(800px) rotateY(${x * intensity}deg) rotateX(${-y * intensity}deg) scale(1.02)`;
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = 'perspective(800px) rotateY(0) rotateX(0) scale(1)';
      el.style.transition = 'transform 0.5s ease';
    });
    el.addEventListener('mouseenter', () => {
      el.style.transition = 'transform 0.1s ease';
    });
  }

  addTilt(document.getElementById('about-tilt'), 12);
  document.querySelectorAll('.project-card').forEach(c => addTilt(c, 10));
})();

// ============================================================
// 8. HERO 3D CARD — mouse parallax
// ============================================================
(function initHeroCard() {
  const card = document.getElementById('hero-3d-card');
  if (!card) return;

  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;
    card.style.transform = `perspective(1000px) rotateY(${dx * 18}deg) rotateX(${-dy * 18}deg)`;
  });
})();

// ============================================================
// 9. ORBIT ANIMATION — skills section
// ============================================================
(function initOrbit() {
  const wrapper = document.querySelector('.skills-orbit-wrapper');
  if (!wrapper) return;

  const orbitItems = [
    { label: 'JavaScript', radius: 120, duration: 14 },
    { label: 'Python', radius: 120, duration: 14 },
    { label: 'HTML5 / CSS3', radius: 120, duration: 14 },
    { label: 'REST APIs', radius: 180, duration: 20 },
    { label: 'Git & GitHub', radius: 180, duration: 20 },
    { label: 'Java', radius: 180, duration: 20 },
    { label: 'DSA', radius: 240, duration: 28 },
    { label: 'OOP', radius: 240, duration: 28 },
    { label: 'Netlify', radius: 240, duration: 28 },
  ];

  // Draw rings
  [120, 180, 240].forEach(r => {
    const ring = document.createElement('div');
    ring.className = 'orbit-ring';
    ring.style.width = r * 2 + 'px';
    ring.style.height = r * 2 + 'px';
    ring.style.animationDuration = '999s'; // static, we animate items separately
    ring.style.animation = 'none';
    wrapper.appendChild(ring);
  });

  // Place items
  const groups = {};
  orbitItems.forEach(item => {
    if (!groups[item.radius]) groups[item.radius] = [];
    groups[item.radius].push(item);
  });

  Object.entries(groups).forEach(([radius, items]) => {
    const r = parseInt(radius);
    const angleStep = (2 * Math.PI) / items.length;
    items.forEach((item, idx) => {
      const el = document.createElement('div');
      el.className = 'orbit-item';
      el.textContent = item.label;

      let angle = angleStep * idx;
      const speed = (2 * Math.PI) / (item.duration * 60);

      function tick() {
        angle += speed;
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        el.style.left = `calc(50% + ${x}px - 50px)`;
        el.style.top = `calc(50% + ${y}px - 16px)`;
        requestAnimationFrame(tick);
      }
      tick();
      wrapper.appendChild(el);
    });
  });
})();

// ============================================================
// 10. CONTACT FORM
// ============================================================
(function initForm() {
  const form = document.getElementById('contact-form');
  const success = document.getElementById('form-success');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    btn.disabled = true;
    btn.querySelector('span').textContent = 'Sending…';

    setTimeout(() => {
      form.reset();
      btn.disabled = false;
      btn.querySelector('span').textContent = 'Send Message';
      success.classList.add('show');
      setTimeout(() => success.classList.remove('show'), 4000);
    }, 1200);
  });
})();

// ============================================================
// 11. SMOOTH SCROLL for nav links
// ============================================================
document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    const target = document.querySelector(link.getAttribute('href'));
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ============================================================
// 12. SCROLL INDICATOR — hide after scroll
// ============================================================
(function initScrollIndicator() {
  const si = document.getElementById('scroll-indicator');
  if (!si) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 100) si.style.opacity = '0';
    else si.style.opacity = '1';
  }, { passive: true });
})();

// ============================================================
// 13. FLOATING BADGES — subtle rotation with mouse
// ============================================================
(function initFloatingBadges() {
  const badges = document.querySelectorAll('.floating-badge');
  document.addEventListener('mousemove', e => {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    const dx = (e.clientX - cx) / cx;
    const dy = (e.clientY - cy) / cy;

    badges.forEach((badge, i) => {
      const factor = (i + 1) * 6;
      badge.style.transform = `translate(${dx * factor}px, ${dy * factor}px)`;
    });
  });
})();

console.log('%c✨ Prapti Bhandari Portfolio', 'color:#8b5cf6;font-size:20px;font-weight:900;');
console.log('%cBuilt with Three.js, vanilla JS & ❤️', 'color:#06b6d4;font-size:13px;');
