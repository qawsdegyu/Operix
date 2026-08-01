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

// Modal Elements
const modalOverlay = document.getElementById('edit-modal');
const modalClose = document.getElementById('modal-close');
const modalTitle = document.getElementById('modal-title');
const modalFormContainer = document.getElementById('modal-form-container');
const modalSave = document.getElementById('modal-save');

let currentPanel = 'panel-content';
let currentEditingTable = null;
let currentEditingId = null;

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
      btnSaveAI.style.display = 'none';
      btnAddNew.style.display = 'none';
      loadSiteContent();
    } else if (target === 'panel-leads') {
      btnSaveContent.style.display = 'none';
      btnSaveAI.style.display = 'none';
      btnAddNew.style.display = 'none';
      loadLeads();
    } else if (target === 'panel-ai') {
      btnSaveContent.style.display = 'none';
      btnSaveAI.style.display = 'inline-block';
      btnAddNew.style.display = 'none';
      loadAI();
    } else {
      btnSaveContent.style.display = 'none';
      btnSaveAI.style.display = 'none';
      btnAddNew.style.display = 'inline-block';
      if (target === 'panel-projects') loadProjects();
      if (target === 'panel-services') loadServices();
      if (target === 'panel-metrics') loadMetrics();
      if (target === 'panel-team') loadTeam();
    }
  });
});

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
  tbody.innerHTML = data.map(item => `
    <tr>
      <td><strong>${item.title}</strong><br><span style="font-size:0.8rem; color:#888">${item.description.substring(0, 50)}...</span></td>
      <td><span style="background:rgba(255,255,255,0.1); padding:4px 8px; border-radius:4px; font-size:0.7rem;">${item.badge_text}</span></td>
      <td>${JSON.stringify(item.tags)}</td>
      <td>
        <button class="btn btn-sm" onclick="editRecord('projects', '${item.id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteRecord('projects', '${item.id}')">Del</button>
      </td>
    </tr>
  `).join('');
}

// ==========================================
// 3. SERVICES
// ==========================================
async function loadServices() {
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
  tbody.innerHTML = data.map(item => `
    <tr>
      <td><strong>${item.title}</strong></td>
      <td><span style="font-size:0.8rem; color:#888">${item.description.substring(0, 80)}...</span></td>
      <td>
        <button class="btn btn-sm btn-danger" onclick="deleteRecord('services', '${item.id}')">Del</button>
      </td>
    </tr>
  `).join('');
}

// ==========================================
// 4. METRICS
// ==========================================
async function loadMetrics() {
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
  tbody.innerHTML = data.map(item => `
    <tr>
      <td><strong>${item.label}</strong></td>
      <td><span style="font-size:1.2rem; font-weight:bold; color:var(--primary)">${item.target_value}</span> ${item.suffix}</td>
      <td>
        <button class="btn btn-sm" style="margin-right:5px; background:var(--primary);" onclick="editRecord('metrics', '${item.id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteRecord('metrics', '${item.id}')">Del</button>
      </td>
    </tr>
  `).join('');
}

// ==========================================
// 5. TEAM MEMBERS
// ==========================================
async function loadTeam() {
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
  tbody.innerHTML = data.map(item => `
    <tr>
      <td><strong>${item.name}</strong></td>
      <td>${item.role}</td>
      <td>
        <button class="btn btn-sm" style="margin-right:5px; background:var(--primary);" onclick="editRecord('team_members', '${item.id}')">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteRecord('team_members', '${item.id}')">Del</button>
      </td>
    </tr>
  `).join('');
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
      <td>${item.corporate_entity}</td>
      <td>${item.operator_email}</td>
      <td>${item.budget_range}</td>
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

  if (table === 'projects') {
    modalTitle.textContent = data ? 'Edit Project' : 'Add New Project';
    html = `
      <div class="form-group"><label>Title</label><input type="text" id="add-title" value="${esc(data?.title)}"></div>
      <div class="form-group"><label>Description</label><textarea id="add-desc" rows="3">${esc(data?.description)}</textarea></div>
      <div class="form-group"><label>Theme Class</label><input type="text" id="add-theme" placeholder="pf-murshid" value="${esc(data?.theme_class)}"></div>
      <div class="form-group"><label>Badge Text</label><input type="text" id="add-badge" placeholder="AI.RAG.SYS" value="${esc(data?.badge_text)}"></div>
      <div class="form-group"><label>Visual HTML</label><textarea id="add-visual" rows="3">${esc(data?.visual_html)}</textarea></div>
      <div class="form-group"><label>Tags (Comma separated)</label><input type="text" id="add-tags" placeholder="React, Node, AI" value="${esc(formatTags(data?.tags))}"></div>
      <div class="form-group"><label>Link URL</label><input type="text" id="add-link" placeholder="#" value="${esc(data?.link_url)}"></div>
      <div class="form-group"><label>Order Index</label><input type="number" id="add-order" value="${esc(data?.order_index || 0)}"></div>
    `;
  }
  else if (table === 'services') {
    modalTitle.textContent = data ? 'Edit Service' : 'Add New Service';
    html = `
      <div class="form-group"><label>Title</label><input type="text" id="add-title" value="${esc(data?.title)}"></div>
      <div class="form-group"><label>Description</label><textarea id="add-desc" rows="3">${esc(data?.description)}</textarea></div>
      <div class="form-group"><label>Theme Class</label><input type="text" id="add-theme" placeholder="theme-blue" value="${esc(data?.theme_class)}"></div>
      <div class="form-group"><label>Icon SVG (HTML)</label><textarea id="add-icon" rows="2">${esc(data?.icon_svg)}</textarea></div>
      <div class="form-group"><label>Visual HTML</label><textarea id="add-visual" rows="3">${esc(data?.visual_html)}</textarea></div>
      <div class="form-group"><label>Tags (Comma separated)</label><input type="text" id="add-tags" placeholder="Automation, Scale" value="${esc(formatTags(data?.tags))}"></div>
      <div class="form-group"><label>Order Index</label><input type="number" id="add-order" value="${esc(data?.order_index || 0)}"></div>
    `;
  }
  else if (table === 'metrics') {
    modalTitle.textContent = data ? 'Edit Metric' : 'Add New Metric';
    html = `
      <div class="form-group"><label>Label</label><input type="text" id="add-label" placeholder="Hours Automated" value="${esc(data?.label)}"></div>
      <div class="form-group"><label>Target Value</label><input type="number" id="add-val" placeholder="10000" value="${esc(data?.target_value)}"></div>
      <div class="form-group"><label>Suffix</label><input type="text" id="add-suffix" placeholder="+" value="${esc(data?.suffix)}"></div>
      <div class="form-group"><label>Theme Class</label><input type="text" id="add-theme" placeholder="m-emerald" value="${esc(data?.theme_class)}"></div>
      <div class="form-group"><label>Order Index</label><input type="number" id="add-order" value="${esc(data?.order_index || 0)}"></div>
    `;
  }
  else if (table === 'team_members') {
    modalTitle.textContent = data ? 'Edit Team Member' : 'Add New Team Member';
    html = `
      <div class="form-group"><label>Name</label><input type="text" id="add-name" value="${esc(data?.name)}"></div>
      <div class="form-group"><label>Role</label><input type="text" id="add-role" value="${esc(data?.role)}"></div>
      <div class="form-group"><label>Description</label><textarea id="add-desc" rows="3">${esc(data?.description)}</textarea></div>
      <div class="form-group"><label>Image Upload</label><input type="file" id="add-img" accept="image/*"></div>
      <div class="form-group"><label>Tags (Comma separated)</label><input type="text" id="add-tags" placeholder="UI, UX, AI" value="${esc(formatTags(data?.tags))}"></div>
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

  // Handle File Upload (Base64) for Image
  let finalImageUrl = null;
  const imgInput = document.getElementById('add-img');
  if (imgInput && imgInput.files && imgInput.files.length > 0) {
    const file = imgInput.files[0];
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
      title: document.getElementById('add-title').value,
      description: document.getElementById('add-desc').value,
      theme_class: document.getElementById('add-theme').value,
      badge_text: document.getElementById('add-badge').value,
      visual_html: document.getElementById('add-visual').value,
      tags: document.getElementById('add-tags').value.split(',').map(s => s.trim()),
      link_url: document.getElementById('add-link').value,
      order_index: parseInt(document.getElementById('add-order').value) || 0
    };
  } else if (currentEditingTable === 'services') {
    insertData = {
      title: document.getElementById('add-title').value,
      description: document.getElementById('add-desc').value,
      theme_class: document.getElementById('add-theme').value,
      icon_svg: document.getElementById('add-icon').value,
      visual_html: document.getElementById('add-visual').value,
      tags: document.getElementById('add-tags').value.split(',').map(s => s.trim()),
      order_index: parseInt(document.getElementById('add-order').value) || 0
    };
  } else if (currentEditingTable === 'metrics') {
    insertData = {
      label: document.getElementById('add-label').value,
      target_value: parseInt(document.getElementById('add-val').value) || 0,
      suffix: document.getElementById('add-suffix').value,
      theme_class: document.getElementById('add-theme').value,
      order_index: parseInt(document.getElementById('add-order').value) || 0
    };
  } else if (currentEditingTable === 'team_members') {
    insertData = {
      name: document.getElementById('add-name').value,
      role: document.getElementById('add-role').value,
      description: document.getElementById('add-desc').value,
      image_url: finalImageUrl,
      tags: document.getElementById('add-tags').value.split(',').map(s => s.trim()),
      linkedin_url: document.getElementById('add-linkedin').value || '#',
      github_url: document.getElementById('add-github').value || '#',
      order_index: parseInt(document.getElementById('add-order').value) || 0
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
// ==========================================
// 8. AI AGENT PANEL
// ==========================================
async function loadAI() {
  const { data, error } = await supabaseClient
    .from('site_content')
    .select('section_key, content_value')
    .in('section_key', ['ai_system_prompt', 'ai_api_key']);

  if (!error && data) {
    data.forEach(item => {
      if (item.section_key === 'ai_system_prompt') document.getElementById('ai-system-prompt').value = item.content_value;
      if (item.section_key === 'ai_api_key') document.getElementById('ai-api-key').value = item.content_value;
    });
  }
}

if (btnSaveAI) {
  btnSaveAI.addEventListener('click', async () => {
    btnSaveAI.textContent = 'Saving...';
    const promptVal = document.getElementById('ai-system-prompt').value;
    const keyVal = document.getElementById('ai-api-key').value;

    const upsertKey = async (key, val) => {
      const { data: existing } = await supabaseClient.from('site_content').select('id').eq('section_key', key).single();
      if (existing) {
        return supabaseClient.from('site_content').update({ content_value: val }).eq('section_key', key);
      } else {
        return supabaseClient.from('site_content').insert({ section_key: key, content_value: val });
      }
    };

    const [res1, res2] = await Promise.all([
      upsertKey('ai_system_prompt', promptVal),
      upsertKey('ai_api_key', keyVal)
    ]);

    if (res1.error || res2.error) {
      console.error(res1.error || res2.error);
      btnSaveAI.textContent = 'Error!';
    } else {
      btnSaveAI.textContent = 'Saved!';
    }
    setTimeout(() => btnSaveAI.textContent = 'Save System Prompt', 2000);
  });
}

// RAG Document Upload Logic
const uploadZone = document.getElementById('rag-upload-zone');
const fileInput = document.getElementById('rag-file-input');

if (uploadZone && fileInput) {
  uploadZone.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const originalContent = uploadZone.innerHTML;
    uploadZone.innerHTML = `<div style="text-align:center;"><p style="color:var(--primary); font-weight:600;">Processing & Vectorizing ${file.name}...</p></div>`;

    try {
      const formData = new FormData();
      formData.append('file', file);

      // For Production, change this to your hosted backend URL (e.g., https://api.operixsys.online/api/admin/upload-rag)
      const API_URL = 'http://localhost:3001/api/admin/upload-rag';
      const res = await fetch(API_URL, {
        method: 'POST',
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');

      uploadZone.innerHTML = `<div style="text-align:center;"><p style="color:#10b981; font-weight:600;">Successfully indexed ${file.name}!</p></div>`;
    } catch (err) {
      console.error(err);
      uploadZone.innerHTML = `<div style="text-align:center;"><p style="color:#ef4444; font-weight:600;">API Error: ${err.message}</p><p style="font-size:0.75rem; color:var(--text-dim);">Are you running the Node backend (api-skeleton.js)?</p></div>`;
    }

    setTimeout(() => {
      uploadZone.innerHTML = originalContent;
      fileInput.value = '';
    }, 4000);
  });
}

// Init load
loadSiteContent();
