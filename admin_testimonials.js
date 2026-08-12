
async function loadTestimonials() {
  const lang = (window.I18n && window.I18n.getLang()) || 'en';
  const tbody = document.querySelector('#testimonials-table tbody');
  if(!tbody) return;
  tbody.innerHTML = '<tr><td colspan="5">Loading...</td></tr>';
  const { data, error } = await supabaseClient.from('testimonials').select('*').order('order_index', { ascending: true });
  if (error) {
    tbody.innerHTML = `<tr><td colspan="5" style="color:red">Error: ${error.message}</td></tr>`;
    return;
  }
  if (!data || data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5">No testimonials found. Please add one.</td></tr>';
    return;
  }
  
  const editLabel = lang === 'ar' ? '?????' : 'Edit';
  const delLabel  = lang === 'ar' ? '???' : 'Del';
  
  tbody.innerHTML = data.map(item => {
    const author = (lang === 'ar' && item.author_name_ar) ? item.author_name_ar : item.author_name;
    const role = (lang === 'ar' && item.author_role_ar) ? item.author_role_ar : item.author_role;
    return `
      <tr>
        <td><strong>${author}</strong></td>
        <td>${role}</td>
        <td>${item.project_link || '-'}</td>
        <td>${item.order_index}</td>
        <td>
          <button class="btn btn-sm" onclick="editTestimonial('${item.id}')">${editLabel}</button>
          <button class="btn btn-sm btn-danger" onclick="deleteTestimonial('${item.id}')">${delLabel}</button>
        </td>
      </tr>
    `;
  }).join('');
}

async function editTestimonial(id) {
  const { data, error } = await supabaseClient.from('testimonials').select('*').eq('id', id).single();
  if (error) { alert("Error fetching: " + error.message); return; }
  
  document.getElementById('test-id').value = data.id;
  document.getElementById('test-quote').value = data.quote;
  document.getElementById('test-quote-ar').value = data.quote_ar || '';
  document.getElementById('test-name').value = data.author_name;
  document.getElementById('test-name-ar').value = data.author_name_ar || '';
  document.getElementById('test-role').value = data.author_role;
  document.getElementById('test-role-ar').value = data.author_role_ar || '';
  document.getElementById('test-link').value = data.project_link || '';
  document.getElementById('test-order').value = data.order_index;
  
  document.getElementById('modal-testimonials').classList.add('active');
}

async function deleteTestimonial(id) {
  if(!confirm("Are you sure you want to delete this testimonial?")) return;
  await supabaseClient.from('testimonials').delete().eq('id', id);
  loadTestimonials();
}

async function saveTestimonial() {
  const id = document.getElementById('test-id').value;
  const quote = document.getElementById('test-quote').value;
  const quote_ar = document.getElementById('test-quote-ar').value;
  const author_name = document.getElementById('test-name').value;
  const author_name_ar = document.getElementById('test-name-ar').value;
  const author_role = document.getElementById('test-role').value;
  const author_role_ar = document.getElementById('test-role-ar').value;
  const project_link = document.getElementById('test-link').value;
  const order_index = document.getElementById('test-order').value || 0;

  if(!quote || !author_name || !author_role) {
    alert("Quote, Author Name, and Role are required (EN)");
    return;
  }

  const payload = {
    quote, quote_ar,
    author_name, author_name_ar,
    author_role, author_role_ar,
    project_link,
    order_index: parseInt(order_index)
  };

  let err;
  if (id) {
    const response = await supabaseClient.from('testimonials').update(payload).eq('id', id);
    err = response.error;
  } else {
    const response = await supabaseClient.from('testimonials').insert([payload]);
    err = response.error;
  }
  
  if (err) {
    alert("Error saving: " + err.message);
    return;
  }
  
  closeModal('modal-testimonials');
  loadTestimonials();
}

function openTestimonialsModal() {
  document.getElementById('test-id').value = '';
  document.getElementById('test-quote').value = '';
  document.getElementById('test-quote-ar').value = '';
  document.getElementById('test-name').value = '';
  document.getElementById('test-name-ar').value = '';
  document.getElementById('test-role').value = '';
  document.getElementById('test-role-ar').value = '';
  document.getElementById('test-link').value = '';
  document.getElementById('test-order').value = '0';
  document.getElementById('modal-testimonials').classList.add('active');
}

function closeModal(id) {
  document.getElementById(id).classList.remove('active');
}

// Hook into admin.js tab switching
document.addEventListener("DOMContentLoaded", () => {
  const btnAddNew = document.getElementById("btn-add-new");
  btnAddNew.addEventListener("click", () => {
    if(window.currentPanel === "panel-testimonials") {
      openTestimonialsModal();
    }
  });
});

