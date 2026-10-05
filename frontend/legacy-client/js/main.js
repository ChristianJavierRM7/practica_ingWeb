/* =============================================================================
   TECHFIX CLIENT - MAIN APPLICATION LOGIC & UI RENDERER
   ============================================================================= */

// Toast notification helper
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <span>${type === 'success' ? '✅' : '❌'}</span>
    <span>${message}</span>
  `;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Global App State
let currentTab = 'dashboard';
let cacheRepairs = [];
let cacheInventory = [];
let cacheUsers = [];

document.addEventListener('DOMContentLoaded', async () => {
  updateUserInterfaceHeader();
  setupEventListeners();

  if (AuthManager.isAuthenticated()) {
    switchTab('dashboard');
  } else {
    showAuthModal();
  }
});

// Update Header User Details
function updateUserInterfaceHeader() {
  const userPill = document.getElementById('user-pill');
  const loginBtn = document.getElementById('login-btn');
  const logoutBtn = document.getElementById('logout-btn');

  if (AuthManager.isAuthenticated()) {
    const user = AuthManager.currentUser;
    userPill.style.display = 'flex';
    loginBtn.style.display = 'none';
    logoutBtn.style.display = 'inline-flex';

    document.getElementById('user-avatar').innerText = user.name.charAt(0).toUpperCase();
    document.getElementById('user-name').innerText = user.name;
    const badge = document.getElementById('user-role-badge');
    badge.innerText = user.role;
    badge.className = `role-badge role-${user.role}`;

    // Show/Hide Role-based Tabs
    document.querySelectorAll('.role-restricted-tech').forEach(el => {
      el.style.display = AuthManager.isTechnician() ? 'inline-flex' : 'none';
    });
    document.querySelectorAll('.role-restricted-admin').forEach(el => {
      el.style.display = AuthManager.isAdmin() ? 'inline-flex' : 'none';
    });
  } else {
    userPill.style.display = 'none';
    loginBtn.style.display = 'inline-flex';
    logoutBtn.style.display = 'none';
  }
}

// Tab Switching
async function switchTab(tabName) {
  currentTab = tabName;

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  document.querySelectorAll('.tab-content').forEach(view => {
    view.style.display = view.id === `view-${tabName}` ? 'block' : 'none';
  });

  if (!AuthManager.isAuthenticated() && tabName !== 'tracking') {
    showAuthModal();
    return;
  }

  try {
    if (tabName === 'dashboard') await loadDashboardView();
    if (tabName === 'repairs') await loadRepairsView();
    if (tabName === 'inventory') await loadInventoryView();
    if (tabName === 'users') await loadUsersView();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// -----------------------------------------------------------------------------
// VISTAS Y COMPONENTES
// -----------------------------------------------------------------------------

// 1. DASHBOARD
async function loadDashboardView() {
  if (!AuthManager.isTechnician()) {
    document.getElementById('stats-grid').style.display = 'none';
    await loadRepairsView(); // Fallback for customers
    return;
  }

  document.getElementById('stats-grid').style.display = 'grid';
  const res = await ApiService.getDashboardStats();
  const { users, repairs, lowStockItems } = res.stats;

  document.getElementById('stat-active-repairs').innerText = repairs.total_en_reparacion;
  document.getElementById('stat-diagnosing').innerText = repairs.total_en_diagnostico;
  document.getElementById('stat-ready').innerText = repairs.total_listo;
  document.getElementById('stat-revenue').innerText = `$${parseFloat(repairs.total_revenue).toFixed(2)}`;

  // Low Stock Table inside Dashboard
  const tbody = document.getElementById('low-stock-tbody');
  tbody.innerHTML = '';

  if (lowStockItems.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color: var(--text-muted)">✅ Stock de repuestos saludable (Sin alertas).</td></tr>`;
  } else {
    lowStockItems.forEach(item => {
      tbody.innerHTML += `
        <tr>
          <td><strong>${item.name}</strong></td>
          <td><span class="status-chip ${item.type}">${item.type}</span></td>
          <td>$${parseFloat(item.unit_price).toFixed(2)}</td>
          <td><span style="color: #ef4444; font-weight: 700;">⚠️ ${item.stock} unidades</span></td>
        </tr>
      `;
    });
  }
}

// 2. ÓRDENES DE REPARACIÓN
async function loadRepairsView() {
  const statusFilter = document.getElementById('repair-status-filter')?.value || '';
  const search = document.getElementById('repair-search')?.value || '';

  const res = await ApiService.getRepairs({ status: statusFilter, q: search });
  cacheRepairs = res.repairs;

  const tbody = document.getElementById('repairs-tbody');
  tbody.innerHTML = '';

  if (cacheRepairs.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; color: var(--text-muted); padding: 2rem;">No se encontraron órdenes de reparación.</td></tr>`;
    return;
  }

  cacheRepairs.forEach(repair => {
    const isCustomer = AuthManager.getUserRole() === 'customer';
    tbody.innerHTML += `
      <tr>
        <td><strong style="color: #60a5fa;">${repair.order_number}</strong></td>
        <td>
          <div><strong>${repair.device_brand} ${repair.device_model}</strong></div>
          <small style="color: var(--text-muted)">IMEI/Serie: ${repair.serial_imei || 'N/A'}</small>
        </td>
        <td>${repair.customer_name}<br><small style="color: var(--text-muted)">${repair.customer_phone || ''}</small></td>
        <td><span class="status-chip ${repair.status}">${repair.status.replace('_', ' ')}</span></td>
        <td><strong>$${parseFloat(repair.final_cost || 0).toFixed(2)}</strong></td>
        <td><small>${new Date(repair.created_at).toLocaleDateString()}</small></td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="openRepairDetailModal(${repair.id})">🔍 Detalle</button>
        </td>
      </tr>
    `;
  });
}

// MODAL DETALLE Y ACCIONES DE REPARACIÓN
async function openRepairDetailModal(repairId) {
  try {
    const res = await ApiService.getRepairById(repairId);
    const repair = res.repair;

    document.getElementById('modal-repair-title').innerText = `Orden ${repair.order_number} - ${repair.device_brand} ${repair.device_model}`;
    document.getElementById('modal-repair-id').value = repair.id;

    document.getElementById('modal-repair-customer').innerText = `${repair.customer_name} (${repair.customer_phone || repair.customer_email})`;
    document.getElementById('modal-repair-fault').innerText = repair.fault_description;
    document.getElementById('modal-repair-notes').innerText = repair.repair_notes || 'Sin observaciones.';
    document.getElementById('modal-repair-status-select').value = repair.status;
    document.getElementById('modal-repair-final-cost').innerText = `$${parseFloat(repair.final_cost).toFixed(2)}`;

    // Render items attached
    const itemsTbody = document.getElementById('modal-repair-items-tbody');
    itemsTbody.innerHTML = '';

    if (repair.items.length === 0) {
      itemsTbody.innerHTML = `<tr><td colspan="5" style="text-align:center; color: var(--text-muted)">No hay repuestos ni servicios agregados a esta orden.</td></tr>`;
    } else {
      repair.items.forEach(item => {
        itemsTbody.innerHTML += `
          <tr>
            <td><strong>${item.item_name}</strong> <small>(${item.item_type})</small></td>
            <td>${item.quantity}</td>
            <td>$${parseFloat(item.unit_price).toFixed(2)}</td>
            <td>$${parseFloat(item.subtotal).toFixed(2)}</td>
            <td>
              ${AuthManager.isTechnician() ? `<button class="btn btn-sm btn-danger" onclick="removeRepairItem(${repair.id}, ${item.id})">🗑️</button>` : ''}
            </td>
          </tr>
        `;
      });
    }

    // Populate inventory select for adding items
    if (AuthManager.isTechnician()) {
      const invRes = await ApiService.getInventory();
      const select = document.getElementById('add-inventory-select');
      select.innerHTML = '<option value="">-- Seleccionar Repuesto o Servicio --</option>';
      invRes.items.forEach(inv => {
        select.innerHTML += `<option value="${inv.id}">${inv.name} [${inv.type}] - $${inv.unit_price} (Stock: ${inv.stock})</option>`;
      });
    }

    openModal('modal-repair-detail');
  } catch (err) {
    showToast(err.message, 'error');
  }
}

// 3. INVENTARIO
async function loadInventoryView() {
  const res = await ApiService.getInventory();
  cacheInventory = res.items;

  const tbody = document.getElementById('inventory-tbody');
  tbody.innerHTML = '';

  cacheInventory.forEach(item => {
    tbody.innerHTML += `
      <tr>
        <td><strong>${item.name}</strong><br><small style="color: var(--text-muted)">${item.description || ''}</small></td>
        <td><span class="status-chip ${item.type}">${item.type}</span></td>
        <td><strong>$${parseFloat(item.unit_price).toFixed(2)}</strong></td>
        <td>${item.type === 'repuesto' ? (item.stock > 5 ? `<span style="color: #34d399; font-weight:700;">${item.stock} u.</span>` : `<span style="color: #ef4444; font-weight:700;">⚠️ ${item.stock} u.</span>`) : 'N/A'}</td>
        <td>
          ${AuthManager.isAdmin() ? `<button class="btn btn-sm btn-danger" onclick="deleteInventoryItem(${item.id})">🗑️ Eliminar</button>` : '-'}
        </td>
      </tr>
    `;
  });
}

// 4. USUARIOS
async function loadUsersView() {
  if (!AuthManager.isTechnician()) return;

  const res = await ApiService.getUsers();
  cacheUsers = res.users;

  const tbody = document.getElementById('users-tbody');
  tbody.innerHTML = '';

  cacheUsers.forEach(u => {
    tbody.innerHTML += `
      <tr>
        <td><strong>${u.name}</strong></td>
        <td>${u.email}</td>
        <td>${u.phone || 'N/A'}</td>
        <td><span class="role-badge role-${u.role}">${u.role}</span></td>
        <td><small>${new Date(u.created_at).toLocaleDateString()}</small></td>
        <td>
          ${AuthManager.isAdmin() && u.id !== AuthManager.currentUser.id ? `<button class="btn btn-sm btn-danger" onclick="deleteUserAccount(${u.id})">🗑️</button>` : '-'}
        </td>
      </tr>
    `;
  });
}

// -----------------------------------------------------------------------------
// EVENT LISTENERS & MODALS
// -----------------------------------------------------------------------------
function setupEventListeners() {
  // Login Form
  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const pass = document.getElementById('login-password').value;

    try {
      const res = await ApiService.login(email, pass);
      AuthManager.setUserSession(res.token, res.user);
      updateUserInterfaceHeader();
      closeModal('modal-auth');
      showToast(`¡Bienvenido de nuevo, ${res.user.name}!`);
      switchTab('dashboard');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Quick Credential Helper Buttons
  document.querySelectorAll('.quick-login-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.getElementById('login-email').value = btn.dataset.email;
      document.getElementById('login-password').value = btn.dataset.password;
    });
  });

  // Create Repair Form
  document.getElementById('form-create-repair')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      customer_id: document.getElementById('repair-customer-id').value || AuthManager.currentUser.id,
      device_brand: document.getElementById('repair-brand').value,
      device_model: document.getElementById('repair-model').value,
      serial_imei: document.getElementById('repair-imei').value,
      fault_description: document.getElementById('repair-fault').value,
      estimated_cost: document.getElementById('repair-est-cost').value || 0,
    };

    try {
      await ApiService.createRepair(data);
      showToast('Orden de reparación creada con éxito.');
      closeModal('modal-create-repair');
      switchTab('repairs');
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Change Status Button in Modal
  document.getElementById('btn-change-status')?.addEventListener('click', async () => {
    const repairId = document.getElementById('modal-repair-id').value;
    const newStatus = document.getElementById('modal-repair-status-select').value;

    try {
      await ApiService.updateRepairStatus(repairId, newStatus);
      showToast(`Estado cambiado a ${newStatus}.`);
      openRepairDetailModal(repairId);
      if (currentTab === 'repairs') loadRepairsView();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Add Item to Repair Order
  document.getElementById('btn-add-item')?.addEventListener('click', async () => {
    const repairId = document.getElementById('modal-repair-id').value;
    const inventoryId = document.getElementById('add-inventory-select').value;
    const qty = document.getElementById('add-inventory-qty').value || 1;

    if (!inventoryId) {
      showToast('Por favor selecciona un repuesto o servicio.', 'error');
      return;
    }

    try {
      await ApiService.addRepairItem(repairId, inventoryId, qty);
      showToast('Ítem agregado a la reparación.');
      openRepairDetailModal(repairId);
    } catch (err) {
      showToast(err.message, 'error');
    }
  });

  // Create Inventory Form
  document.getElementById('form-create-inventory')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = {
      name: document.getElementById('inv-name').value,
      description: document.getElementById('inv-desc').value,
      type: document.getElementById('inv-type').value,
      unit_price: document.getElementById('inv-price').value,
      stock: document.getElementById('inv-stock').value || 0,
    };

    try {
      await ApiService.createInventory(data);
      showToast('Repuesto/Servicio añadido al inventario.');
      closeModal('modal-create-inventory');
      loadInventoryView();
    } catch (err) {
      showToast(err.message, 'error');
    }
  });
}

// Helper Modal Control
function openModal(id) {
  document.getElementById(id)?.classList.add('active');
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('active');
}

function showAuthModal() {
  openModal('modal-auth');
}

async function removeRepairItem(repairId, itemId) {
  if (!confirm('¿Deseas quitar este ítem de la orden de reparación?')) return;
  try {
    await ApiService.removeRepairItem(repairId, itemId);
    showToast('Ítem removido.');
    openRepairDetailModal(repairId);
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteInventoryItem(id) {
  if (!confirm('¿Eliminar este repuesto o servicio del inventario?')) return;
  try {
    await ApiService.deleteInventory(id);
    showToast('Ítem eliminado del inventario.');
    loadInventoryView();
  } catch (err) {
    showToast(err.message, 'error');
  }
}

async function deleteUserAccount(id) {
  if (!confirm('¿Eliminar esta cuenta de usuario?')) return;
  try {
    await ApiService.deleteUser(id);
    showToast('Usuario eliminado.');
    loadUsersView();
  } catch (err) {
    showToast(err.message, 'error');
  }
}
