# TechFix — Plan de Diseño de Interfaz

> App web para taller de reparación de celulares, tablets y laptops.
> Documento preparado para generar las pantallas en **Google Stitch** y después exportar a **React + Vite + Tailwind**.

---

## 1. Resumen del producto

**TechFix** digitaliza la operación de un taller técnico: registra órdenes de reparación, controla el inventario de repuestos y permite que el cliente siga el estado de su equipo.

### Roles
| Rol | Descripción |
|---|---|
| `customer` | Cliente. Registra su dispositivo, consulta el estado de sus reparaciones y aprueba el presupuesto. |
| `technician` | Técnico. Diagnostica, actualiza estados, agrega repuestos/servicios a la orden. |
| `admin` | Administrador. Acceso total: usuarios, inventario, órdenes, reportes. |

### Módulos
1. Autenticación (login / registro)
2. Dashboard con métricas del taller
3. Órdenes de reparación (listado, detalle, cambio de estado)
4. Inventario de repuestos y servicios
5. Gestión de usuarios
6. Perfil de usuario

---

## 2. Fundamentos de diseño

### 2.1 Personalidad visual
- **Tono**: profesional, técnico, confiable. Nada de toy; se siente software de operación real.
- **Referencia**: herramientas de ticketing (Linear, Zendesk) mezcladas con la limpieza de un producto SaaS moderno.
- **Paleta**: fondo claro con superficie blanca, acento azul eléctrico como color de marca y de acción primaria, ámbar/verde/rojo reservados exclusivamente para estados.

### 2.2 Tokens de color

```css
/* Marca */
--tf-primary:        #2563EB;  /* azul acción primaria */
--tf-primary-hover:  #1D4ED8;
--tf-primary-soft:   #DBEAFE;  /* fondos de chip/badge */
--tf-primary-dark:   #1E3A8A;

/* Superficies */
--tf-bg:             #F6F8FB;  /* fondo general de app */
--tf-surface:        #FFFFFF;  /* tarjetas, tablas, modales */
--tf-surface-alt:    #F1F5F9;  /* hover de filas, stripes */

/* Texto */
--tf-text:           #0F172A;  /* títulos */
--tf-text-body:      #334155;  /* texto normal */
--tf-text-muted:     #64748B;  /* metadatos, helpers */

/* Bordes */
--tf-border:         #E2E8F0;
--tf-border-strong:  #CBD5E1;

/* Estados de orden */
--tf-received:       #0284C7;  /* recibido      - sky */
--tf-diagnosing:     #D97706;  /* diagnóstico   - amber */
--tf-repairing:      #7C3AED;  /* en reparación - violet */
--tf-ready:          #059669;  /* listo         - emerald */
--tf-delivered:      #475569;  /* entregado    - slate */
--tf-cancelled:      #DC2626;  /* cancelado    - red */
```

### 2.3 Tipografía
- **Familia**: `Inter` (UI) — fallback `system-ui, -apple-system, "Segoe UI", sans-serif`.
- **Escala** (escala base 4px):

| Elemento | Tamaño | Peso | Line-height | Letter-spacing |
|---|---|---|---|---|
| H1 título de página | 24px | 700 | 32px | -0.02em |
| H2 título de sección | 18px | 600 | 26px | -0.01em |
| H3 título de tarjeta | 16px | 600 | 22px | 0 |
| Body / tabla | 14px | 400–500 | 20px | 0 |
| Label / caption | 12px | 500–600 | 16px | 0.02em (mayúsculas) |
| Micro / help text | 12px | 400 | 16px | 0 |
| Mono (IMEI, nº orden) | 13px | 500 | 18px | 0 |

### 2.4 Espaciado, radio y elevación
- **Espaciado base**: 4px — usa múltiplos `4 / 8 / 12 / 16 / 20 / 24 / 32 / 40 / 48`.
- **Padding de página**: 24px en desktop, 16px en tablet, 16px en móvil.
- **Radio de borde**:
  - `6px` → inputs, botones, chips
  - `8px` → badges
  - `12px` → tarjetas y paneles
  - `999px` → píldoras, avatares
- **Sombras** (minimalistas, no "drop shadow" exagerado):
  - `xs`: `0 1px 2px rgba(15,23,42,.06)`
  - `sm`: `0 1px 3px rgba(15,23,42,.08), 0 1px 2px rgba(15,23,42,.04)`
  - `md`: `0 4px 12px rgba(15,23,42,.08)`
  - `lg`: `0 12px 32px rgba(15,23,42,.14)` (modales)

### 2.5 Iconografía
- Set: **Lucide** o **Material Symbols Rounded**, 20px por defecto, 1.75px de grosor.
- Íconos clave: wrench, smartphone, package (inventario), clipboard-list (órdenes), users, layout-dashboard, search, bell, plus, chevron-down, alert-triangle, check-circle, truck (entregado).

### 2.6 Reglas de componente
- Altura mínima de botón: **40px** (44px en móvil). Bordes redondeados `6px`.
- Botón primario: fondo `--tf-primary`, texto blanco, sin sombra. Hover oscurece.
- Botón secundario: fondo blanco, borde `--tf-border-strong`.
- Tarjetas: fondo blanco, borde `--tf-border` 1px, radio 12px, sombra `xs`.
- Tablas: header con fondo `--tf-surface-alt`, texto 12px uppercase letter-spacing 0.02em, filas de 56px, separadores de 1px, hover `--tf-surface-alt`.
- Todos los estados de foco con anillo visible: `0 0 0 3px rgba(37,99,235,.25)`.

---

## 3. Arquitectura de la interfaz

```
┌─────────────────────────────────────────────┐
│  Sidebar 240px  │  Topbar 64px             │
│  (fijo)         │  ─────────────────────   │
│                 │  Contenido con           │
│  ● Logo         │  padding 24px            │
│  ● Navegación   │                         │
│  ● ...          │                         │
│                 │                         │
├─────────────────┴───────────────────────────┤
│  (oculto en móvil → menú lateral deslizante)│
└─────────────────────────────────────────────┘
```

### Sidebar (240px, blanco, borde derecho)
Marca → Navegación agrupada → Pie con usuario.

**Navegación**
| Item | Ícono | Ruta | Visible para |
|---|---|---|---|
| Dashboard | layout-dashboard | `/` | admin, technician |
| Órdenes | clipboard-list | `/repairs` | todos |
| Inventario | package | `/inventory` | todos (lectura), admin/tech (edición) |
| Usuarios | users | `/users` | admin, technician |
| Mi perfil | user | `/profile` | todos |

- Item activo: fondo `--tf-primary-soft`, texto `--tf-primary-dark`, ícono filled, barra lateral izquierda de 3px en `--tf-primary`.
- Sección "Mi taller" (Órdenes, Inventario, Usuarios) con label 11px uppercase color `--tf-text-muted`.

### Topbar (64px, blanco, borde inferior)
- Izquierda: botón hamburguesa (solo <1024px) + título de página.
- Derecha: buscador global (input con ícono, 260px), campana de notificaciones con punto rojo, separador vertical, avatar + nombre + rol (abre dropdown con "Mi perfil" / "Cerrar sesión").

### Breakpoints
| Nombre | Rango | Layout |
|---|---|---|
| Móvil | < 640px | 1 columna, sidebar como drawer, tablas → cards |
| Tablet | 640–1024px | 1 columna, filtros en colapsable |
| Desktop | ≥ 1024px | sidebar + contenido de 2 columnas (KPIs) |

---

## 4. Inventario de pantallas

### 4.1 Login — `/login`
- Layout dividido 50/50. Izquierda: panel azul `#1E3A8A` → `#2563EB` con degradado, logo TechFix blanco, título "Gestiona tu taller de reparación", 3 bullets con ícono check (órdenes, inventario, clientes), ilustración sutil de teléfono roto con wrench. Derecha: formulario centrado max-width 400px.
- Campos: Email, Contraseña (con toggle de visibilidad), casilla "Recordarme". Botón "Entrar" ancho completo. Link "Olvidé mi contraseña". Debajo separador "o divider" y botón secundario "Crear cuenta".
- Estados: campo con error = borde `#DC2626` + texto de ayuda 12px rojo. Botón en estado loading con spinner.

### 4.2 Registro — `/register`
- Card centrada 480px sobre `--tf-bg`. Solo para clientes.
- Campos: Nombre completo, Email, Teléfono, Contraseña, Confirmar contraseña.
- Medidor de fuerza de contraseña (barra de 4 segmentos: rojo/naranja/verde).
- Checkbox de términos. Botón "Crear cuenta".

### 4.3 Dashboard — `/`
Solo para `admin` y `technician`.

**Fila 1 — KPIs (grid 4 columnas, gap 16px)**
Tarjetas blancas con ícono en cuadro de 40px con fondo `soft` del color, etiqueta 12px muted, valor 28px bold, delta opcional.
| Tarjeta | Ícono | Valor |
|---|---|---|
| Órdenes activas | clipboard-list | total en estados no terminales |
| Listos para entregar | check-circle | `listo` |
| Ingresos del mes | dollar-sign | suma `final_cost` mes |
| Stock bajo | alert-triangle | items con `stock <= 3` |

**Fila 2 — grid 2 columnas (2fr / 1fr)**
- Izquierda: **"Órdenes por estado"** — barra horizontal segmentada con los 6 estados y su color, o lista de barras horizontales con conteo.
- Derecha: **"Actividad reciente"** — feed vertical con ícono circular, texto y timestamp relativo ("hace 12 min").

**Fila 3 — Tabla "Órdenes recientes"**
Columnas: Orden # | Cliente | Dispositivo | Estado | Técnico | Costo est. | Actualizado. 8 filas, botón "Ver todas".

### 4.4 Mis reparaciones — `/repairs` (cliente)
Versión del listado para cliente: solo sus órdenes, columna de costo oculta si no fue aprobada.
- Encabezado: título + botón "Registrar mi celular" (primario).
- Barra de filtros: input de búsqueda (nº orden o IMEI) + select de Estado.
- Vista tarjeta en móvil: nº orden grande mono, dispositivo, chip de estado, fecha, costo.

### 4.5 Listado de órdenes — `/repairs`
- Encabezado: H1 "Órdenes de reparación" + contador, botón "Nueva orden" (primario, ícono plus).
- Fila de filtros (card blanca, padding 16px, grid): Búsqueda, Estado (select), Marca (select), Técnico (select), Rango de fechas, botón "Limpiar".
- Barra de resumen: 4 mini-stats (Total / En proceso / Listos / Cancelados).
- Toggle **Tabla / Tarjetas**.
- Tabla: selección múltiple con checkbox → barra de acción masiva (Asignar técnico, Cambiar estado, Exportar).
- Paginación: "Mostrando 1–10 de 47" + selector de filas + páginas.
- Estados vacíos: sin resultados (ícono search, "No encontramos órdenes", botón "Limpiar filtros") y sin órdenes (ícono clipboard, "Crea la primera orden").

### 4.6 Detalle de orden — `/repairs/:id`
- Cabecera breadcrumb `Órdenes / REP-2026-001`. Título: nº de orden en mono + chip de estado. Acciones a la derecha: "Actualizar estado" (primario), "Editar", kebab menu (Imprimir, Cancelar orden, Eliminar).
- **Stepper de estado** horizontal: Recibido → En diagnóstico → En reparación → Listo → Entregado. Paso actual con ícono filled y línea de progreso azul; pasos futuros en gris. Click para saltar (solo admin/tech).
- Grid 2 columnas (2fr / 1fr):
  - Izquierda:
    - **Card "Dispositivo"** — ícono smartphone grande, marca/modelo, IMEI mono, descripción de la falla en bloque citado.
    - **Card "Repuestos y servicios"** — tabla con nombre, tipo (chip Repuesto/Servicio), cantidad × precio unitario, subtotal alineado a la derecha; total de la orden destacado abajo. Botón "+ Agregar ítem".
    - **Card "Notas del técnico"** — área de texto multilínea con autoguardado e indicador "Guardado".
  - Derecha (sticky):
    - **Card "Cliente"** — avatar con iniciales, nombre, email, teléfono (link tel:).
    - **Card "Técnico asignado"** — avatar, nombre, o "Sin asignar" + botón "Asignar".
    - **Card "Costos"** — Estimado / Final / Total cobrado, el total en 22px bold.
    - **Card "Actividad"** — timeline vertical con puntos y línea conectora.
- Footer de acciones en móvil: barra fija con "Actualizar estado".

### 4.7 Nueva / editar orden — `/repairs/new`
- Page split: formulario (2fr) + resumen sticky (1fr).
- Secciones del formulario en cards con paso numerado:
  1. **Cliente** — select de clientes existentes o crear nuevo (nombre, email, teléfono).
  2. **Dispositivo** — Marca (select), Modelo (input con datalist), IMEI/Nº de serie (input mono), Tipo de equipo (Celular / Tablet / Laptop / Consola / Otro).
  3. **Falla** — textarea + chips de fallas frecuentes (No enciende, Pantalla rota, No carga, Batería drains, Altavoz, Cámara, Vidrio, Teclado).
  4. **Presupuesto** — Costo estimado, fecha prometida, prioridad (select).
  5. **Técnico** — select opcional.
- Resumen lateral: previsualización en vivo de la tarjeta de la orden.
- Footer: Cancelar / Guardar borrador / Crear orden (primario).

### 4.8 Inventario — `/inventory`
- Encabezado: H1 "Inventario" + 2 stats pills, botón "+ Nuevo ítem".
- Filtros: búsqueda, tabs `Todos | Repuestos | Servicios | Stock bajo`.
- Toggle **Tabla / Tarjetas**.
- Tabla: Ítem (ícono + nombre + descripción truncada) | Tipo (chip) | Precio | Stock (con barra de nivel + rojo si ≤3) | Actualizado | acciones.
- Modal **"Nuevo ítem"**: Nombre, Descripción, Tipo (radio Repuesto/Servicio), Precio unitario, Stock inicial.

### 4.9 Usuarios — `/users` (admin)
- Encabezado + botón "+ Nuevo usuario".
- Filtros: búsqueda, tabs por rol.
- Tabla: Usuario (avatar + nombre + email) | Rol (chip con color por rol) | Teléfono | Registrado | Órdenes | acciones.
- Modal **"Nuevo usuario"**: nombre, email, teléfono, rol (select), contraseña.
- Acción masiva: cambiar rol, desactivar.

### 4.10 Perfil — `/profile`
- Card de cabecera con avatar grande (84px), nombre, rol, botón "Cambiar foto".
- Tabs: Datos personales | Contraseña | Notificaciones.
- Campos de datos: nombre, email (disabled, "contacta al admin"), teléfono.
- Cambio de contraseña: actual, nueva, confirmar + medidor de fuerza.

---

## 5. Componentes reutilizables

| Componente | Variantes / notas |
|---|---|
| `Button` | `primary`, `secondary`, `ghost`, `danger`, `icon`; tamaños `sm` (32), `md` (40), `lg` (48); estado `loading`. |
| `Input` | `default`, `withIcon`, `withPrefix`; prop `error` muestra helper; prop `hint`. |
| `Select` | Custom con chevron, búsqueda opcional. |
| `Textarea` | Con contador de caracteres. |
| `Checkbox` / `Radio` / `Switch` | Custom, 20px, con check en `--tf-primary`. |
| `Badge` | `status` (6 variantes de orden), `role` (admin/technician/customer), `type` (repuesto/servicio), `stock` (bajo/ok). |
| `Card` | Con `header` (título + acción) y `body`; prop `padding`. |
| `StatCard` | Variante de `Card` para KPIs. |
| `Table` | Con `sortable`, `selectable`, `emptyState`, `loading` (skeletons). |
| `DataTableToolbar` | Búsqueda + filtros + vista toggle + acciones masivas. |
| `Modal` | Tamaños `sm` 400 / `md` 560 / `lg` 720; header, body, footer sticky. |
| `Drawer` | Lateral derecho 480px, para edición rápida de orden. |
| `Dropdown` | Menú con items, separadores, atajos. |
| `Tabs` | Underline animado, variante `pill`. |
| `Stepper` | Para el progreso de la orden. |
| `Timeline` | Vertical, para actividad. |
| `Avatar` | Con iniciales, tamaños 32/40/84; `status` online. |
| `Toast` | `success`, `error`, `warning`, `info`; 4s autocierre, esquina superior derecha. |
| `ConfirmDialog` | Para acciones destructivas, botón rojo. |
| `EmptyState` | Ícono + título + descripción + acción. |
| `Skeleton` | Para carga de cards, filas de tabla y KPIs. |
| `Pagination` | Con selector de filas por página. |
| `Breadcrumb` | Navegación jerárquica. |
| `SearchInput` | Input con ícono y botón clear. |
| `PageHeader` | H1 + descripción + slot de acciones. |

---

## 6. Mapa de rutas

```
/login                    Login
/register                 Registro cliente
/                         Dashboard (admin, technician)
/repairs                  Listado de órdenes
/repairs/new              Nueva orden
/repairs/:id              Detalle de orden
/inventory                Inventario
/users                    Usuarios (admin, technician)
/profile                  Perfil
*                         404
```

---

## 7. Reglas de respuesta y microcopy

- Todos los textos en **español**, con **tú** (nunca "usted").
- Errores: "No pudimos iniciar sesión. Revisá tu email y contraseña."
- Éxito con datos: "Orden REP-2026-014 creada y asignada a Marcos."
- Estados vacíos siempre con explicación + acción.
- Fechas: formato relativo ("hace 2 h") en listas, absoluto ("14 oct 2026, 15:32") en detalle.
- Montos: `$ 45.000` (formato local es-AR con separador de miles).
- Estados mostrados con texto legible, nunca solo color: "En reparación", "Listo para entregar".

---

## 8. Accesibilidad

- Contraste mínimo **4.5:1** en texto, **3:1** en bordes de control.
- Foco visible en todos los elementos interactivos; navegación por teclado completa.
- El color de estado siempre va acompañado de texto o ícono (nunca información solo por color).
- Labels asociados a cada input; `aria-label` en botones de ícono.
- Landmarks semánticos: `<nav>`, `<main>`, `<aside>`, `<header>`.
- Respetar `prefers-reduced-motion`.

---

## 9. Prompts para Google Stitch

Copiá cada bloque en Stitch para generar la pantalla correspondiente. Mantené el mismo sistema de diseño en todos los prompts (el color y el nombre de las variables importan).

### Prompt base (repetir al inicio de cada prompt)
```
Diseña una interfaz web para "TechFix", una aplicación de gestión para un taller
de reparación de celulares, tablets y laptops. Estilo: SaaS profesional y limpio,
minimalista, con mucho espacio en blanco y tarjetas blancas sobre fondo gris muy
claro (#F6F8FB). Color de marca azul #2563EB. Tipografía Inter. Bordes redondeados
moderados (6-12px), sombras muy sutiles, iconos de línea. Layout con sidebar
izquierdo fijo de 240px color blanco y barra superior de 64px. Todo en español.
Aspecto 1440x900, escritorio.
```

### Prompt — Login
```
Pantalla de login de TechFix, layout dividido en dos columnas iguales.

Panel izquierdo con fondo azul degradado (#1E3A8A a #2563EB): logo "TechFix" con
ícono de llave inglesa y teléfono en blanco, título grande "Gestiona tu taller de
reparación", tres líneas con ícono de check blanco: "Órdenes de reparación al día",
"Control de inventario y repuestos", "Tus clientes siempre informados". Al fondo,
un gráfico decorativo sutil de líneas.

Panel derecho con formulario centrado, ancho máximo 400px, sobre fondo blanco:
título "Bienvenido de vuelta", subtítulo "Ingresá a tu cuenta para continuar",
campo "Email" con ícono de sobre, campo "Contraseña" con ícono de candado y botón
de mostrar/ocultar a la derecha, checkbox "Recordarme" y link azul "Olvidé mi
contraseña" alineado a la derecha, botón azul ancho completo "Entrar", separador
con texto "o", botón blanco con borde "Crear cuenta". Al pie, texto pequeño gris
"© 2026 TechFix".
```

### Prompt — Dashboard
```
Dashboard de TechFix para un taller de reparación, layout con sidebar y topbar.

Topbar: a la izquierda título "Dashboard", a la derecha buscador con ícono de
lupa, ícono de campana con punto rojo, y avatar circular con nombre "Marcos R." y
etiqueta "Técnico".

Sidebar blanco: logo TechFix arriba, luego sección "Principal" con item "Dashboard"
activo (fondo azul muy claro y texto azul oscuro) y item "Mi perfil". Sección "Mi
taller" con items "Órdenes", "Inventario" y "Usuarios", cada uno con ícono de línea.
Abajo, tarjeta de usuario con avatar, nombre, rol y botón de cerrar sesión.

Contenido: encabezado "Buenos días, Marcos" con subtítulo "Este es el resumen de
tu taller hoy" y botón azul "Nueva orden".

Fila de 4 tarjetas KPI: "Órdenes activas 24" con ícono de lista en cuadro azul
claro, "Listos para entregar 7" con ícono de check verde, "Ingresos del mes
$1.240.000" con ícono de billete, "Stock bajo 5" con ícono de triángulo ámbar.

Debajo, grid de dos columnas: a la izquierda tarjeta "Órdenes por estado" con seis
barras horizontales de colores (azul cielo, ámbar, violeta, verde, gris, rojo) y
conteos; a la derecha tarjeta "Actividad reciente" con feed de 5 ítems, cada uno con
ícono circular de color, texto y hora relativa.

Abajo, tarjeta "Órdenes recientes" con tabla de 6 filas y columnas: Orden, Cliente,
Dispositivo, Estado (chip de color), Técnico, Costo, Actualizado, y un botón "Ver
todas" arriba a la derecha.
```

### Prompt — Listado de órdenes
```
Pantalla "Órdenes de reparación" de TechFix, con sidebar y topbar iguales al
dashboard.

Encabezado con título "Órdenes de reparación", subtítulo "24 órdenes activas",
y botón azul "Nueva orden" con ícono de más.

Debajo, una tarjeta blanca de filtros con: campo de búsqueda con ícono de lupa
"Buscar por nº de orden, cliente o IMEI", tres selects (Estado, Marca, Técnico) con
chevron, y botón de texto "Limpiar filtros" a la derecha.

Fila de 4 mini-estadísticas: Total 47, En proceso 18, Listos 7, Cancelados 3.

Tarjeta de tabla con toolbar superior (búsqueda, filtro, y toggle de vista
tabla/tarjetas a la derecha), checkbox de selección en el encabezado, y filas con:
nº de orden en monoespaciado azul, nombre del cliente con avatar, dispositivo con
icono de teléfono, chip de estado coloreado, nombre del técnico, costo estimado,
fecha relativa, y kebab menu de acciones. Al pie, paginación con "Mostrando 1-10
de 47" y botones de página.
```

### Prompt — Detalle de orden
```
Pantalla de detalle de orden de reparación en TechFix.

Breadcrumb "Órdenes / REP-2026-014". Encabezado con el número de orden en
monoespaciado grande, chip de estado verde "Listo", y a la derecha botones
secundario "Editar", primario "Actualizar estado" y kebab menu.

Debajo, un stepper horizontal de 5 pasos con íconos en círculos: Recibido, En
diagnóstico, En reparación, Listo, Entregado. Los pasos completados con línea azul,
el actual resaltado.

Luego grid de dos columnas: columna izquierda más ancha con tarjetas
"Dispositivo" (icono grande de teléfono, marca y modelo, IMEI en monoespaciado y
la descripción de la falla en un bloque citado con fondo gris), "Repuestos y
servicios" (tabla con ítems, tipo, cantidad, precio unitario, subtotal y total
resaltado abajo, más botón "+ Agregar ítem"), y "Notas del técnico" (área de texto
con texto "Cambio de batería ejecutado. Probado 20 min sin caídas.").

Columna derecha con tarjetas apiladas: "Cliente" con avatar, nombre, email y
teléfono; "Técnico asignado" con avatar; "Costos" con Estimado, Final y Total
cobrado en tipografía grande; y "Actividad" con timeline vertical de puntos.
```

### Prompt — Nueva orden
```
Pantana de creación de orden en TechFix, layout de dos columnas: formulario a la
izquierda (más ancho) y tarjeta de resumen fija a la derecha.

Formulario en tarjetas separadas con pasos numerados en círculo azul:
Paso 1 "Cliente" con un select de clientes y un link "o crear nuevo".
Paso 2 "Dispositivo" con selects de Marca y Tipo de equipo, input de Modelo e
input de IMEI en monoespaciado.
Paso 3 "Falla reportada" con un textarea y una fila de chips seleccionables:
No enciende, Pantalla rota, No carga, Batería, Altavoz, Cámara.
Paso 4 "Presupuesto" con input de costo estimado, select de prioridad y date picker.
Paso 5 "Técnico asignado" con select.

Tarjeta lateral derecha "Resumen" con vista previa en vivo: número de orden,
dispositivo, cliente y total estimado, sobre fondo gris claro.

Barra inferior con botones "Cancelar" y "Crear orden" en azul.
```

### Prompt — Inventario
```
Pantalla de inventario de repuestos y servicios en TechFix.

Encabezado "Inventario" con subtítulo y dos pills de estadística, botón azul
"+ Nuevo ítem".

Tarjeta de filtros con búsqueda y tabs tipo píldora: Todos, Repuestos, Servicios,
Stock bajo (esta última con contador rojo).

Tabla con columnas: Ítem (icono en cuadro gris + nombre en negrita + descripción
truncada en gris), Tipo (chip "Repuesto" azul o "Servicio" violeta), Precio
unitario, Stock (número y una barra de progreso que se vuelve roja con poco
stock, con etiqueta "Bajo"), y kebab menu.

Estados vacíos con ilustración mínima e ícono de paquete, texto "Aún no hay
ítems en el inventario" y botón "Agregar el primero".
```

---

## 10. Checklist de handoff

- [ ] Cada pantalla generada en Stitch respeta la paleta, tipografía y radios definidos.
- [ ] Sidebar y topbar idénticos en todas las pantallas internas.
- [ ] Todas las tablas tienen estado vacío, estado de carga (skeleton) y estado de error.
- [ ] Todos los formularios tienen labels, validación en línea y mensajes de error.
- [ ] Modales tienen versión mobile como drawer a pantalla completa.
- [ ] Exportar desde Stitch con **HTML + Tailwind** y montar en `frontend/src/pages/`.
- [ ] Verificar responsive en 375px, 768px y 1440px.
- [ ] Verificar contraste y navegación por teclado antes de integrar con la API.