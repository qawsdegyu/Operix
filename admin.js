// Supabase Credentials (Provided by User)
const SUPABASE_URL = 'https://ktqpafueeyqbeczbzmtv.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0cXBhZnVlZXlxYmVjemJ6bXR2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU1OTYyNTUsImV4cCI6MjEwMTE3MjI1NX0.P0lStl1yyozTJejr5GJXmcJT_mBVJV8GhoXwHdaWz48';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// DOM Elements
const navItems = document.querySelectorAll('.nav-item');
const panels = document.querySelectorAll('.panel');
const pageTitle = document.getElementById('page-title');
const btnSaveContent = document.getElementById('btn-save-content');
const btnAddNew = document.getElementById('btn-add-new');
const btnSaveAI = document.getElementById('btn-save-ai');
const aiContextTextarea = document.getElementById('ai-context-textarea');

// Modal Elements
const modalOverlay = document.getElementById('edit-modal');
const modalClose = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-title');
const modalFormContainer = document.getElementById('modal-form-container');
const modalSave = document.getElementById('modal-save');

let currentPanel = 'panel-content';
let currentEditingTable = null;
let currentEditingId = null;

// Helper: get current i18n lang
function adminLang() {
  return (window.I18n && window.I18n.getLang()) || 'en';
}

// Re-render tables when language changes
document.addEventListener('languageChanged', () => {
  if (currentPanel === 'panel-projects') loadProjects();
  if (currentPanel === 'panel-services') loadServices();
  if (currentPanel === 'panel-metrics') loadMetrics();
  if (currentPanel === 'panel-team') loadTeam();
  if (currentPanel === 'panel-leads') loadLeads();
  if (currentPanel === 'panel-testimonials') loadTestimonials();
});

// Tab Switching Logic
navItems.forEach(item => {
  item.addEventListener('click', () => {
    navItems.forEach(n => n.classList.remove('active'));
    panels.forEach(p => p.classList.remove('active'));

    item.classList.add('active');
    const target = item.getAttribute('data-target');
    document.getElementById(target).classList.add('active');
    currentPanel = target;

    // Update Header
    pageTitle.textContent = item.textContent.trim();

    if (target === 'panel-content') {
      btnSaveContent.style.display = 'inline-block';
      if (btnSaveAI) btnSaveAI.style.display = 'none';
      btnAddNew.style.display = 'none';
      loadSiteContent();
    } else if (target === 'panel-ai') {
      btnSaveContent.style.display = 'none';
      if (btnSaveAI) btnSaveAI.style.display = 'inline-block';
      btnAddNew.style.display = 'none';
      loadAIContext();
    } else if (target === 'panel-leads') {
      btnSaveContent.style.display = 'none';
      if (btnSaveAI) btnSaveAI.style.display = 'none';
      btnAddNew.style.display = 'none';
      loadLeads();
    } else {
      btnSaveContent.style.display = 'none';
      if (btnSaveAI) btnSaveAI.style.display = 'none';
      btnAddNew.style.display = 'inline-block';
      if (target === 'panel-projects') loadProjects();
      if (target === 'panel-services') loadServices();
      if (target === 'panel-metrics') loadMetrics();
      if (target === 'panel-team') loadTeam();
      if (target === 'panel-testimonials') loadTestimonials();
    }
  });
});

// ==========================================
// 0. AI CONTEXT
// ==========================================
async function loadAIContext() {
  try {
    const res = await fetch('/api/ai/context');
    const data = await res.json();
    if (data.context) {
      aiContextTextarea.value = data.context;
    } else if (table === 'testimonials') {
      document.getElementById('test-id').value = data.id;
      document.getElementById('test-quote').value = data.quote;
      document.getElementById('test-quote-ar').value = data.quote_ar || '';
      document.getElementById('test-name').value = data.author_name;
      document.getElementById('test-name-ar').value = data.author_name_ar || '';
      document.getElementById('test-role').value = data.author_role;
      document.getElementById('test-role-ar').value = data.author_role_ar || '';
      document.getElementById('test-link').value = data.project_link || '';
      document.getElementById('test-order').value = data.order_index;
      openModal('modal-testimonials');
    }
  } catch (err) {
    console.error("Error loading context:", err);
  }
}

if (btnSaveAI) {
  btnSaveAI.addEventListener('click', async () => {
    const contextValue = aiContextTextarea.value;
    btnSaveAI.textContent = 'Saving...';
    btnSaveAI.disabled = true;
    
    try {
      const res = await fetch('/api/ai/context', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ context: contextValue })
      });
      
      if (res.ok) {
        alert('✅ AI Context successfully updated!');
      } else {
        alert('❌ Error saving context.');
      }
    } catch (err) {
      console.error("Error saving context:", err);
      alert('❌ Connection Error.');
    } finally {
      btnSaveAI.textContent = 'Save AI Context';
      btnSaveAI.disabled = false;
    }
  });
}

// ==========================================
// 1. SITE CONTENT
// ==========================================
async function loadSiteContent() {
  const { data, error } = await supabaseClient.from('site_content').select('*').order('section_key', { ascending: true });
  if (error) { console.error(error); return; }

  const container = document.getElementById('content-forms');
  container.innerHTML = '';

  data.forEach(item => {
    const isTextarea = item.content_value.length > 50;
    const inputHtml = isTextarea
      ? `<textarea id="sc-${item.id}" rows="3" data-key="${item.section_key}">${item.content_value}</textarea>`
      : `<input type="text" id="sc-${item.id}" data-key="${item.section_key}" value="${item.content_value.replace(/"/g, '&quot;')}" />`;

    container.innerHTML += `
      <div class="form-group">
        <label>${item.section_key.replace(/_/g, ' ').toUpperCase()}</label>
        ${inputHtml}
      </div>
    `;
  });
}

btnSaveContent.addEventListener('click', async () => {
  btnSaveContent.textContent = 'Saving...';
  const inputs = document.querySelectorAll('#content-forms input, #content-forms textarea');

  for (let input of inputs) {
    const key = input.getAttribute('data-key');
    const val = input.value;
    await supabaseClient.from('site_content').update({ content_value: val }).eq('section_key', key);
  }

  btnSaveContent.textContent = 'Saved!';
  setTimeout(() => btnSaveContent.textContent = 'Save Changes', 2000);
});

// ==========================================
// 2. PROJECTS
// ==========================================
async function loadProjects() {
  const lang = adminLang();
  const tbody = document.getElementById('projects-tbody');
  tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
  const { data, error } = await supabaseClient.from('projects').select('*').order('order_index', { ascending: true });
  if (error) {
    tbody.innerHTML = `<tr><td colspan="4" style="color:red">Error: ${error.message}</td></tr>`;
    return;
  }
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4">No projects found. Please add one.</td></tr>';
    return;
  }
  const editLabel = lang === 'ar' ? 'تعديل' : 'Edit';
  const delLabel  = lang === 'ar' ? 'حذف' : 'Del';
  tbody.innerHTML = data.map(item => {
    const title = (lang === 'ar' && item.title_ar) ? item.title_ar : item.title;
    const badge = (lang === 'ar' && item.badge_text_ar) ? item.badge_text_ar : item.badge_text;
    const desc  = (lang === 'ar' && item.description_ar) ? item.description_ar : item.description;
    return `
      <tr>
        <td><strong>${title}</strong><br><span style="font-size:0.8rem; color:#888">${desc.substring(0, 50)}...</span></td>
        <td><span style="background:rgba(255,255,255,0.1); padding:4px 8px; border-radius:4px; font-size:0.7rem;">${badge || item.badge_text}</span></td>
        <td>${JSON.stringify(item.tags)}</td>
        <td>
          <button class="btn btn-sm" onclick="editRecord('projects', '${item.id}')">${editLabel}</button>
          <button class="btn btn-sm btn-danger" onclick="deleteRecord('projects', '${item.id}')">${delLabel}</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ==========================================
// 3. SERVICES
// ==========================================
async function loadServices() {
  const lang = adminLang();
  const tbody = document.getElementById('services-tbody');
  tbody.innerHTML = '<tr><td colspan="4">Loading...</td></tr>';
  const { data, error } = await supabaseClient.from('services').select('*').order('order_index', { ascending: true });
  if (error) {
    tbody.innerHTML = `<tr><td colspan="4" style="color:red">Error: ${error.message}</td></tr>`;
    return;
  }
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="4">No services found. Please add one.</td></tr>';
    return;
  }
  const editLabel = lang === 'ar' ? 'تعديل' : 'Edit';
  const delLabel = lang === 'ar' ? 'حذف' : 'Del';
  tbody.innerHTML = data.map(item => {
    const title = (lang === 'ar' && item.title_ar) ? item.title_ar : item.title;
    const desc  = (lang === 'ar' && item.description_ar) ? item.description_ar : item.description;
    return `
      <tr>
        <td><strong>${title}</strong></td>
        <td><span style="font-size:0.8rem; color:#888">${desc.replace(/<[^>]+>/g,'').substring(0, 80)}...</span></td>
        <td>
          <button class="btn btn-sm" style="margin-right:5px; background:var(--primary);" onclick="editRecord('services', '${item.id}')">${editLabel}</button>
          <button class="btn btn-sm btn-danger" onclick="deleteRecord('services', '${item.id}')">${delLabel}</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ==========================================
// 4. METRICS
// ==========================================
async function loadMetrics() {
  const lang = adminLang();
  const tbody = document.getElementById('metrics-tbody');
  tbody.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';
  const { data, error } = await supabaseClient.from('metrics').select('*').order('order_index', { ascending: true });
  if (error) {
    tbody.innerHTML = `<tr><td colspan="3" style="color:red">Error: ${error.message}</td></tr>`;
    return;
  }
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3">No metrics found. Please add one.</td></tr>';
    return;
  }
  const editLabel = lang === 'ar' ? 'تعديل' : 'Edit';
  const delLabel  = lang === 'ar' ? 'حذف' : 'Del';
  tbody.innerHTML = data.map(item => {
    const label = (lang === 'ar' && item.label_ar) ? item.label_ar : item.label;
    return `
      <tr>
        <td><strong>${label}</strong></td>
        <td><span style="font-size:1.2rem; font-weight:bold; color:var(--primary)">${item.target_value}</span> ${item.suffix}</td>
        <td>
          <button class="btn btn-sm" style="margin-right:5px; background:var(--primary);" onclick="editRecord('metrics', '${item.id}')">${editLabel}</button>
          <button class="btn btn-sm btn-danger" onclick="deleteRecord('metrics', '${item.id}')">${delLabel}</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ==========================================
// 5. TEAM MEMBERS
// ==========================================
async function loadTeam() {
  const lang = adminLang();
  const tbody = document.getElementById('team-tbody');
  tbody.innerHTML = '<tr><td colspan="3">Loading...</td></tr>';
  const { data, error } = await supabaseClient.from('team_members').select('*').order('order_index', { ascending: true });
  if (error) {
    tbody.innerHTML = `<tr><td colspan="3" style="color:red">Error: ${error.message}</td></tr>`;
    return;
  }
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3">No team members found. Please add one.</td></tr>';
    return;
  }
  const editLabel = lang === 'ar' ? 'تعديل' : 'Edit';
  const delLabel  = lang === 'ar' ? 'حذف' : 'Del';
  tbody.innerHTML = data.map(item => {
    const name = (lang === 'ar' && item.name_ar) ? item.name_ar : item.name;
    const role = (lang === 'ar' && item.role_ar) ? item.role_ar : item.role;
    return `
      <tr>
        <td><strong>${name}</strong></td>
        <td>${role}</td>
        <td>
          <button class="btn btn-sm" style="margin-right:5px; background:var(--primary);" onclick="editRecord('team_members', '${item.id}')">${editLabel}</button>
          <button class="btn btn-sm btn-danger" onclick="deleteRecord('team_members', '${item.id}')">${delLabel}</button>
        </td>
      </tr>
    `;
  }).join('');
}

// ==========================================
// 6. LEADS
// ==========================================
async function loadLeads() {
  const { data, error } = await supabaseClient.from('leads').select('*').order('created_at', { ascending: false });
  if (error) return;
  const tbody = document.getElementById('leads-tbody');
  tbody.innerHTML = data.map(item => `
    <tr>
      <td><strong>${item.operator_name}</strong></td>
      <td>${item.operator_phone || 'N/A'}</td>
      <td>${item.operator_email}</td>
      <td>${item.system_specs || 'N/A'}</td>
      <td>${new Date(item.created_at).toLocaleDateString()}</td>
    </tr>
  `).join('');
}


// Generic Delete
window.deleteRecord = async (table, id) => {
  if (confirm('Are you sure you want to delete this?')) {
    await supabaseClient.from(table).delete().eq('id', id);
    if (table === 'projects') loadProjects();
    if (table === 'services') loadServices();
    if (table === 'metrics') loadMetrics();
    if (table === 'team_members') loadTeam();
  }
};

// ==========================================
// ADD NEW LOGIC (MODAL)
// ==========================================
window.editRecord = async (table, id) => {
  const { data, error } = await supabaseClient.from(table).select('*').eq('id', id).single();
  if (error) {
    alert("Error fetching record: " + error.message);
    return;
  }
  openModalFor(table, data);
};

btnAddNew.addEventListener('click', () => {
  if (currentPanel === 'panel-testimonials') {
    if (typeof openTestimonialsModal === 'function') {
      openTestimonialsModal();
    }
    return;
  }
  
  let table = 'projects';
  if (currentPanel === 'panel-services') table = 'services';
  if (currentPanel === 'panel-metrics') table = 'metrics';
  if (currentPanel === 'panel-team') table = 'team_members';
  openModalFor(table, null);
});

function openModalFor(table, data = null) {
  currentEditingTable = table;
  currentEditingId = data ? data.id : null;

  let html = '';

  // Helper to escape quotes in HTML attributes
  const esc = (str) => {
    if (str === null || str === undefined) return '';
    return String(str).replace(/"/g, '&quot;');
  };

  // Helper to format tags array back to comma string
  const formatTags = (tags) => {
    if (!tags || !Array.isArray(tags)) return '';
    return tags.join(', ');
  };

  // Shared bilingual group helper
  const bilingualGroup = (labelEn, labelAr, idEn, idAr, valEn = '', valAr = '', tag = 'input', rows = 3) => {
    const fieldStyle = 'border-left: 3px solid rgba(59,130,246,0.5); padding-left: 8px;';
    const arStyle    = 'border-left: 3px solid rgba(168,85,247,0.5); padding-left: 8px; direction: rtl;';
    if (tag === 'textarea') {
      return `
        <div class="form-group" style="margin-bottom:6px">
          <label style="${fieldStyle}">🇬🇧 ${labelEn}</label>
          <textarea id="${idEn}" rows="${rows}">${esc(valEn)}</textarea>
        </div>
        <div class="form-group" style="margin-bottom:14px">
          <label style="${arStyle}">🇸🇦 ${labelAr}</label>
          <textarea id="${idAr}" rows="${rows}" dir="rtl">${esc(valAr)}</textarea>
        </div>
      `;
    }
    return `
      <div class="form-group" style="margin-bottom:6px">
        <label style="${fieldStyle}">🇬🇧 ${labelEn}</label>
        <input type="text" id="${idEn}" value="${esc(valEn)}">
      </div>
      <div class="form-group" style="margin-bottom:14px">
        <label style="${arStyle}">🇸🇦 ${labelAr}</label>
        <input type="text" id="${idAr}" value="${esc(valAr)}" dir="rtl">
      </div>
    `;
  };

  if (table === 'projects') {
    modalTitle.textContent = data ? 'Edit Project' : 'Add New Project';
    html = `
      ${bilingualGroup('Title', 'العنوان', 'add-title', 'add-title-ar', data?.title, data?.title_ar)}
      ${bilingualGroup('Description', 'الوصف', 'add-desc', 'add-desc-ar', data?.description, data?.description_ar, 'textarea')}
      ${bilingualGroup('Badge Text', 'نص الشارة', 'add-badge', 'add-badge-ar', data?.badge_text, data?.badge_text_ar)}
      <div class="form-group"><label>Theme Class</label><input type="text" id="add-theme" placeholder="pf-murshid" value="${esc(data?.theme_class)}"></div>
      <div class="form-group"><label>Visual HTML</label><textarea id="add-visual" rows="3">${esc(data?.visual_html)}</textarea></div>
      ${bilingualGroup('Tags (Comma separated)', 'الوسوم (مفصولة بفاصلة)', 'add-tags', 'add-tags-ar', formatTags(data?.tags), formatTags(data?.tags_ar))}
      <div class="form-group"><label>Link URL</label><input type="text" id="add-link" placeholder="#" value="${esc(data?.link_url)}"></div>
      <div class="form-group"><label>Order Index</label><input type="number" id="add-order" value="${esc(data?.order_index || 0)}"></div>
    `;
  }
  else if (table === 'services') {
    modalTitle.textContent = data ? 'Edit Service' : 'Add New Service';
    html = `
      ${bilingualGroup('Title', 'العنوان', 'add-title', 'add-title-ar', data?.title, data?.title_ar)}
      ${bilingualGroup('Description', 'الوصف', 'add-desc', 'add-desc-ar', data?.description, data?.description_ar, 'textarea')}
      <div class="form-group"><label>Theme Class</label><input type="text" id="add-theme" placeholder="theme-blue" value="${esc(data?.theme_class)}"></div>
      <div class="form-group"><label>Icon SVG (HTML)</label><textarea id="add-icon" rows="2">${esc(data?.icon_svg)}</textarea></div>
      <div class="form-group"><label>Visual HTML</label><textarea id="add-visual" rows="3">${esc(data?.visual_html)}</textarea></div>
      ${bilingualGroup('Tags (Comma separated)', 'الوسوم (مفصولة بفاصلة)', 'add-tags', 'add-tags-ar', formatTags(data?.tags), formatTags(data?.tags_ar))}
      <div class="form-group"><label>Order Index</label><input type="number" id="add-order" value="${esc(data?.order_index || 0)}"></div>
    `;
  }
  else if (table === 'metrics') {
    modalTitle.textContent = data ? 'Edit Metric' : 'Add New Metric';
    html = `
      ${bilingualGroup('Label', 'التسمية', 'add-label', 'add-label-ar', data?.label, data?.label_ar)}
      <div class="form-group"><label>Target Value</label><input type="number" id="add-val" placeholder="10000" value="${esc(data?.target_value)}"></div>
      <div class="form-group"><label>Suffix</label><input type="text" id="add-suffix" placeholder="+" value="${esc(data?.suffix)}"></div>
      <div class="form-group"><label>Theme Class</label><input type="text" id="add-theme" placeholder="m-emerald" value="${esc(data?.theme_class)}"></div>
      <div class="form-group"><label>Order Index</label><input type="number" id="add-order" value="${esc(data?.order_index || 0)}"></div>
    `;
  }
  else if (table === 'team_members') {
    modalTitle.textContent = data ? 'Edit Team Member' : 'Add New Team Member';
    html = `
      ${bilingualGroup('Name', 'الاسم', 'add-name', 'add-name-ar', data?.name, data?.name_ar)}
      ${bilingualGroup('Role', 'الدور', 'add-role', 'add-role-ar', data?.role, data?.role_ar)}
      ${bilingualGroup('Description', 'الوصف', 'add-desc', 'add-desc-ar', data?.description, data?.description_ar, 'textarea')}
      <div class="form-group"><label>Image Upload</label><input type="file" id="add-img" accept="image/*"></div>
      ${bilingualGroup('Tags (Comma separated)', 'الوسوم (مفصولة بفاصلة)', 'add-tags', 'add-tags-ar', formatTags(data?.tags), formatTags(data?.tags_ar))}
      <div class="form-group"><label>LinkedIn URL</label><input type="text" id="add-linkedin" placeholder="#" value="${esc(data?.linkedin_url)}"></div>
      <div class="form-group"><label>GitHub URL</label><input type="text" id="add-github" placeholder="#" value="${esc(data?.github_url)}"></div>
      <div class="form-group"><label>Order Index</label><input type="number" id="add-order" value="${esc(data?.order_index || 0)}"></div>
    `;
  }

  modalFormContainer.innerHTML = html;
  modalOverlay.classList.add('active');
}

modalClose.addEventListener('click', () => {
  modalOverlay.classList.remove('active');
});

modalSave.addEventListener('click', async () => {
  let insertData = {};

  modalSave.textContent = "Processing...";

  // Handle File Upload (Base64) for Image — with validation
  let finalImageUrl = null;
  const imgInput = document.getElementById('add-img');
  if (imgInput && imgInput.files && imgInput.files.length > 0) {
    const file = imgInput.files[0];
    // Validate file type — only allow common image types
    const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!ALLOWED_TYPES.includes(file.type)) {
      alert('Invalid file type. Please upload a JPG, PNG, WebP, or GIF image.');
      modalSave.textContent = 'Save Entry';
      return;
    }
    // Validate file size — max 2MB
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB
    if (file.size > MAX_SIZE) {
      alert('Image is too large. Please upload an image smaller than 2MB.');
      modalSave.textContent = 'Save Entry';
      return;
    }
    finalImageUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  } else if (currentEditingId && currentEditingTable === 'team_members') {
    // If editing and no new file selected, keep the old image URL
    const { data } = await supabaseClient.from('team_members').select('image_url').eq('id', currentEditingId).single();
    finalImageUrl = data?.image_url;
  }

  if (currentEditingTable === 'projects') {
    insertData = {
      title:          document.getElementById('add-title')?.value || '',
      title_ar:       document.getElementById('add-title-ar')?.value || null,
      description:    document.getElementById('add-desc')?.value || '',
      description_ar: document.getElementById('add-desc-ar')?.value || null,
      theme_class:    document.getElementById('add-theme')?.value || '',
      badge_text:     document.getElementById('add-badge')?.value || '',
      badge_text_ar:  document.getElementById('add-badge-ar')?.value || null,
      visual_html:    document.getElementById('add-visual')?.value || '',
      tags:           document.getElementById('add-tags')?.value.split(',').map(s => s.trim()).filter(Boolean) || [],
      tags_ar:        document.getElementById('add-tags-ar')?.value.split(',').map(s => s.trim()).filter(Boolean) || [],
      link_url:       document.getElementById('add-link')?.value || '#',
      order_index:    parseInt(document.getElementById('add-order')?.value) || 0
    };
  } else if (currentEditingTable === 'services') {
    insertData = {
      title:          document.getElementById('add-title')?.value || '',
      title_ar:       document.getElementById('add-title-ar')?.value || null,
      description:    document.getElementById('add-desc')?.value || '',
      description_ar: document.getElementById('add-desc-ar')?.value || null,
      theme_class:    document.getElementById('add-theme')?.value || '',
      icon_svg:       document.getElementById('add-icon')?.value || '',
      visual_html:    document.getElementById('add-visual')?.value || '',
      tags:           document.getElementById('add-tags')?.value.split(',').map(s => s.trim()).filter(Boolean) || [],
      tags_ar:        document.getElementById('add-tags-ar')?.value.split(',').map(s => s.trim()).filter(Boolean) || [],
      order_index:    parseInt(document.getElementById('add-order')?.value) || 0
    };
  } else if (currentEditingTable === 'metrics') {
    insertData = {
      label:        document.getElementById('add-label')?.value || '',
      label_ar:     document.getElementById('add-label-ar')?.value || null,
      target_value: parseInt(document.getElementById('add-val')?.value) || 0,
      suffix:       document.getElementById('add-suffix')?.value || '',
      theme_class:  document.getElementById('add-theme')?.value || '',
      order_index:  parseInt(document.getElementById('add-order')?.value) || 0
    };
  } else if (currentEditingTable === 'team_members') {
    insertData = {
      name:           document.getElementById('add-name')?.value || '',
      name_ar:        document.getElementById('add-name-ar')?.value || null,
      role:           document.getElementById('add-role')?.value || '',
      role_ar:        document.getElementById('add-role-ar')?.value || null,
      description:    document.getElementById('add-desc')?.value || '',
      description_ar: document.getElementById('add-desc-ar')?.value || null,
      image_url:      finalImageUrl,
      tags:           document.getElementById('add-tags')?.value.split(',').map(s => s.trim()).filter(Boolean) || [],
      tags_ar:        document.getElementById('add-tags-ar')?.value.split(',').map(s => s.trim()).filter(Boolean) || [],
      linkedin_url:   document.getElementById('add-linkedin')?.value || '#',
      github_url:     document.getElementById('add-github')?.value || '#',
      order_index:    parseInt(document.getElementById('add-order')?.value) || 0
    };
  }

  modalSave.textContent = "Saving...";

  let error;
  if (currentEditingId) {
    // Update existing record
    const response = await supabaseClient.from(currentEditingTable).update(insertData).eq('id', currentEditingId);
    error = response.error;
  } else {
    // Insert new record
    const response = await supabaseClient.from(currentEditingTable).insert([insertData]);
    error = response.error;
  }

  modalSave.textContent = "Save Entry";
  if (error) {
    alert("Error saving: " + error.message);
  } else {
    modalOverlay.classList.remove('active');
    if (currentEditingTable === 'projects') loadProjects();
    if (currentEditingTable === 'services') loadServices();
    if (currentEditingTable === 'metrics') loadMetrics();
    if (currentEditingTable === 'team_members') loadTeam();
  }
});

// Close Modal Logic
modalClose.addEventListener('click', () => {
  modalOverlay.classList.remove('active');
});

modalOverlay.addEventListener('click', (e) => {
  if (e.target === modalOverlay) {
    modalOverlay.classList.remove('active');
  }
});

// ==========================================
// // End of admin.js

// Init load
loadSiteContent();
