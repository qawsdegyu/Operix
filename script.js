/* ═══════════════════════════════════════════════════════════════════
   OPERIX — ULTIMATE INTERACTIONS ENGINE + DYNAMIC CMS
   ═══════════════════════════════════════════════════════════════════ */

const SUPABASE_URL = 'https://ktqpafueeyqbeczbzmtv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0cXBhZnVlZXlxYmVjemJ6bXR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1OTYyNTUsImV4cCI6MjEwMTE3MjI1NX0.P0lStl1yyozTJejr5GJXmcJT_mBVJV8GhoXwHdaWz48';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Security helper: escape text before inserting into HTML context
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

document.addEventListener('DOMContentLoaded', async () => {
  const loader = document.getElementById('global-loader');
  if (loader) {
    loader.style.display = 'flex';
    loader.style.opacity = '1';
  }

  // 1. Wait for i18n to initialize (it runs before this script)
  //    Then fetch and inject all dynamic content from Supabase
  await loadSiteContent();
  await loadServices();
  await loadProjects();
  await loadTeam();
  await loadMetrics();
  await loadTestimonials();

  // 2. Initialize all visual interactions
  initInteractions();

  if (loader) {
    loader.style.opacity = '0';
    setTimeout(() => { loader.style.display = 'none'; }, 500);
  }

  // 3. Re-render dynamic content on language change
  document.addEventListener('languageChanged', async () => {
    if (loader) {
      loader.style.display = 'flex';
      // tiny delay to ensure display block is applied before opacity transition
      setTimeout(() => { loader.style.opacity = '1'; }, 10);
    }

    await loadSiteContent();
    await loadServices();
    await loadProjects();
    await loadTeam();
    await loadMetrics();
    await loadTestimonials();

    if (loader) {
      loader.style.opacity = '0';
      setTimeout(() => { loader.style.display = 'none'; }, 500);
    }
  });
});

async function loadTestimonials() {
  try {
    const lang = (window.I18n && window.I18n.getLang()) || 'en';
    const { data, error } = await supabaseClient.from('testimonials').select('*').order('order_index', { ascending: true });
    if (error) throw error;
    
    const container = document.getElementById('test-slider');
    if (!container) return;
    
    if (!data || data.length === 0) {
      container.innerHTML = '<p style="color:var(--text-3); text-align:center; width:100%;">No testimonials yet.</p>';
      return;
    }
    
    container.innerHTML = data.map(item => {
      const quote = escapeHtml((lang === 'ar' && item.quote_ar) ? item.quote_ar : item.quote);
      const author = escapeHtml((lang === 'ar' && item.author_name_ar) ? item.author_name_ar : item.author_name);
      const role = escapeHtml((lang === 'ar' && item.author_role_ar) ? item.author_role_ar : item.author_role);
      // Validate project_link: only allow relative paths or https URLs, not javascript:
      const rawLink = item.project_link;
      const link = rawLink && /^(https?:\/\/|\/)/.test(rawLink) ? rawLink : '#work';
      
      const viewProjectText = (window.I18n && window.I18n.t) ? window.I18n.t('testimonials.view_project') : 'View Project';
      
      return `
        <a href="${escapeHtml(link)}" class="test-card">
          <div class="test-badge">
            <span class="glow-dot"></span>
            PROJECT FEEDBACK
            <span class="badge-line"></span>
          </div>
          <div class="test-quote">
            <p>"${quote}"</p>
          </div>
          <div class="test-footer">
            <div class="test-author">
              <h4>${author}</h4>
              <span>${role}</span>
            </div>
            <div class="test-link">${escapeHtml(viewProjectText)} <i data-lucide="arrow-right"></i></div>
          </div>
        </a>
      `;
    }).join('');
    
    if (window.lucide) lucide.createIcons();
  } catch (err) {
    console.error('Testimonials Error:', err);
  }
}


async function loadSiteContent() {
  try {
    const lang = (window.I18n && window.I18n.getLang()) || 'en';
    const { data, error } = await supabaseClient.from('site_content').select('*');
    if (error) throw error;

    // Build a lookup map for both langs
    const contentMap = {};
    data.forEach(item => { contentMap[item.section_key] = item.content_value; });

    const els = document.querySelectorAll('[data-content-key]');
    els.forEach(el => {
      const key = el.getAttribute('data-content-key');
      const value = (lang === 'ar' && contentMap[key + '_ar']) 
        ? contentMap[key + '_ar'] 
        : contentMap[key];
      
      if (value) {
        if (el.tagName.toLowerCase() === 'a') {
          // Only allow safe URL schemes
          const safeUrl = /^(https?:\/\/|\/)/.test(value) ? value : '#';
          el.href = safeUrl;
        } else {
          // site_content may include intentional HTML spans (highlight class)
          // Use innerHTML but ONLY for fields that are admin-controlled (not user input)
          el.innerHTML = value;
        }
      }
    });
  } catch (err) { console.error('CMS Error:', err); }
}

async function loadServices() {
  try {
    const lang = (window.I18n && window.I18n.getLang()) || 'en';
    const { data, error } = await supabaseClient.from('services').select('*').order('order_index', { ascending: true });
    if (error) throw error;
    const container = document.getElementById('dynamic-services');
    if (!container) return;
    
    const viewLabel = lang === 'ar' ? 'عرض التفاصيل' : 'View Details';

    container.innerHTML = data.map(item => {
      const title = escapeHtml((lang === 'ar' && item.title_ar) ? item.title_ar : item.title);
      const desc  = escapeHtml((lang === 'ar' && item.description_ar) ? item.description_ar : item.description);
      const tags  = (lang === 'ar' && item.tags_ar && item.tags_ar.length > 0) ? item.tags_ar : item.tags;
      return `
        <div class="p-bento-card ${escapeHtml(item.theme_class)}">
          <div class="p-bento-glow"></div>
          <div class="p-bento-content">
            <div class="p-bento-top">
              <div class="p-bento-header">
                <div class="p-icon">${item.icon_svg}</div>
                <h3>${title}</h3>
              </div>
              <p>${desc}</p>
              <div class="p-bento-tags">
                ${tags.map(tag => `<span class="p-tag">${escapeHtml(tag)}</span>`).join('')}
              </div>
            </div>
            ${item.visual_html}
          </div>
        </div>
      `;
    }).join('');
    
    if (window.lucide) lucide.createIcons();
  } catch (err) { console.error('CMS Error:', err); }
}

async function loadProjects() {
  try {
    const lang = (window.I18n && window.I18n.getLang()) || 'en';
    const { data, error } = await supabaseClient.from('projects').select('*').order('order_index', { ascending: true });
    if (error) throw error;
    const container = document.getElementById('dynamic-projects');
    if (!container) return;
    
    const viewLabel = lang === 'ar' ? 'عرض البنية ←' : 'View Architecture →';

    const renderCard = item => {
      const title  = escapeHtml((lang === 'ar' && item.title_ar)       ? item.title_ar       : item.title);
      const desc   = escapeHtml((lang === 'ar' && item.description_ar) ? item.description_ar : item.description);
      const badge  = escapeHtml((lang === 'ar' && item.badge_text_ar)  ? item.badge_text_ar  : item.badge_text);
      const tags   = (lang === 'ar' && item.tags_ar && item.tags_ar.length > 0) ? item.tags_ar : item.tags;
      // Validate link URL — only allow https:// or relative paths
      const rawLink = item.link_url;
      const safeLink = rawLink && /^(https?:\/\/|\/)/.test(rawLink) ? rawLink : '#';
      return `
        <div class="pf-card ${escapeHtml(item.theme_class)}" style="cursor: pointer;" onclick="if('${escapeHtml(safeLink)}' && '${escapeHtml(safeLink)}' !== '#') window.location.href='${escapeHtml(safeLink)}'">
          <div class="pf-visual">
            ${item.visual_html}
            <div class="pf-visual-overlay"></div>
          </div>
          <div class="pf-body">
            <div class="pf-badge ${escapeHtml(item.theme_class).includes('murshid') ? 'gold' : 'sys'}">${badge}</div>
            <h3>${title}</h3>
            <p>${desc}</p>
            <div class="pf-stack">
              ${tags.map(tag => `<span class="pf-stack-tag">${escapeHtml(tag)}</span>`).join('')}
            </div>
            <div class="pf-action">
              <a href="${escapeHtml(safeLink)}" class="pf-btn">${viewLabel} <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>
            </div>
          </div>
        </div>
      `;
    };
    
    // Create two identical sets to ensure gap calculations are perfect for translateX(-50%)
    const setHtml = `<div class="marquee-set" style="display: flex; gap: 20px; padding-right: 20px;">
      ${data.map(renderCard).join('')}
    </div>`;
    
    container.innerHTML = setHtml + setHtml;
    
    if (window.lucide) lucide.createIcons();
    
    // No JS init needed for pure CSS marquee
  } catch (err) { console.error('CMS Error:', err); }
}

async function loadMetrics() {
  try {
    const lang = (window.I18n && window.I18n.getLang()) || 'en';
    const { data, error } = await supabaseClient.from('metrics').select('*').order('order_index', { ascending: true });
    if (error) throw error;
    const container = document.getElementById('dynamic-metrics');
    if (!container) return;

    container.innerHTML = data.map(item => {
      const label = (lang === 'ar' && item.label_ar) ? item.label_ar : item.label;
      return `
        <div class="p-metric ${item.theme_class}">
          <div class="m-glow"></div>
          <div class="m-val"><span class="m-num" data-target="${item.target_value}">0</span><span class="m-suffix">${item.suffix}</span></div>
          <div class="m-label">${label}</div>
        </div>
      `;
    }).join('');
    
    // Attach observers to new metric elements
    if (typeof initMetricsAnimation === 'function') {
      initMetricsAnimation();
    }
  } catch (err) { console.error('CMS Error:', err); }
}

//  GLOBAL METRICS ANIMATION 
function initMetricsAnimation() {
  const counters = document.querySelectorAll('.m-num');
  if (window.metricObserver) {
    window.metricObserver.disconnect();
  }
  
  window.metricObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        window.metricObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  
  counters.forEach(c => window.metricObserver.observe(c));

  function animateCount(el) {
    const target = parseInt(el.dataset.target);
    if (isNaN(target)) return;
    const duration = 2500;
    const start = performance.now();

    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      const val = Math.round(eased * target);
      el.textContent = val.toLocaleString();
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }
}

async function loadTeam() {
  try {
    const lang = (window.I18n && window.I18n.getLang()) || 'en';
    const { data, error } = await supabaseClient.from('team_members').select('*').order('order_index', { ascending: true });
    if (error) throw error;
    const container = document.getElementById('dynamic-team');
    if (!container) return;
    
    container.innerHTML = data.map(item => {
      const name = escapeHtml((lang === 'ar' && item.name_ar)        ? item.name_ar        : item.name);
      const role = escapeHtml((lang === 'ar' && item.role_ar)        ? item.role_ar        : item.role);
      const desc = escapeHtml((lang === 'ar' && item.description_ar) ? item.description_ar : item.description);
      const tags = (lang === 'ar' && item.tags_ar && item.tags_ar.length > 0) ? item.tags_ar : item.tags;
      // Allow https:// or data:image/ URLs for base64 uploads
      const imgUrl = item.image_url && /^(https?:\/\/|data:image\/)/.test(item.image_url) ? item.image_url : '';
      // Safe social links
      const linkedinUrl = item.linkedin_url && /^https?:\/\//.test(item.linkedin_url) ? item.linkedin_url : '#';
      const githubUrl = item.github_url && /^https?:\/\//.test(item.github_url) ? item.github_url : '#';
      return `
        <div class="team-card">
          <div class="tc-img-wrap">
            ${imgUrl ? `<img src="${escapeHtml(imgUrl)}" alt="${name}" class="tc-img" loading="lazy">` : ''}
          </div>
          <div class="tc-body">
            <div class="tc-role">${role}</div>
            <h3 class="tc-name">${name}</h3>
            <p class="tc-desc">${desc}</p>
            <div class="tc-footer">
              <div class="tc-tags">
                ${tags.map(tag => `<span>[${escapeHtml(tag)}]</span>`).join('')}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    if (window.lucide) lucide.createIcons();
  } catch (err) { console.error('CMS Error:', err); }
}


function initInteractions() {
  // ═══ GLOBAL CURSOR SPOTLIGHT ════════════════════════════════════
  const cursorGlow = document.querySelector('.cursor-glow');
  let cursorX = 0, cursorY = 0, glowX = 0, glowY = 0;

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    document.addEventListener('mousemove', e => {
      cursorX = e.clientX;
      cursorY = e.clientY;
    });

    function animateCursor() {
      glowX += (cursorX - glowX) * 0.08;
      glowY += (cursorY - glowY) * 0.08;
      if (cursorGlow) {
        cursorGlow.style.transform = `translate3d(${glowX}px, ${glowY}px, 0) translate(-50%, -50%)`;
      }
      requestAnimationFrame(animateCursor);
    }
    animateCursor();
  }

  // ═══ NAVBAR & AMBIENT GLOW ══════════════════════════════════════
  const nav = document.querySelector('.nav');
  const ambientGlow = document.querySelector('.ambient-glow');
  let scrollTicking = false;

  window.addEventListener('scroll', () => {
    if (!scrollTicking) {
      window.requestAnimationFrame(() => {
        nav.classList.toggle('scrolled', window.scrollY > 30);
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }, { passive: true });

  // ═══ MOBILE MENU ════════════════════════════════════════════════
  const toggle = document.querySelector('.mobile-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  if (toggle && mobileMenu) {
    toggle.addEventListener('click', () => {
      toggle.classList.toggle('active');
      mobileMenu.classList.toggle('open');
      document.body.style.overflow = mobileMenu.classList.contains('open') ? 'hidden' : '';
    });
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      toggle.classList.remove('active');
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
    }));
  }


  // ═══ SMOOTH SCROLL ═════════════════════════════════════════════
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth' }); }
    });
  });

  // ═══ SCROLL REVEAL ═════════════════════════════════════════════
  const reveals = document.querySelectorAll('.reveal');
  const revealObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('vis');
        revealObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.06, rootMargin: '0px 0px -30px 0px' });
  reveals.forEach(el => revealObs.observe(el));

  // ═══ MOUSE TRACKING GLOW (Cards) & 3D TILT ═══════════════════════════════
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const glowCards = document.querySelectorAll('.bento-card, .pf-card, .h-card, .p-bento-card');
    glowCards.forEach(card => {
      let ticking = false;
      card.addEventListener('mousemove', e => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const r = card.getBoundingClientRect();
            card.style.setProperty('--mx', `${e.clientX - r.left}px`);
            card.style.setProperty('--my', `${e.clientY - r.top}px`);
            ticking = false;
          });
          ticking = true;
        }
      });
    });

    // ═══ 3D TILT on BENTO CARDS ════════════════════════════════════
    const tiltCards = document.querySelectorAll('.bento-card, .h-card');
    tiltCards.forEach(card => {
      let ticking = false;
      card.addEventListener('mousemove', e => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const midX = rect.width / 2;
            const midY = rect.height / 2;
            const rotateY = ((x - midX) / midX) * 5;   // max 5deg
            const rotateX = ((midY - y) / midY) * 5;
            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02) translateZ(0)`;
            ticking = false;
          });
          ticking = true;
        }
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) scale(1) translateZ(0)';
        card.style.transition = 'transform 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
        setTimeout(() => card.style.transition = '', 600);
      });
    });
  }

  // ═══ HERO DYNAMIC COUNTERS ═════════════════════════════════════
  const dynCounters = document.querySelectorAll('[data-dyn]');
  dynCounters.forEach(el => {
    const target = parseInt(el.dataset.dyn);
    const duration = 2000;
    const start = performance.now();
    
    // Slight delay before counting up
    setTimeout(() => {
      function tick(now) {
        const t = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - t, 4); // Quartic ease out
        el.textContent = Math.round(eased * target);
        if (t < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    }, 1200); // Wait for card entrance animation
  });

  // ═══ MAGNETIC BUTTON ═══════════════════════════════════════════
  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const magBtns = document.querySelectorAll('.btn-mag');
    magBtns.forEach(btn => {
      let ticking = false;
      btn.addEventListener('mousemove', e => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const r = btn.getBoundingClientRect();
            const x = e.clientX - r.left;
            const y = e.clientY - r.top;
            const dx = (x - r.width / 2) * 0.2;
            const dy = (y - r.height / 2) * 0.2;
            btn.style.transform = `translate3d(${dx}px, ${dy}px, 0)`;
            btn.style.setProperty('--mx', `${(x / r.width) * 100}%`);
            btn.style.setProperty('--my', `${(y / r.height) * 100}%`);
            ticking = false;
          });
          ticking = true;
        }
      });
      btn.addEventListener('mouseleave', () => {
        btn.style.transform = 'translate3d(0, 0, 0)';
      });
    });
  }

  // ═══ TERMINAL — Character-by-Character Typing ══════════════════
  const tLines = document.querySelectorAll('.t-line');
  const tCursor = document.querySelector('.t-cursor');
  let terminalStarted = false;

  const termObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !terminalStarted) {
        terminalStarted = true;
        runTerminal();
        termObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.2 });

  const termEl = document.querySelector('.terminal');
  if (termEl) termObs.observe(termEl);

  async function runTerminal() {
    for (let i = 0; i < tLines.length; i++) {
      const line = tLines[i];
      const delay = parseInt(line.dataset.d) || 500;
      await sleep(delay);

      const cmdEl = line.querySelector('.cm');
      if (cmdEl && line.dataset.type === 'cmd') {
        const text = cmdEl.dataset.text;
        cmdEl.textContent = '';
        line.classList.add('vis');
        if (tCursor) line.appendChild(tCursor);

        for (let c = 0; c < text.length; c++) {
          cmdEl.textContent += text[c];
          await sleep(25 + Math.random() * 35);
        }
      } else {
        line.classList.add('vis');
        if (tCursor && i === tLines.length - 1) {
          line.appendChild(tCursor);
        }
      }
    }
  }

  function sleep(ms) {
    return new Promise(r => setTimeout(r, ms));
  }

  // ═══ ANIMATED COUNTERS (Micro-Bento) ═════════════════════════════
  const counters = document.querySelectorAll('.m-num');
  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        counterObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });
  counters.forEach(c => counterObs.observe(c));

  function animateCount(el) {
    const target = parseInt(el.dataset.target);
    const duration = 2500;
    const start = performance.now();

    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      const val = Math.round(eased * target);
      el.textContent = val.toLocaleString();
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  // ═══ ACTIVE NAV ════════════════════════════════════════════════
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
  
  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(l => {
          l.style.color = l.getAttribute('href') === '#' + entry.target.id ? 'var(--text-1)' : '';
        });
      }
    });
  }, { threshold: 0.3, rootMargin: "-100px 0px -40% 0px" });

  sections.forEach(sec => navObserver.observe(sec));


  // ═══ FORM VALIDATION & SUPABASE INTEGRATION ════════════════════
  const form = document.querySelector('.terminal-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const btn = form.querySelector('.tf-submit');
      const btnText = btn.querySelector('span');
      const ogText = btnText.textContent;

      // Serialize data using FormData
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      
      // We will map the FormData names if they were set, but since we rely on IDs mostly,
      // let's ensure we use the IDs or add name attributes.
      // Wait, since we are doing FormData, inputs MUST have name attributes! Let's just 
      // extract them safely or assume they are mapped.
      // For this example, I'll add the manual extraction back if name attributes are missing,
      // but use FormData as the primary method as requested by the audit.
      const payload = {
        operator_name: data.fName || form.querySelector('#fName').value.trim(),
        corporate_entity: 'N/A',
        operator_email: data.fEmail || form.querySelector('#fEmail').value.trim(),
        operator_phone: data.fPhone || form.querySelector('#fPhone').value.trim(),
        budget_range: 'N/A',
        system_specs: data.fMessage || form.querySelector('#fMessage').value.trim()
      };

      if (!payload.operator_name || !payload.operator_email || !payload.operator_phone || !payload.system_specs) {
        // Use i18n validation messages
        const t = window.I18n ? window.I18n.t.bind(window.I18n) : k => k;
        if (!payload.operator_name)  { alert(t('validation.name_required'));   return; }
        if (!payload.operator_email) { alert(t('validation.email_required'));  return; }
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(payload.operator_email)) { alert(t('validation.email_invalid')); return; }
        if (!payload.operator_phone) { alert(t('validation.phone_required'));  return; }
        if (!payload.system_specs)   { alert("Please enter your project details.");   return; }
        return;
      }

      btnText.textContent = "Processing...";
      
      // JSON Payload ready
      // NOTE: Never log PII to console in production

      // 1. Insert into Supabase 'leads' table
      const { error } = await supabaseClient.from('leads').insert([payload]);

      if (error) {
        console.error("Submission Error", error);
        alert("System error. Please try again later.");
        btnText.textContent = ogText;
        return;
      }

      // 2. Send Email Notification directly to Gmail (via Web3Forms)
      try {
        await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            access_key: "db011726-0ab0-42a3-bde8-98a1ddf2c5b5",
            subject: "New Project Lead - Operix",
            from_name: "Operix Portal",
            message: `New form submission received!\n\nName: ${payload.operator_name}\nEmail: ${payload.operator_email}\nPhone: ${payload.operator_phone}\nBudget: ${payload.budget_range}\nRequired System: ${payload.system_specs}`
          })
        });
      } catch (emailErr) {
        console.error("Email notification failed", emailErr);
      }

      // Success
      btnText.textContent = "Deployment Initialized";
      document.getElementById('toast').classList.add('show');
      setTimeout(() => document.getElementById('toast').classList.remove('show'), 4000);
      form.reset();
      btnText.textContent = ogText;
    });
  }

}

// ═══ AI CHAT WIDGET ══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  const chatToggle = document.querySelector('.chat-widget-toggle');
  const chatWindow = document.getElementById('ai-chat-window');
  const chatClose = document.querySelector('.chat-close');
  const chatForm = document.getElementById('chatForm');
  const chatInput = document.getElementById('chatInput');
  const chatBody = document.getElementById('chatBody');
  const typingMsg = document.querySelector('.typing-msg');

  if (chatToggle && chatWindow) {
    // Helper to close the chat
    const closeChat = () => {
      chatWindow.classList.remove('flex', 'scale-100', 'opacity-100');
      chatWindow.classList.add('hidden', 'scale-95', 'opacity-0');
    };

    // Helper to open the chat
    const openChat = () => {
      chatWindow.classList.remove('hidden', 'scale-95', 'opacity-0');
      chatWindow.classList.add('flex', 'scale-100', 'opacity-100');
      chatInput.focus();
    };

    // Toggle chat on FAB click
    chatToggle.addEventListener('click', (e) => {
      e.stopPropagation(); // Prevent bubbling to document
      if (chatWindow.classList.contains('hidden')) {
        openChat();
      } else {
        closeChat();
      }
    });

    // Close on X button
    chatClose.addEventListener('click', closeChat);

    // Close when clicking anywhere outside the chat window
    document.addEventListener('click', (e) => {
      // If chat is open, and click is outside the chat window and outside the toggle button
      if (!chatWindow.classList.contains('hidden') && 
          !chatWindow.contains(e.target) && 
          !chatToggle.contains(e.target)) {
        closeChat();
      }
    });

    chatForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const msg = chatInput.value.trim();
      if (!msg) return;

      // Append User Message
      const userDiv = document.createElement('div');
      userDiv.className = 'chat-msg user-msg self-end max-w-[85%]';
      userDiv.innerHTML = `<div class="bg-blue-600 text-white rounded-2xl rounded-tr-none p-3 text-sm leading-relaxed">${msg}</div>`;
      chatBody.insertBefore(userDiv, typingMsg);
      chatInput.value = '';
      chatBody.scrollTop = chatBody.scrollHeight;

      // Show Typing Indicator
      typingMsg.classList.remove('hidden');
      chatBody.scrollTop = chatBody.scrollHeight;

      // Prepare AI Message Container
      const aiDiv = document.createElement('div');
      aiDiv.className = 'chat-msg ai-msg self-start max-w-[85%] hidden';
      const aiBubble = document.createElement('div');
      // Added whitespace-pre-wrap to properly render newlines (\n) returned by the AI
      aiBubble.className = 'bg-white/5 border border-white/5 rounded-2xl rounded-tl-none p-3 text-sm text-gray-300 leading-relaxed whitespace-pre-wrap';
      aiDiv.appendChild(aiBubble);
      chatBody.insertBefore(aiDiv, typingMsg);

      try {
        // Change to your live URL in production or use relative path if hosted together
        const CHAT_API_URL = '/api/ai/chat';
        
        const response = await fetch(CHAT_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg, history: [] })
        });

        if (!response.ok) {
          let errMsg = "Network response was not ok";
          try {
            const errData = await response.json();
            if (errData.error) errMsg = errData.error;
          } catch (e) {}
          throw new Error(errMsg);
        }
        typingMsg.classList.add('hidden');
        aiDiv.classList.remove('hidden');

        // Read the SSE stream
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let done = false;

        while (!done) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            const chunk = decoder.decode(value, { stream: true });
            const lines = chunk.split('\n');
            for (const line of lines) {
              if (line.startsWith('data: ')) {
                const dataStr = line.slice(6);
                if (dataStr === '[DONE]') {
                  done = true;
                  break;
                }
                try {
                  const data = JSON.parse(dataStr);
                  if (data.text) {
                    // Sanitize AI response: display as text, not HTML
                    const textNode = document.createTextNode(data.text);
                    aiBubble.appendChild(textNode);
                    chatBody.scrollTop = chatBody.scrollHeight;
                  } else if (data.error) {
                    aiBubble.innerHTML += `<br><span class="text-red-400">[Error: ${data.error}]</span>`;
                  }
                } catch (err) {}
              }
            }
          }
        }
      } catch (error) {
        typingMsg.classList.add('hidden');
        aiDiv.classList.remove('hidden');
        aiBubble.textContent = `Error: ${error.message}`;
      }
    });
  }
});
