/* ═══════════════════════════════════════════════════════════════════
   OPERIX — ULTIMATE INTERACTIONS ENGINE + DYNAMIC CMS
   ═══════════════════════════════════════════════════════════════════ */

const SUPABASE_URL = 'https://ktqpafueeyqbeczbzmtv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0cXBhZnVlZXlxYmVjemJ6bXR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1OTYyNTUsImV4cCI6MjEwMTE3MjI1NX0.P0lStl1yyozTJejr5GJXmcJT_mBVJV8GhoXwHdaWz48';
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

document.addEventListener('DOMContentLoaded', async () => {

  // 1. Fetch and inject all dynamic content from Supabase
  await loadSiteContent();
  await loadServices();
  await loadProjects();
  await loadTeam();
  await loadMetrics();

  // 2. Initialize all visual interactions
  initInteractions();
});


async function loadSiteContent() {
  try {
    const { data, error } = await supabaseClient.from('site_content').select('*');
    if (error) throw error;
    data.forEach(item => {
      const els = document.querySelectorAll(`[data-content-key="${item.section_key}"]`);
      els.forEach(el => {
        if (el.tagName.toLowerCase() === 'a') {
          el.href = item.content_value;
        } else {
          el.innerHTML = item.content_value;
        }
      });
    });
  } catch (err) { console.error('CMS Error:', err); }
}

async function loadServices() {
  try {
    const { data, error } = await supabaseClient.from('services').select('*').order('order_index', { ascending: true });
    if (error) throw error;
    const container = document.getElementById('dynamic-services');
    if (!container) return;
    
    container.innerHTML = data.map(item => `
      <div class="p-bento-card ${item.theme_class}">
        <div class="p-bento-glow"></div>
        <div class="p-bento-content">
          <div class="p-bento-top">
            <div class="p-bento-header">
              <div class="p-icon">${item.icon_svg}</div>
              <h3>${item.title}</h3>
            </div>
            <p>${item.description}</p>
            <div class="p-bento-tags">
              ${item.tags.map(tag => `<span class="p-tag">${tag}</span>`).join('')}
            </div>
          </div>
          ${item.visual_html}
        </div>
      </div>
    `).join('');
    
    if (window.lucide) lucide.createIcons();
  } catch (err) { console.error('CMS Error:', err); }
}

async function loadProjects() {
  try {
    const { data, error } = await supabaseClient.from('projects').select('*').order('order_index', { ascending: true });
    if (error) throw error;
    const container = document.getElementById('dynamic-projects');
    if (!container) return;
    
    const renderCard = item => `
      <div class="pf-card ${item.theme_class}" style="cursor: pointer;" onclick="if('${item.link_url}' && '${item.link_url}' !== 'null') window.location.href='${item.link_url}'">
        <div class="pf-visual">
          ${item.visual_html}
          <div class="pf-visual-overlay"></div>
        </div>
        <div class="pf-body">
          <div class="pf-badge ${item.theme_class.includes('murshid') ? 'gold' : 'sys'}">${item.badge_text}</div>
          <h3>${item.title}</h3>
          <p>${item.description}</p>
          <div class="pf-stack">
            ${item.tags.map(tag => `<span class="pf-stack-tag">${tag}</span>`).join('')}
          </div>
          <div class="pf-action">
            <a href="${item.link_url}" class="pf-btn">View Architecture <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></a>
          </div>
        </div>
      </div>
    `;
    
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
    const { data, error } = await supabaseClient.from('metrics').select('*').order('order_index', { ascending: true });
    if (error) throw error;
    const container = document.getElementById('dynamic-metrics');
    if (!container) return;

    container.innerHTML = data.map(item => `
      <div class="p-metric ${item.theme_class}">
        <div class="m-glow"></div>
        <div class="m-val"><span class="m-num" data-target="${item.target_value}">0</span><span class="m-suffix">${item.suffix}</span></div>
        <div class="m-label">${item.label}</div>
      </div>
    `).join('');
  } catch (err) { console.error('CMS Error:', err); }
}

async function loadTeam() {
  try {
    const { data, error } = await supabaseClient.from('team_members').select('*').order('order_index', { ascending: true });
    if (error) throw error;
    const container = document.getElementById('dynamic-team');
    if (!container) return;
    
    container.innerHTML = data.map(item => `
      <div class="team-card">
        <div class="tc-img-wrap">
          <img src="${item.image_url}" alt="${item.name}" class="tc-img">
        </div>
        <div class="tc-body">
          <div class="tc-role">${item.role}</div>
          <h3 class="tc-name">${item.name}</h3>
          <p class="tc-desc">${item.description}</p>
          <div class="tc-footer">
            <div class="tc-tags">
              ${item.tags.map(tag => `<span>[${tag}]</span>`).join('')}
            </div>
            <div class="tc-socials">
              ${item.linkedin_url !== '#' ? `<a href="${item.linkedin_url}"><i data-lucide="linkedin"></i></a>` : `<a href="#"><i data-lucide="linkedin"></i></a>`}
              ${item.github_url !== '#' ? `<a href="${item.github_url}"><i data-lucide="github"></i></a>` : `<a href="#"><i data-lucide="github"></i></a>`}
            </div>
          </div>
        </div>
      </div>
    `).join('');
    
    if (window.lucide) lucide.createIcons();
  } catch (err) { console.error('CMS Error:', err); }
}


function initInteractions() {
  // ═══ GLOBAL CURSOR SPOTLIGHT ════════════════════════════════════
  const cursorGlow = document.querySelector('.cursor-glow');
  let cursorX = 0, cursorY = 0, glowX = 0, glowY = 0;

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

  // ═══ NAVBAR ═════════════════════════════════════════════════════
  const nav = document.querySelector('.nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 30);
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

  // ═══ MOUSE TRACKING GLOW (Cards) ═══════════════════════════════
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
  window.addEventListener('scroll', () => {
    const sy = window.scrollY + 150;
    sections.forEach(sec => {
      const t = sec.offsetTop, h = sec.offsetHeight, id = sec.id;
      if (sy >= t && sy < t + h) {
        navLinks.forEach(l => {
          l.style.color = l.getAttribute('href') === '#' + id ? 'var(--text-1)' : '';
        });
      }
    });
  }, { passive: true });


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
        budget_range: data.fBudget || form.querySelector('#fBudget').value,
        system_specs: data.fType || form.querySelector('#fType').value
      };

      if (!payload.operator_name || !payload.operator_email || !payload.operator_phone || !payload.system_specs || !payload.budget_range) {
        alert("Please fill all required fields.");
        return;
      }

      btnText.textContent = "Processing...";
      
      // JSON Payload ready for Webhook (e.g. n8n endpoint) or Supabase
      console.log("Form Payload:", JSON.stringify(payload));

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
      aiBubble.className = 'bg-white/5 border border-white/5 rounded-2xl rounded-tl-none p-3 text-sm text-gray-300 leading-relaxed';
      aiDiv.appendChild(aiBubble);
      chatBody.insertBefore(aiDiv, typingMsg);

      try {
        // Change to your live URL in production (e.g., https://api.operixsys.online/api/ai/chat)
        const CHAT_API_URL = 'https://api.operixsys.online/api/ai/chat';
        
        const response = await fetch(CHAT_API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: msg, history: [] })
        });

        if (!response.ok) throw new Error("Network response was not ok");

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
                    aiBubble.innerHTML += data.text.replace(/\n/g, '<br>');
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
        aiBubble.innerHTML = `<span class="text-red-400">Connection error. Is the backend running?</span>`;
      }
    });
  }
});
