# Práctica Web - Sistema de Servicio Técnico (TechFix)

Proyecto de aplicación web con arquitectura cliente-servidor para la gestión de recepción de celulares, servicio técnico e inventario.

## Tecnologías

- **Backend**: Node.js, Express, JWT
- **Frontend**: HTML, CSS, JavaScript (Fetch API)
- **Base de Datos**: PostgreSQL (DBeaver)
- **Despliegue**: Docker & Docker Compose

## Estructura

- `src/`: API REST Backend (Controllers, Services, DTOs, Routes)
- `client/`: Interfaz Web Frontend
- `database/`: Scripts SQL (`schema.sql` y `seed.sql`)

## Ejecución

1. Ejecutar `database/schema.sql` y `database/seed.sql` en PostgreSQL mediante DBeaver.
2. Iniciar el servidor:

```bash
npm install
npm run dev
```

3. Abrir en el navegador: `http://localhost:3000`

### Con Docker Compose:
```bash
docker-compose up --build
```
