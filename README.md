# Gestión de Compras GínEZ

Sistema integral para el control, seguimiento y gestión de requisiciones y entregas de materias primas.

## 🚀 Características Principales

### 1. Administración de Requisiciones
- **Control Total**: Creación, edición y eliminación de registros de requisiciones.
- **Visibilidad Extendida**: Tabla de administración con seguimiento detallado del ciclo de vida:
  - Fecha de Recepción
  - Fecha Solicitada (Solicitud original)
  - Fecha Confirmada (Acordada con proveedor)
  - Cantidad Entregada y Fecha de Entrega Real
- **Filtros Avanzados**: Búsqueda por proveedor, destino, estatus y rangos de fecha.

### 2. Calendario de Recepción
- **Visualización Gráfica**: Calendario dinámico para el seguimiento visual de entregas programadas.
- **Código de Colores**: Identificación inmediata del estatus de cada entrega (Pendiente, Confirmada, Entregada, etc.).
- **Gestión Rápida**: Acceso a detalles, edición y eliminación directamente desde el calendario.

### 3. Seguridad y Auditoría
- **Roles de Usuario**:
  - **Admin**: Control total, incluyendo eliminación de registros.
  - **Coordinadora**: Gestión de requisiciones y confirmación de fechas.
  - **Consulta**: Acceso de solo lectura para monitoreo.
- **Historial de Cambios**: Registro detallado (Audit Trail) de cada modificación realizada en las requisiciones, incluyendo quién cambió qué y cuándo.

### 4. Interfaz de Usuario Premium
- **Diseño Moderno**: Basado en una estética profesional con modo claro/oscuro y componentes optimizados.
- **Formularios Inteligentes**: Validación robusta de datos y manejo de campos dinámicos.
- **Responsive**: Adaptado para una visualización clara en diferentes tamaños de pantalla.

## 🛠️ Stack Tecnológico

- **Frontend**: [Next.js 14+](https://nextjs.org/) (App Router)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Componentes**: [Shadcn UI](https://ui.shadcn.com/)
- **Base de Datos y Auth**: [Supabase](https://supabase.com/)
- **Validación**: [Zod](https://zod.dev/) & React Hook Form

## 🛠️ Configuración Local

1. Clonar el repositorio.
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Configurar variables de entorno en `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_llave_anonima
   ```
4. Iniciar el servidor de desarrollo:
   ```bash
   npm run dev
   ```

---
Desarrollado para la optimización del flujo de suministros de GínEZ.
