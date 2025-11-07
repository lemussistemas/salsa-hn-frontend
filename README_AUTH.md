# Salsa HN - Frontend con Autenticación

Sistema de gestión frontend para Salsa Honduras con autenticación JWT, modo oscuro y componentes shadcn/ui.

## Características Implementadas

### Autenticación
- ✅ Login con JWT
- ✅ Registro de usuarios
- ✅ Logout con invalidación de tokens
- ✅ Refresh automático de tokens
- ✅ Rutas protegidas
- ✅ Context API para gestión de estado de autenticación

### Diseño
- ✅ shadcn/ui components
- ✅ Modo oscuro completo (light/dark/system)
- ✅ Paleta de colores personalizada:
  - Tema claro: #f9ffff (fondo)
  - Tema oscuro: #000030, #0e0d40, #1b1a50, #292760, #363470
- ✅ Diseño responsive
- ✅ Animaciones y transiciones suaves

### Dashboard
- ✅ Panel de control con estadísticas
- ✅ Sistema de tabs para diferentes secciones
- ✅ Tablas con datos
- ✅ Header con perfil de usuario
- ✅ Toggle de tema en header

## Estructura del Proyecto

```
frontend/salsa-hn-frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx        # Página de login
│   │   └── register/page.tsx     # Página de registro
│   ├── dashboard/
│   │   ├── layout.tsx            # Layout del dashboard
│   │   └── page.tsx              # Dashboard principal
│   ├── globals.css               # Estilos globales + tema
│   ├── layout.tsx                # Layout principal
│   └── page.tsx                  # Página de inicio
├── components/
│   ├── ui/                       # Componentes shadcn/ui
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── tabs.tsx
│   │   ├── table.tsx
│   │   └── dropdown-menu.tsx
│   ├── theme-provider.tsx        # Provider de tema
│   └── theme-toggle.tsx          # Toggle de tema
├── contexts/
│   └── AuthContext.tsx           # Context de autenticación
├── lib/
│   ├── api/
│   │   └── auth.ts               # Servicio de API de autenticación
│   └── utils.ts                  # Utilidades (cn function)
└── .env.local                    # Variables de entorno

## Instalación y Configuración

### 1. Instalar dependencias

```bash
cd frontend/salsa-hn-frontend
npm install
```

### 2. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 3. Ejecutar el servidor de desarrollo

```bash
npm run dev
```

El frontend estará disponible en `http://localhost:3000`

## Uso del Sistema

### Registro de Usuario

1. Navega a `http://localhost:3000/register`
2. Completa el formulario con:
   - Nombre (opcional)
   - Apellido (opcional)
   - Usuario (requerido)
   - Email (requerido)
   - Contraseña (mínimo 8 caracteres)
   - Confirmar contraseña
3. Click en "Registrarse"
4. Serás redirigido automáticamente al dashboard

### Inicio de Sesión

1. Navega a `http://localhost:3000/login`
2. Ingresa tu usuario y contraseña
3. Click en "Iniciar Sesión"
4. Serás redirigido al dashboard

### Dashboard

El dashboard incluye:
- **Stats Cards**: Estadísticas generales del sistema
- **Tabs de Navegación**:
  - Resumen: Tabla con matrículas con deuda
  - Alumnos: Gestión de estudiantes (próximamente)
  - Cursos: Gestión de cursos (próximamente)
  - Asistencia: Control de asistencia (próximamente)
- **Header**: Con perfil de usuario, toggle de tema y botón de logout

### Modo Oscuro

- Click en el ícono de sol/luna en el header
- Selecciona entre:
  - **Claro**: Tema claro siempre
  - **Oscuro**: Tema oscuro siempre
  - **Sistema**: Sigue la preferencia del sistema operativo

## Componentes Principales

### AuthContext

Maneja el estado de autenticación:

```typescript
const { user, loading, login, register, logout, refreshUser } = useAuth();
```

### AuthService

Servicio para comunicación con la API:

```typescript
import { authService } from '@/lib/api/auth';

// Login
await authService.login({ username, password });

// Registro
await authService.register({ username, email, password, password2 });

// Logout
await authService.logout();

// Obtener usuario actual
const user = await authService.getCurrentUser();
```

### Rutas Protegidas

El layout del dashboard (`app/dashboard/layout.tsx`) verifica automáticamente:
- Si el usuario está autenticado
- Si no, redirige a `/login`
- Muestra un loading mientras verifica

## Paleta de Colores

### Tema Claro
- Fondo: `#f9ffff`
- Texto: `#000030`
- Primary: `#0e0d40`
- Secondary: `#1b1a50`
- Accent: `#292760`

### Tema Oscuro
- Fondo: `#000030`
- Texto: `#f9ffff`
- Card: `#0e0d40`
- Secondary: `#292760`
- Muted: `#363470`

## Integración con Backend

El frontend está configurado para conectarse con el backend Django en `http://localhost:8000/api`.

### Endpoints utilizados:

- `POST /api/auth/register/` - Registro de usuario
- `POST /api/auth/login/` - Login
- `POST /api/auth/logout/` - Logout
- `POST /api/auth/refresh/` - Refresh token
- `GET /api/auth/me/` - Obtener usuario actual

## Próximas Funcionalidades

- [ ] CRUD completo de Alumnos
- [ ] CRUD completo de Cursos y Grupos
- [ ] Gestión de Matrículas
- [ ] Control de Asistencia
- [ ] Gestión de Pagos
- [ ] Reportes y Estadísticas
- [ ] Notificaciones en tiempo real

## Tecnologías Utilizadas

- **Next.js 16** - Framework React
- **TypeScript** - Tipado estático
- **Tailwind CSS 4** - Estilos
- **shadcn/ui** - Componentes
- **next-themes** - Gestión de tema
- **axios** - Cliente HTTP
- **Lucide React** - Iconos

## Scripts Disponibles

```bash
# Desarrollo
npm run dev

# Build para producción
npm run build

# Iniciar servidor de producción
npm start

# Linting
npm run lint
```

## Notas de Desarrollo

### Agregar nuevos componentes shadcn/ui

Los componentes están en `components/ui/`. Para agregar nuevos:

1. Crear el archivo en `components/ui/`
2. Seguir el patrón de los componentes existentes
3. Usar la función `cn()` de `lib/utils.ts` para merge de clases

### Modificar colores del tema

Edita `app/globals.css` en la sección `@layer base` para actualizar las variables CSS:

```css
:root {
  --primary: 239 85% 15%; /* HSL format */
  /* ... más variables */
}
```

### Agregar nuevas rutas protegidas

Crea la ruta dentro de `app/dashboard/` y automáticamente heredará la protección del layout.

## Troubleshooting

### Error: "No refresh token available"
- Asegúrate de que el backend esté corriendo
- Verifica que la URL del API sea correcta en `.env.local`
- Limpia el localStorage y vuelve a iniciar sesión

### Tema no cambia
- Verifica que el ThemeProvider esté en el layout principal
- Asegúrate de que `suppressHydrationWarning` esté en el tag `<html>`

### Estilos no cargan
- Ejecuta `npm run dev` de nuevo
- Verifica que Tailwind esté configurado correctamente
- Revisa la consola del navegador por errores

## Soporte

Para reportar problemas o sugerencias, contacta al equipo de desarrollo.
