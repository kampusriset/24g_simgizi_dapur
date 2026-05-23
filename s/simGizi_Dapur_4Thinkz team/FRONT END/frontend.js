const API_BASE = 'backend';

let mitraCache = [];
let dapurCache = [];

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>'"]/g, (char) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
  }[char]));
}

async function apiRequest(endpoint, options = {}) {
  const response = await fetch(`${API_BASE}/${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Terjadi kesalahan saat menghubungi backend.');
  }
  return data;
}

function getModalInstance() {
  const modal = document.getElementById('modal');
  if (!modal || !window.bootstrap) return null;
  return bootstrap.Modal.getOrCreateInstance(modal);
}

function closeModal() {
  getModalInstance()?.hide();
}

function setAdminName() {
  const username = localStorage.getItem('username') || 'Administrator';
  document.querySelectorAll('#adminName').forEach((el) => {
    el.textContent = username.charAt(0).toUpperCase() + username.slice(1);
  });
}

function setupLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (!logoutBtn) return;
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('username');
    localStorage.removeItem('loginTime');
  });
}

function setupTableFilters(kind) {
  const search = document.querySelector('.js-table-search');
  const selects = document.querySelectorAll('.filter-bar select');
  const filterBtn = document.querySelector('.filter-bar .btn-primary');
  const resetBtn = document.querySelector('.filter-bar .btn-outline-secondary');

  const applyFilters = () => {
    const keyword = (search?.value || '').toLowerCase();
    const status = selects[0]?.value || '';
    const relation = selects[1]?.value || '';

    document.querySelectorAll('#dataTable tbody tr:not(.detail-row)').forEach((row) => {
      const matchKeyword = row.textContent.toLowerCase().includes(keyword);
      const matchStatus = !status || row.dataset.status === status;
      const matchRelation = !relation || row.dataset.jenis === relation || row.dataset.mitraId === relation || row.dataset.mitraName === relation;
      row.style.display = matchKeyword && matchStatus && matchRelation ? '' : 'none';

      const detailRow = row.nextElementSibling;
      if (detailRow?.classList.contains('detail-row') && row.style.display === 'none') detailRow.remove();
    });
  };

  search?.addEventListener('input', applyFilters);
  filterBtn?.addEventListener('click', applyFilters);
  selects.forEach((select) => select.addEventListener('change', applyFilters));
  resetBtn?.addEventListener('click', () => {
    if (search) search.value = '';
    selects.forEach((select) => { select.value = ''; });
    applyFilters();
  });
}

function updateStats(values) {
  document.querySelectorAll('.stat-value').forEach((el, index) => {
    if (values[index] !== undefined) el.textContent = values[index];
  });
}

function updateFooter(total, label) {
  const info = document.querySelector('.data-card-footer .info');
  if (!info) return;
  info.innerHTML = total
    ? `Menampilkan <strong>1</strong> hingga <strong>${total}</strong> dari <strong>${total}</strong> data`
    : `Belum ada data ${label}`;
}

function initials(name) {
  return String(name || '-')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('') || '-';
}

function renderJenisBadge(jenis) {
  const isYayasan = jenis === 'Yayasan';
  const icon = isYayasan ? 'fa-heart' : 'fa-briefcase';
  const color = isYayasan ? 'success' : 'primary';
  return `<span class="badge rounded-pill bg-${color} bg-opacity-10 text-${color} border border-${color} border-opacity-25 fw-semibold px-3 py-1" style="font-size:12px"><i class="fa-solid ${icon} me-1"></i>${escapeHtml(jenis || '-')}</span>`;
}

function renderMitraRow(mitra, index) {
  const aktif = mitra.status === 'Aktif';
  const iconClass = mitra.jenis_mitra === 'Yayasan' ? 'purple' : 'blue';
  const icon = mitra.jenis_mitra === 'Yayasan' ? 'fa-building-columns' : 'fa-building';
  return `
    <tr data-id="${mitra.id_mitra}" data-detail="${escapeHtml(mitra.alamat || '-')}" data-status="${escapeHtml(mitra.status)}" data-jenis="${escapeHtml(mitra.jenis_mitra)}">
      <td class="text-center row-num">${index + 1}</td>
      <td><div class="entity-cell"><div class="entity-icon ${iconClass}"><i class="fa-solid ${icon}"></i></div><div><div class="entity-name">${escapeHtml(mitra.nama_mitra)}</div><div class="entity-sub">Bergabung sejak 2024</div></div></div></td>
      <td>${renderJenisBadge(mitra.jenis_mitra)}</td>
      <td><div class="contact-pill"><i class="fa-brands fa-whatsapp text-success"></i>${escapeHtml(mitra.kontak || '-')}</div></td>
      <td><div class="d-flex align-items-center gap-1" style="font-size:13px;color:#475569"><i class="fa-solid fa-envelope text-muted"></i>${escapeHtml(mitra.email || '-')}</div></td>
      <td class="text-center"><span class="status-pill ${aktif ? 'active' : ''}"><span class="status-dot ${aktif ? 'active' : ''}"></span>${escapeHtml(mitra.status)}</span></td>
      <td><div class="action-group"><button class="btn-act view" title="Lihat Detail" onclick="toggleDetail(this, 'Alamat mitra')"><i class="fa-solid fa-eye"></i></button><button class="btn-act edit" title="Edit" onclick="editMitraById(${Number(mitra.id_mitra)})"><i class="fa-solid fa-pen"></i></button><button class="btn-act del" title="Hapus" onclick="deleteMitraById(${Number(mitra.id_mitra)})"><i class="fa-solid fa-trash"></i></button></div></td>
    </tr>`;
}

async function loadMitra() {
  const tbody = document.querySelector('#dataTable tbody');
  if (!tbody || !document.getElementById('namaMitra')) return;
  try {
    const { data } = await apiRequest('mitra.php');
    mitraCache = data;
    const aktif = data.filter((item) => item.status === 'Aktif').length;
    const nonaktif = data.filter((item) => item.status !== 'Aktif').length;
    const jenis = new Set(data.map((item) => item.jenis_mitra).filter(Boolean)).size;
    updateStats([data.length, aktif, nonaktif, jenis]);
    updateFooter(data.length, 'mitra');
    tbody.innerHTML = data.map(renderMitraRow).join('') || '<tr><td colspan="7" class="text-center py-4">Belum ada data mitra.</td></tr>';
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">${escapeHtml(error.message)}</td></tr>`;
  }
}

function renderDapurRow(dapur, index) {
  const aktif = dapur.status === 'Aktif';
  return `
    <tr data-id="${dapur.id_dapur}" data-detail="${escapeHtml(dapur.alamat || '-')}" data-status="${escapeHtml(dapur.status)}" data-mitra-id="${escapeHtml(dapur.id_mitra || '')}" data-mitra-name="${escapeHtml(dapur.nama_mitra || '')}">
      <td class="text-center row-num">${index + 1}</td>
      <td><div class="entity-cell"><div class="entity-icon blue"><i class="fa-solid fa-building"></i></div><div><div class="entity-name">${escapeHtml(dapur.nama_dapur)}</div><div class="entity-sub"><i class="fa-solid fa-location-dot me-1"></i>${escapeHtml(dapur.alamat || '-')}</div></div></div></td>
      <td><div class="d-flex align-items-center gap-2"><div class="avatar-badge indigo">${escapeHtml(initials(dapur.penanggung_jawab))}</div><span class="fw-semibold" style="font-size:13.5px">${escapeHtml(dapur.penanggung_jawab || '-')}</span></div></td>
      <td><div class="contact-pill"><i class="fa-brands fa-whatsapp text-success"></i>${escapeHtml(dapur.kontak || '-')}</div></td>
      <td><span class="partner-tag"><i class="fa-solid fa-handshake"></i>${escapeHtml(dapur.nama_mitra || '-')}</span></td>
      <td class="text-center"><span class="status-pill ${aktif ? 'active' : ''}"><span class="status-dot ${aktif ? 'active' : ''}"></span>${escapeHtml(dapur.status)}</span></td>
      <td><div class="action-group"><button class="btn-act view" title="Lihat Detail" onclick="toggleDetail(this, 'Alamat dapur')"><i class="fa-solid fa-eye"></i></button><button class="btn-act edit" title="Edit" onclick="editDapurById(${Number(dapur.id_dapur)})"><i class="fa-solid fa-pen"></i></button><button class="btn-act del" title="Hapus" onclick="deleteDapurById(${Number(dapur.id_dapur)})"><i class="fa-solid fa-trash"></i></button></div></td>
    </tr>`;
}

async function loadMitraOptions() {
  const formSelect = document.getElementById('idMitra');
  const filterSelects = document.querySelectorAll('.filter-bar select');
  const filterMitra = filterSelects[1];
  try {
    const { data } = await apiRequest('mitra.php');
    if (formSelect) {
      formSelect.innerHTML = '<option value="">-- Pilih Mitra Terhubung --</option>' + data.map((m) => `<option value="${m.id_mitra}">${escapeHtml(m.nama_mitra)}</option>`).join('');
    }
    if (filterMitra && document.getElementById('namaDapur')) {
      filterMitra.innerHTML = '<option value="">Semua Mitra</option>' + data.map((m) => `<option value="${escapeHtml(m.nama_mitra)}">${escapeHtml(m.nama_mitra)}</option>`).join('');
    }
  } catch (error) {
    console.error(error);
  }
}

async function loadDapur() {
  const tbody = document.querySelector('#dataTable tbody');
  if (!tbody || !document.getElementById('namaDapur')) return;
  try {
    const { data } = await apiRequest('dapur.php');
    dapurCache = data;
    const aktif = data.filter((item) => item.status === 'Aktif').length;
    const nonaktif = data.filter((item) => item.status !== 'Aktif').length;
    const mitraAktif = new Set(data.filter((item) => item.status === 'Aktif' && item.id_mitra).map((item) => item.id_mitra)).size;
    updateStats([data.length, aktif, nonaktif, mitraAktif]);
    updateFooter(data.length, 'dapur');
    tbody.innerHTML = data.map(renderDapurRow).join('') || '<tr><td colspan="7" class="text-center py-4">Belum ada data dapur.</td></tr>';
  } catch (error) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-danger py-4">${escapeHtml(error.message)}</td></tr>`;
  }
}

function setDapurModalTitle(isEdit) {
  document.getElementById('modalTitle').innerHTML = `
    <span class="d-flex align-items-center justify-content-center ${isEdit ? 'bg-warning text-warning' : 'bg-primary text-primary'} bg-opacity-10 rounded-3" style="width:36px;height:36px">
      <i class="fa-solid ${isEdit ? 'fa-pen-to-square' : 'fa-plus'}"></i>
    </span><span>${isEdit ? 'Edit Data Dapur' : 'Tambah Dapur Baru'}</span>`;
}

function setMitraModalTitle(isEdit) {
  document.getElementById('modalTitle').innerHTML = `
    <span class="d-flex align-items-center justify-content-center ${isEdit ? 'bg-warning text-warning' : 'bg-primary text-primary'} bg-opacity-10 rounded-3" style="width:36px;height:36px">
      <i class="fa-solid ${isEdit ? 'fa-pen-to-square' : 'fa-plus'}"></i>
    </span><span>${isEdit ? 'Edit Data Mitra' : 'Tambah Mitra Baru'}</span>`;
}

function openAddModal() {
  const form = document.getElementById('formData');
  if (!form) return;
  delete form.dataset.id;
  form.reset();
  if (document.getElementById('namaDapur')) setDapurModalTitle(false);
  if (document.getElementById('namaMitra')) setMitraModalTitle(false);
  getModalInstance()?.show();
}

function editDapurById(id) {
  const dapur = dapurCache.find((item) => Number(item.id_dapur) === Number(id));
  if (!dapur) return alert('Data dapur tidak ditemukan. Coba refresh halaman.');
  const form = document.getElementById('formData');
  form.dataset.id = dapur.id_dapur;
  setDapurModalTitle(true);
  document.getElementById('namaDapur').value = dapur.nama_dapur || '';
  document.getElementById('penanggungJawab').value = dapur.penanggung_jawab || '';
  document.getElementById('kontak').value = dapur.kontak || '';
  document.getElementById('idMitra').value = dapur.id_mitra || '';
  document.getElementById('alamat').value = dapur.alamat || '';
  document.getElementById('status').value = dapur.status || 'Aktif';
  getModalInstance()?.show();
}

function editMitraById(id) {
  const mitra = mitraCache.find((item) => Number(item.id_mitra) === Number(id));
  if (!mitra) return alert('Data mitra tidak ditemukan. Coba refresh halaman.');
  const form = document.getElementById('formData');
  form.dataset.id = mitra.id_mitra;
  setMitraModalTitle(true);
  document.getElementById('namaMitra').value = mitra.nama_mitra || '';
  document.getElementById('jenisMitra').value = mitra.jenis_mitra || '';
  document.getElementById('kontak').value = mitra.kontak || '';
  document.getElementById('email').value = mitra.email || '';
  document.getElementById('alamat').value = mitra.alamat || '';
  document.getElementById('status').value = mitra.status || 'Aktif';
  getModalInstance()?.show();
}

async function deleteDapurById(id) {
  if (!confirm('Hapus data dapur dari database?')) return;
  try {
    await apiRequest(`dapur.php?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    await loadDapur();
  } catch (error) { alert(error.message); }
}

async function deleteMitraById(id) {
  if (!confirm('Hapus data mitra dari database?')) return;
  try {
    await apiRequest(`mitra.php?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    await loadMitra();
  } catch (error) { alert(error.message); }
}

async function handleDapurSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = {
    id_dapur: form.dataset.id || '',
    nama_dapur: document.getElementById('namaDapur').value.trim(),
    penanggung_jawab: document.getElementById('penanggungJawab').value.trim(),
    kontak: document.getElementById('kontak').value.trim(),
    id_mitra: document.getElementById('idMitra').value,
    alamat: document.getElementById('alamat').value.trim(),
    status: document.getElementById('status').value,
  };
  try {
    const result = await apiRequest('dapur.php', { method: 'POST', body: JSON.stringify(payload) });
    closeModal();
    await loadDapur();
    alert(result.message || 'Data dapur berhasil disimpan.');
  } catch (error) { alert(error.message); }
}

async function handleMitraSubmit(event) {
  event.preventDefault();
  const form = event.currentTarget;
  const payload = {
    id_mitra: form.dataset.id || '',
    nama_mitra: document.getElementById('namaMitra').value.trim(),
    jenis_mitra: document.getElementById('jenisMitra').value,
    kontak: document.getElementById('kontak').value.trim(),
    email: document.getElementById('email').value.trim(),
    alamat: document.getElementById('alamat').value.trim(),
    status: document.getElementById('status').value,
  };
  try {
    const result = await apiRequest('mitra.php', { method: 'POST', body: JSON.stringify(payload) });
    closeModal();
    await loadMitra();
    alert(result.message || 'Data mitra berhasil disimpan.');
  } catch (error) { alert(error.message); }
}

function toggleDetail(button, label) {
  const row = button.closest('tr');
  const next = row.nextElementSibling;
  if (next && next.classList.contains('detail-row')) { next.remove(); return; }
  const detailRow = document.createElement('tr');
  detailRow.className = 'detail-row';
  const cols = row.querySelectorAll('td').length;
  detailRow.innerHTML = `<td colspan="${cols}"><i class="fa-solid fa-circle-info me-2" style="color:#0284c7"></i><strong>${label}:</strong> ${escapeHtml(row.dataset.detail || '-')}</td>`;
  row.insertAdjacentElement('afterend', detailRow);
}

function openEditModal(data) {
  if (document.getElementById('namaDapur')) {
    const legacy = {
      id_dapur: data.id_dapur || data.idDapur || '',
      nama_dapur: data.nama_dapur || data.namaDapur || '',
      penanggung_jawab: data.penanggung_jawab || data.penanggungJawab || '',
      kontak: data.kontak || '',
      id_mitra: data.id_mitra || data.idMitra || '',
      alamat: data.alamat || '',
      status: data.status || 'Aktif',
    };
    if (legacy.id_dapur) {
      dapurCache = dapurCache.filter((item) => Number(item.id_dapur) !== Number(legacy.id_dapur)).concat(legacy);
      return editDapurById(legacy.id_dapur);
    }
    const form = document.getElementById('formData');
    if (form) delete form.dataset.id;
    setDapurModalTitle(true);
    document.getElementById('namaDapur').value = legacy.nama_dapur;
    document.getElementById('penanggungJawab').value = legacy.penanggung_jawab;
    document.getElementById('kontak').value = legacy.kontak;
    document.getElementById('idMitra').value = legacy.id_mitra;
    document.getElementById('alamat').value = legacy.alamat;
    document.getElementById('status').value = legacy.status;
    getModalInstance()?.show();
    return;
  }
  if (document.getElementById('namaMitra')) {
    editMitraById(data.id_mitra || data.idMitra);
  }
}

function deleteRow(button) {
  const row = button.closest('tr');
  const id = row?.dataset.id;
  if (document.getElementById('namaDapur') && id) return deleteDapurById(id);
  if (document.getElementById('namaMitra') && id) return deleteMitraById(id);
  if (!confirm('Hapus data ini dari tampilan?')) return;
  const next = row.nextElementSibling;
  if (next && next.classList.contains('detail-row')) next.remove();
  row.remove();
}

function toggleSidebar() {
  document.getElementById('appSidebar')?.classList.toggle('open');
  document.getElementById('sidebarOverlay')?.classList.toggle('show');
}

document.addEventListener('DOMContentLoaded', () => {
  setAdminName();
  setupLogout();
  setupTableFilters();

  const formData = document.getElementById('formData');
  if (formData && document.getElementById('namaDapur')) {
    formData.addEventListener('submit', handleDapurSubmit);
    loadMitraOptions();
    loadDapur();
  }
  if (formData && document.getElementById('namaMitra')) {
    formData.addEventListener('submit', handleMitraSubmit);
    loadMitra();
  }
});

window.closeModal = closeModal;
window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.editDapurById = editDapurById;
window.editMitraById = editMitraById;
window.deleteDapurById = deleteDapurById;
window.deleteMitraById = deleteMitraById;
window.toggleDetail = toggleDetail;
window.deleteRow = deleteRow;
window.toggleSidebar = toggleSidebar;
