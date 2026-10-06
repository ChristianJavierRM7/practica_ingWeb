import { useEffect, useMemo, useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api'

const sampleOrders = [
  { id: 'REP-2026-047', customer_name: 'Carlos Soto', device_brand: 'Apple', device_model: 'iPhone 14 Pro', fault_description: 'Cambio de pantalla OLED', status: 'en_reparacion', technician_name: 'Marcos R.', final_cost: 185000, updated_at: 'hace 25 min' },
  { id: 'REP-2026-046', customer_name: 'María Vega', device_brand: 'Samsung', device_model: 'Galaxy S23', fault_description: 'Módulo de carga y batería', status: 'listo', technician_name: 'Lucía G.', final_cost: 92000, updated_at: 'hace 48 min' },
  { id: 'REP-2026-045', customer_name: 'Andrés Romero', device_brand: 'Apple', device_model: 'MacBook Air M2', fault_description: 'Limpieza ultrasónica teclado', status: 'en_diagnostico', technician_name: 'Marcos R.', final_cost: 140000, updated_at: 'hace 1 h 20 min' },
  { id: 'REP-2026-044', customer_name: 'Florencia Rojas', device_brand: 'Xiaomi', device_model: 'Redmi Note 12', fault_description: 'Falla IC de Radiofrecuencia', status: 'recibido', technician_name: 'Por asignar', final_cost: 48000, updated_at: 'hace 2 h 05 min' },
  { id: 'REP-2026-043', customer_name: 'Diego Albornoz', device_brand: 'Lenovo', device_model: 'ThinkPad T14', fault_description: 'Mantenimiento pasta térmica', status: 'en_reparacion', technician_name: 'Lucía G.', final_cost: 55000, updated_at: 'hace 3 h 15 min' },
  { id: 'REP-2026-042', customer_name: 'Valentina Morales', device_brand: 'Apple', device_model: 'iPhone 13 mini', fault_description: 'Reemplazo de batería', status: 'entregado', technician_name: 'Marcos R.', final_cost: 69000, updated_at: 'hace 3 h 40 min' },
]

const sampleInventory = [
  { id: 1, name: 'Módulo OLED iPhone 13 Pro', description: 'Display Super Retina XDR + Touch con marco original', type: 'repuesto', unit_price: 189000, stock: 2 },
  { id: 2, name: 'Batería Samsung S22 3700mAh Original', description: 'Modelo EB-BS901ABY · Li-ion de adhesivo térmico', type: 'repuesto', unit_price: 45000, stock: 14 },
  { id: 3, name: 'Placa Sub-Pin de carga Type-C Moto G84', description: 'Módulo dock de carga rápida con micrófono integrado', type: 'repuesto', unit_price: 22000, stock: 8 },
  { id: 4, name: 'Display Incell Xiaomi Redmi Note 12 4G', description: 'Pantalla completa táctil 120Hz sin marco', type: 'repuesto', unit_price: 68000, stock: 1 },
  { id: 5, name: 'Mano de obra diagnóstico avanzado', description: 'Revisión en microscopio térmico y consumo de placa', type: 'servicio', unit_price: 35000, stock: 0 },
]

const statusLabels = {
  recibido: 'Recibido',
  en_diagnostico: 'Diagnóstico',
  en_reparacion: 'En reparación',
  listo: 'Listo para entregar',
  entregado: 'Entregado',
  cancelado: 'Cancelado',
}

const statusColors = {
  recibido: 'blue',
  en_diagnostico: 'amber',
  en_reparacion: 'violet',
  listo: 'green',
  entregado: 'slate',
  cancelado: 'red',
}

function Icon({ name, size = 18 }) {
  const paths = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></>,
    user: <><circle cx="12" cy="8" r="4" /><path d="M5 21v-1a7 7 0 0 1 14 0v1" /></>,
    clipboard: <><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4.5h6a1.5 1.5 0 0 0-3-1 1.5 1.5 0 0 0-3 1ZM9 11h6M9 15h6" /></>,
    box: <><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3 8 9 5 9-5M3 16l9 5 9-5M3 8v8m18-8v8M12 13v8" /></>,
    people: <><circle cx="9" cy="8" r="3" /><path d="M3 20v-1a6 6 0 0 1 12 0v1M16 5a3 3 0 0 1 0 6m2 3a5 5 0 0 1 3 5v1" /></>,
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 5 5" /></>,
    bell: <><path d="M18 9a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4" /></>,
    plus: <><path d="M12 5v14M5 12h14" /></>,
    print: <><path d="M7 8V3h10v5M7 17H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-3" /><path d="M7 14h10v7H7zM18 11h.01" /></>,
    eye: <><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6-10-6-10-6Z" /><circle cx="12" cy="12" r="2.5" /></>,
    arrow: <><path d="M5 12h14m-6-6 6 6-6 6" /></>,
    download: <><path d="M12 3v12m-5-5 5 5 5-5M4 19v2h16v-2" /></>,
    filter: <><path d="M4 5h16l-6.5 7.5V19l-3 1v-7.5L4 5Z" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    wrench: <><path d="M14.7 6.3a5 5 0 0 0-6.4 6.4L3 18l3 3 5.3-5.3a5 5 0 0 0 6.4-6.4L14 13l-3-3 3.7-3.7Z" /></>,
    check: <><path d="m5 12 4 4L19 6" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    alert: <><path d="M10.3 3.9 2 18.2A2 2 0 0 0 3.7 21h16.6a2 2 0 0 0 1.7-2.8L13.7 3.9a2 2 0 0 0-3.4 0ZM12 9v4m0 4h.01" /></>,
    logout: <><path d="M10 17l5-5-5-5m5 5H3" /><path d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" /></>,
    phone: <><rect x="6" y="2" width="12" height="20" rx="2" /><path d="M11 18h2" /></>,
    trend: <><path d="m3 17 6-6 4 4 8-8m-6 0h6v6" /></>,
  }

  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name] || paths.grid}</svg>
}

function StatusBadge({ status }) {
  return <span className={`status-badge ${statusColors[status] || 'slate'}`}><span />{statusLabels[status] || status}</span>
}

function money(value) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(Number(value || 0))
}

async function apiRequest(path, token, options = {}) {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await response.json()
  if (!response.ok) throw new Error(data.message || 'No se pudo completar la solicitud.')
  return data
}

function LoginView({ onLogin, onBack }) {
  const [isRegister, setIsRegister] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function submit(event) {
    event.preventDefault()
    setBusy(true)
    setError('')
    try {
      const path = isRegister ? '/auth/register' : '/auth/login'
      const payload = isRegister ? { ...form, role: 'customer' } : { email: form.email, password: form.password }
      const result = await apiRequest(path, '', { method: 'POST', body: JSON.stringify(payload) })
      onLogin(result)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <main className="auth-screen">
      <header className="auth-header">
        <button className="brand brand-button" onClick={onBack} aria-label="Volver al panel"><span className="brand-mark"><Icon name="wrench" size={19} /></span><span>TechFix<small>Service &amp; Diagnostics OS</small></span></button>
        <span className="system-status"><i /> Sistema operacional</span>
      </header>
      <section className="auth-card">
        <div className="auth-hero">
          <div className="auth-logo"><span className="brand-mark"><Icon name="wrench" size={20} /></span><strong>TechFix <small>OS TALLER</small></strong></div>
          <h1>Gestiona tu taller de reparación</h1>
          <p>Plataforma integral para el control de equipos, trazabilidad de piezas y fidelización de clientes.</p>
          <ul>
            <li><span><Icon name="check" size={16} /></span><div><strong>Órdenes de reparación en tiempo real</strong><small>Trazabilidad por código técnico, estado de banco y tiempos de entrega.</small></div></li>
            <li><span><Icon name="check" size={16} /></span><div><strong>Control preciso de inventario</strong><small>Alertas automáticas de stock bajo y compatibilidad multi-marca.</small></div></li>
            <li><span><Icon name="check" size={16} /></span><div><strong>Clientes informados</strong><small>Seguimiento claro de cada reparación desde un solo lugar.</small></div></li>
          </ul>
          <div className="auth-proof"><span className="proof-icon">✦</span><div><strong>Tu taller, siempre bajo control</strong><small>Órdenes gestionadas y auditadas con trazabilidad.</small></div></div>
        </div>
        <div className="auth-form-panel">
          <div className="auth-form-inner">
            <span className="eyebrow"><span className="lock-dot">⌑</span> ACCESO AUTORIZADO</span>
            <h2>{isRegister ? 'Crea tu cuenta en TechFix' : 'Bienvenido de vuelta'}</h2>
            <p className="auth-subtitle">{isRegister ? 'Registra tu cuenta para seguir tus reparaciones.' : 'Ingresa a tu cuenta para continuar.'}</p>
            <form onSubmit={submit}>
              {isRegister && <label>Nombre completo<input required autoComplete="name" placeholder="Ej. Carlos Soto" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label>}
              <label>Correo electrónico<input required type="email" autoComplete="email" placeholder="tu@correo.com" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></label>
              {isRegister && <label>Teléfono / WhatsApp<input type="tel" autoComplete="tel" placeholder="+54 9 11 4829-1029" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} /></label>}
              <label>Contraseña<input required minLength={8} type="password" autoComplete={isRegister ? 'new-password' : 'current-password'} placeholder="Mínimo 8 caracteres" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} /></label>
              {error && <p className="form-error" role="alert">{error}</p>}
              <button className="button primary auth-submit" type="submit" disabled={busy}>{busy ? 'Conectando…' : isRegister ? 'Crear cuenta' : 'Iniciar sesión'} <Icon name="arrow" size={17} /></button>
            </form>
            <p className="auth-toggle">{isRegister ? '¿Ya tienes una cuenta?' : '¿Tu taller aún no está registrado?'} <button onClick={() => { setIsRegister(!isRegister); setError('') }}>{isRegister ? 'Iniciar sesión' : 'Crear una cuenta'}</button></p>
            <div className="auth-trust"><span>◉ Garantía oficial</span><span>⌑ Cifrado seguro</span><span>◌ Soporte directo</span></div>
          </div>
        </div>
      </section>
      <footer className="auth-footer"><span>© 2026 TechFix Workshop Management</span><span>Privacidad y Seguridad · Soporte</span></footer>
    </main>
  )
}

function App() {
  const [session, setSession] = useState(() => {
    const token = localStorage.getItem('techfix_token')
    const userValue = localStorage.getItem('techfix_user')
    if (!token || !userValue) return null
    try {
      return { token, user: JSON.parse(userValue) }
    } catch {
      localStorage.removeItem('techfix_token')
      localStorage.removeItem('techfix_user')
      return null
    }
  })
  const [page, setPage] = useState('dashboard')
  const [orders, setOrders] = useState(sampleOrders)
  const [inventory, setInventory] = useState(sampleInventory)
  const [stats, setStats] = useState(null)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [inventoryFilter, setInventoryFilter] = useState('todos')
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem('techfix_token')))
  const [error, setError] = useState('')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const isPreview = !session

  useEffect(() => {
    if (!session) return
    let active = true
    const requests = [
      apiRequest('/repairs', session.token),
      apiRequest('/inventory', session.token),
    ]
    if (session.user.role !== 'customer') requests.push(apiRequest('/dashboard/stats', session.token))
    Promise.all(requests)
      .then(([repairData, inventoryData, dashboardData]) => {
        if (!active) return
        setOrders(repairData.repairs || [])
        setInventory(inventoryData.items || [])
        if (dashboardData?.stats) setStats(dashboardData.stats)
      })
      .catch((requestError) => {
        if (active) setError(requestError.message)
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => { active = false }
  }, [session])

  const filteredOrders = useMemo(() => orders.filter((order) => {
    const query = search.trim().toLowerCase()
    const matchesQuery = !query || [order.order_number, order.id, order.customer_name, order.device_brand, order.device_model, order.fault_description].some((value) => String(value || '').toLowerCase().includes(query))
    return matchesQuery && (!statusFilter || order.status === statusFilter)
  }), [orders, search, statusFilter])

  const filteredInventory = useMemo(() => inventory.filter((item) => {
    const matchesType = inventoryFilter === 'todos' || item.type === inventoryFilter
    const query = search.trim().toLowerCase()
    return matchesType && (!query || `${item.name} ${item.description || ''}`.toLowerCase().includes(query))
  }), [inventory, inventoryFilter, search])

  const repairStats = stats?.repairs
  const activeOrders = repairStats
    ? Number(repairStats.total_orders) - Number(repairStats.total_entregado) - Number(repairStats.total_cancelado)
    : orders.filter((order) => !['entregado', 'cancelado'].includes(order.status)).length
  const readyCount = repairStats ? Number(repairStats.total_listo) : orders.filter((order) => order.status === 'listo').length
  const lowStockCount = stats?.lowStockItems?.length ?? inventory.filter((item) => item.type === 'repuesto' && Number(item.stock) <= 5).length
  const monthlyRevenue = repairStats ? Number(repairStats.monthly_revenue ?? repairStats.total_revenue) : 1240000

  function handleLogin(result) {
    const nextSession = { token: result.token, user: result.user }
    setLoading(true)
    setError('')
    localStorage.setItem('techfix_token', nextSession.token)
    localStorage.setItem('techfix_user', JSON.stringify(nextSession.user))
    setSession(nextSession)
    setPage('dashboard')
  }

  function handleLogout() {
    localStorage.removeItem('techfix_token')
    localStorage.removeItem('techfix_user')
    setSession(null)
    setStats(null)
    setLoading(false)
    setPage('dashboard')
  }

  function navigate(nextPage) {
    setPage(nextPage)
    setSearch('')
    setStatusFilter('')
    setError('')
    setMobileMenuOpen(false)
  }

  function openOrder(order) {
    setSelectedOrder(order)
    setPage('detail')
  }

  if (page === 'login') return <LoginView onLogin={handleLogin} onBack={() => navigate('dashboard')} />

  const navItems = [
    { label: 'Dashboard', page: 'dashboard', icon: 'grid', group: 'Principal' },
    { label: 'Mi perfil', page: 'profile', icon: 'user', group: 'Principal' },
    { label: 'Órdenes', page: 'orders', icon: 'clipboard', group: 'Mi taller' },
    { label: 'Inventario', page: 'inventory', icon: 'box', group: 'Mi taller' },
    { label: 'Usuarios', page: 'users', icon: 'people', group: 'Mi taller' },
  ]
  const pageTitle = page === 'dashboard' ? 'Resumen del taller' : page === 'orders' ? 'Órdenes de reparación' : page === 'inventory' ? 'Inventario y repuestos' : page === 'detail' ? 'Detalle de orden' : page === 'profile' ? 'Mi perfil' : 'Usuarios del taller'
  const pageSubtitle = page === 'dashboard' ? 'Este es el resumen operativo de tu taller hoy.' : page === 'orders' ? `${orders.length} órdenes activas en el taller actualmente` : page === 'inventory' ? 'Control de stock de repuestos y servicios del taller.' : page === 'detail' ? 'Seguimiento y datos de la reparación.' : 'Gestiona la información de tu cuenta.'

  return (
    <div className="app-shell">
      {mobileMenuOpen && <button className="mobile-backdrop" aria-label="Cerrar menú" onClick={() => setMobileMenuOpen(false)} />}
      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`}>
        <button className="brand brand-button" onClick={() => navigate('dashboard')}><span className="brand-mark"><Icon name="wrench" size={17} /></span><span>TechFix<small>Service Workshop</small></span></button>
        <nav className="side-nav">
          {['Principal', 'Mi taller'].map((group) => <div className="nav-group" key={group}><span className="nav-caption">{group}</span>
            {navItems.filter((item) => item.group === group).map((item) => <button key={item.page} className={`nav-item ${page === item.page || (page === 'detail' && item.page === 'orders') ? 'active' : ''}`} onClick={() => navigate(item.page)}><Icon name={item.icon} size={17} />{item.label}</button>)}
          </div>)}
        </nav>
        <div className="sidebar-bottom">
          <button className="profile-chip" onClick={() => session ? navigate('profile') : navigate('login')}><span className="avatar">{session?.user.name?.split(' ').map((part) => part[0]).slice(0, 2).join('') || 'MR'}</span><span className="profile-text"><strong>{session?.user.name || 'Marcos R.'}</strong><small>{session?.user.role === 'admin' ? 'Administrador' : session?.user.role === 'customer' ? 'Cliente' : 'Técnico'}</small></span>{session && <span className="logout-icon" onClick={(event) => { event.stopPropagation(); handleLogout() }}><Icon name="logout" size={16} /></span>}</button>
        </div>
      </aside>

      <div className="workspace">
        <header className="topbar">
          <button className="mobile-menu button icon-button" onClick={() => setMobileMenuOpen(!mobileMenuOpen)} aria-label="Abrir menú"><Icon name="menu" /></button>
          <div className="breadcrumb"><span className="breadcrumb-icon"><Icon name="wrench" size={15} /></span><strong>Taller TechFix</strong><span>/</span><span>Panel Administrativo</span></div>
          <label className="global-search"><Icon name="search" size={16} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por orden, IMEI, cliente..." /><kbd>⌘ K</kbd></label>
          <button className="top-icon" aria-label="Notificaciones"><Icon name="bell" size={18} /><i /></button>
          <span className="top-divider" />
          <button className="top-user" onClick={() => session ? navigate('profile') : navigate('login')}><span className="avatar">{session?.user.name?.split(' ').map((part) => part[0]).slice(0, 2).join('') || 'MR'}</span><span className="top-user-name">{session?.user.name || 'Marcos R.'}</span><span className="chevron">⌄</span></button>
        </header>

        <main className="main-content">
          <div className="page-heading">
            <div><div className="context-line">SISTEMA OPERATIVO TECHFIX V2.4 <span>•</span> TURNO MATUTINO</div><h1>{page === 'dashboard' ? 'Buenos días, ' + (session?.user.name?.split(' ')[0] || 'Marcos') : pageTitle}</h1><p>{pageSubtitle}</p></div>
            <div className="heading-actions">{isPreview && <button className="button quiet" onClick={() => navigate('login')}>Iniciar sesión <Icon name="arrow" size={15} /></button>}{page === 'dashboard' && <button className="button primary" onClick={() => navigate('orders')}><Icon name="plus" size={16} /> Nueva orden</button>}{page === 'orders' && <button className="button primary" onClick={() => navigate('login')}><Icon name="plus" size={16} /> Nueva orden</button>}{page === 'inventory' && <button className="button secondary" onClick={() => setError('Inicia sesión con un usuario del taller para editar el inventario.')}><Icon name="download" size={16} /> Exportar catálogo</button>}</div>
          </div>
          {isPreview && <div className="preview-notice"><span className="preview-indicator" /> Vista previa de diseño <span>Inicia sesión para consultar los datos reales de tu taller.</span><button onClick={() => navigate('login')}>Acceder <Icon name="arrow" size={14} /></button></div>}
          {error && <div className="notice-error" role="alert">{error}</div>}

          {page === 'dashboard' && <>
            <section className="metrics-grid">
              <MetricCard label="Órdenes activas" value={activeOrders} suffix="equipos" icon="clipboard" tone="blue" foot={<><span className="trend">↗ +3 hoy</span><span>Capacidad: 80%</span></>} />
              <MetricCard label="Listos para entregar" value={readyCount} suffix="para retiro" icon="check" tone="green" foot={<><span className="green-pill">Acción requerida</span><span>Clientes notificados</span></>} />
              <MetricCard label="Ingresos del mes" value={money(monthlyRevenue)} icon="trend" tone="indigo" foot={<><span className="trend">↗ +12% vs mes ant.</span><span>Meta: $1.5M</span></>} />
              <MetricCard label="Stock bajo" value={lowStockCount} suffix="repuestos críticos" icon="alert" tone="amber" foot={<><span className="warning-pill">! Alerta inventario</span><button onClick={() => navigate('inventory')}>Reordenar</button></>} />
            </section>
            <section className="overview-grid">
              <div className="panel status-panel">
                <div className="panel-heading"><div><h2>Órdenes por estado</h2><p>Distribución de reparaciones registradas en el ciclo actual</p></div><span className="total-tag">◉ Total: {orders.length} ord.</span></div>
                <div className="status-list">{Object.entries(statusLabels).map(([key, label]) => {
                  const count = repairStats ? Number(repairStats[`total_${key}`] || 0) : orders.filter((order) => order.status === key).length
                  const pct = orders.length ? Math.round(count / orders.length * 100) : 0
                  return <div className={`status-row ${statusColors[key]}`} key={key}><div className="status-row-label"><i />{label}</div><div className="status-track"><span style={{ width: `${pct}%` }} /></div><span className="status-percent">{pct}.00%</span><strong>{count}</strong></div>
                })}</div>
                <div className="status-summary"><span><small>TIEMPO PROM. DIAG.</small><strong>1h 45m</strong></span><span><small>EFECTIVIDAD</small><strong className="success-text">96.8%</strong></span><span><small>GARANTÍAS ACTIVAS</small><strong>12</strong></span></div>
              </div>
              <div className="panel activity-panel">
                <div className="panel-heading"><div><h2>Actividad reciente</h2></div><button className="text-button" onClick={() => navigate('orders')}>Ver historial</button></div>
                <div className="activity-list">
                  <ActivityItem icon="wrench" tone="blue" title="Pantalla iPhone 13 cambiada por Marcos" time="hace 12 min" />
                  <ActivityItem icon="clipboard" tone="blue" title="Nueva orden REP-2026-048 ingresada" time="hace 35 min" />
                  <ActivityItem icon="check" tone="green" title="Presupuesto aprobado por Carlos Soto" time="hace 1 h" />
                  <ActivityItem icon="alert" tone="amber" title="Stock bajo en Batería Samsung S22" time="hace 2 h" />
                  <ActivityItem icon="check" tone="slate" title="Equipo entregado a Valentina M." time="hace 3 h" />
                </div>
                <div className="push-note">Notificaciones push <span>Activas</span></div>
              </div>
            </section>
            <OrdersTable orders={orders.slice(0, 6)} onOpen={openOrder} onSeeAll={() => navigate('orders')} />
          </>}

          {page === 'orders' && <section className="panel data-panel">
            <div className="filter-bar"><label className="search-field"><Icon name="search" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar por n° orden, cliente o IMEI..." /></label><select aria-label="Filtrar por estado" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}><option value="">Estado: Todos</option>{Object.entries(statusLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select><button className="button secondary" onClick={() => { setSearch(''); setStatusFilter('') }}><Icon name="filter" size={15} /> Limpiar filtros</button></div>
            {loading && <p className="loading-note">Cargando órdenes…</p>}
            <OrdersTable orders={filteredOrders} onOpen={openOrder} />
          </section>}

          {page === 'inventory' && <section className="panel data-panel">
            <div className="inventory-alert"><span className="alert-square"><Icon name="alert" size={18} /></span><div><strong>Stock prioritario para reposición</strong><p>Hay {lowStockCount} componentes por debajo del mínimo de seguridad.</p></div><button className="button secondary" onClick={() => setInventoryFilter('repuesto')}>Ver críticos</button></div>
            <div className="inventory-controls"><div className="filter-tabs">{[['todos', 'Todos'], ['repuesto', 'Repuestos'], ['servicio', 'Servicios']].map(([filter, label]) => <button className={inventoryFilter === filter ? 'selected' : ''} key={filter} onClick={() => setInventoryFilter(filter)}>{label}<b>{filter === 'todos' ? inventory.length : inventory.filter((item) => item.type === filter).length}</b></button>)}</div><div className="filter-bar compact"><label className="search-field"><Icon name="search" size={17} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Buscar repuesto, SKU, modelo..." /></label><span className="stock-value">Valor total stock: <strong>{money(filteredInventory.reduce((sum, item) => sum + Number(item.unit_price) * Number(item.stock), 0))}</strong></span></div></div>
            <div className="inventory-table-wrap"><table className="inventory-table"><thead><tr><th>Ítem y descripción</th><th>Tipo</th><th>Precio público</th><th>Stock actual</th></tr></thead><tbody>{filteredInventory.map((item) => <tr key={item.id}><td><div className="inventory-product"><span className="product-icon"><Icon name={item.type === 'servicio' ? 'wrench' : 'phone'} size={18} /></span><span><strong>{item.name}</strong><small>{item.description || 'Sin descripción'}</small></span></div></td><td><span className={`type-pill ${item.type}`}>{item.type === 'repuesto' ? 'Repuesto' : 'Servicio'}</span></td><td className="price-cell">{money(item.unit_price)}</td><td><div className={`stock-cell ${item.type === 'repuesto' && Number(item.stock) <= 5 ? 'low' : ''}`}><strong>{item.type === 'servicio' ? '∞ ilimitado' : `${item.stock} unid.`}</strong>{item.type === 'repuesto' && <span><i style={{ width: `${Math.min(100, Number(item.stock) * 6)}%` }} /></span>}</div></td></tr>)}</tbody></table>{!filteredInventory.length && <EmptyState message="No encontramos ítems con esos filtros." />}</div>
          </section>}

          {page === 'detail' && <OrderDetail order={orders.find((item) => item.id === selectedOrder?.id || item.order_number === selectedOrder?.order_number) || selectedOrder} onBack={() => navigate('orders')} />}
          {page === 'profile' && <section className="panel profile-panel"><span className="avatar large">{session?.user.name?.split(' ').map((part) => part[0]).slice(0, 2).join('') || 'MR'}</span><h2>{session?.user.name || 'Marcos R.'}</h2><p>{session?.user.email || 'Vista previa del perfil'}</p><span className="role-tag">{session?.user.role || 'Técnico'}</span><button className="button secondary" onClick={session ? handleLogout : () => navigate('login')}>{session ? 'Cerrar sesión' : 'Iniciar sesión'}</button></section>}
          {page === 'users' && <section className="panel empty-panel"><span className="empty-icon"><Icon name="people" size={25} /></span><h2>Gestión de usuarios</h2><p>Inicia sesión como administrador para consultar y administrar usuarios del taller.</p><button className="button primary" onClick={() => navigate('login')}>Iniciar sesión <Icon name="arrow" size={16} /></button></section>}
        </main>
      </div>
    </div>
  )
}

function MetricCard({ label, value, suffix, icon, tone, foot }) {
  return <article className="metric-card"><div className="metric-top"><span>{label}</span><span className={`metric-icon ${tone}`}><Icon name={icon} size={18} /></span></div><div className="metric-value">{value}<small>{suffix}</small></div><div className="metric-foot">{foot}</div></article>
}

function ActivityItem({ icon, tone, title, time }) {
  return <div className="activity-item"><span className={`activity-icon ${tone}`}><Icon name={icon} size={15} /></span><div><strong>{title}</strong><small>{time}</small></div></div>
}

function OrdersTable({ orders, onOpen, onSeeAll }) {
  return <section className="panel recent-panel">
    <div className="panel-heading"><div><h2>Órdenes recientes</h2><p>Mostrando los últimos servicios registrados en el taller</p></div><div className="table-actions"><button className="button secondary small"><Icon name="filter" size={14} /> Filtrar</button>{onSeeAll && <button className="button soft small" onClick={onSeeAll}>Ver todas ({orders.length}) <Icon name="arrow" size={14} /></button>}</div></div>
    <div className="table-wrap"><table className="orders-table"><thead><tr><th>N° orden</th><th>Cliente</th><th>Dispositivo</th><th>Falla reportada</th><th>Estado</th><th>Técnico</th><th>Costo est.</th><th>Actualizado</th><th /></tr></thead><tbody>{orders.map((order) => <tr key={order.id || order.order_number} onClick={() => onOpen(order)}><td><button className="order-link" onClick={(event) => { event.stopPropagation(); onOpen(order) }}>{order.order_number || order.id}</button></td><td><span className="customer-cell"><span className="avatar tiny">{(order.customer_name || 'CS').split(' ').map((part) => part[0]).slice(0, 2).join('')}</span>{order.customer_name || 'Cliente'}</span></td><td><span className="device-cell"><Icon name="phone" size={14} />{order.device_brand} {order.device_model}</span></td><td className="fault-cell">{order.fault_description}</td><td><StatusBadge status={order.status} /></td><td>{order.technician_name || 'Por asignar'}</td><td className="price-cell">{money(order.final_cost || order.estimated_cost)}</td><td className="muted-cell">{order.updated_at || 'Hoy'}</td><td><button className="row-open" aria-label="Ver detalle" onClick={(event) => { event.stopPropagation(); onOpen(order) }}><Icon name="eye" size={16} /></button></td></tr>)}</tbody></table>{!orders.length && <EmptyState message="No hay órdenes que coincidan con la búsqueda." />}</div>
    <div className="table-footer"><span>Mostrando <strong>{orders.length}</strong> reparaciones</span><div><button disabled>Anterior</button><button className="page-current">1</button><button disabled>Siguiente</button></div></div>
  </section>
}

function EmptyState({ message }) {
  return <div className="empty-state"><span><Icon name="search" size={20} /></span>{message}</div>
}

function OrderDetail({ order, onBack }) {
  if (!order) return <section className="panel empty-panel"><h2>Orden no encontrada</h2><button className="button secondary" onClick={onBack}>Volver a órdenes</button></section>
  const orderNumber = order.order_number || order.id
  return <div className="detail-layout">
    <section className="panel detail-main">
      <div className="detail-top"><button className="text-button" onClick={onBack}>‹ Volver a órdenes</button><div className="detail-title"><div><span className="detail-id">{orderNumber}</span><h2>{order.device_brand} {order.device_model}</h2><p>{order.fault_description}</p></div><StatusBadge status={order.status} /></div></div>
      <div className="stepper">{['Recibido', 'En diagnóstico', 'En reparación', 'Listo para retirar', 'Entregado'].map((label, index) => <div className={`step ${index <= Math.max(0, ['recibido', 'en_diagnostico', 'en_reparacion', 'listo', 'entregado'].indexOf(order.status)) ? 'complete' : ''}`} key={label}><span>{index < ['recibido', 'en_diagnostico', 'en_reparacion', 'listo', 'entregado'].indexOf(order.status) ? <Icon name="check" size={14} /> : index + 1}</span><small>{label}</small></div>)}</div>
      <div className="detail-section"><h3><Icon name="phone" size={17} /> Información del equipo</h3><div className="device-summary"><span className="device-large"><Icon name="phone" size={30} /></span><div><strong>{order.device_brand} {order.device_model}</strong><small>IMEI / N° serie: {order.serial_imei || 'No registrado'}</small></div></div><div className="reported-fault"><strong>Falla reportada</strong><p>{order.fault_description}</p></div></div>
      <div className="detail-section"><h3><Icon name="clipboard" size={17} /> Resumen de cobro</h3><div className="cost-row"><span>Presupuesto estimado</span><strong>{money(order.estimated_cost || order.final_cost)}</strong></div><div className="cost-row total"><span>Total final</span><strong>{money(order.final_cost || order.estimated_cost)}</strong></div></div>
    </section>
    <aside className="detail-aside"><section className="panel detail-side-card"><span className="nav-caption">CLIENTE</span><h3>{order.customer_name || 'Cliente TechFix'}</h3><p>{order.customer_email || 'Datos disponibles al iniciar sesión'}</p><p>{order.customer_phone || 'Teléfono no registrado'}</p></section><section className="panel detail-side-card"><span className="nav-caption">TÉCNICO ASIGNADO</span><h3>{order.technician_name || 'Por asignar'}</h3><p>Equipo de servicio técnico TechFix</p></section><section className="panel detail-side-card"><span className="nav-caption">ACTUALIZACIÓN</span><div className="timeline-item"><i /><div><strong>Estado actual: {statusLabels[order.status]}</strong><small>{order.updated_at || 'Orden registrada recientemente'}</small></div></div></section></aside>
  </div>
}

export default App
