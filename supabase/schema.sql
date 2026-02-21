-- ============================================================
-- PROCUREMENT CALENDAR APP – SUPABASE SCHEMA
-- Copy and paste this entire script in Supabase SQL Editor
-- ============================================================

-- ============================================================
-- 0. EXTENSIONS
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. ENUMS
-- ============================================================
CREATE TYPE user_role AS ENUM ('admin', 'coordinadora', 'consulta');

-- ============================================================
-- 2. CATALOG TABLES
-- ============================================================

CREATE TABLE proveedores (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre      TEXT NOT NULL,
  activo      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE productos (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre       TEXT NOT NULL,
  descripcion  TEXT,
  activo       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE presentaciones (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre      TEXT NOT NULL,
  activo      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE destinos (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre      TEXT NOT NULL,
  activo      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE estatus (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre      TEXT NOT NULL,
  color_hex   TEXT NOT NULL DEFAULT '#6366F1',
  activo      BOOLEAN NOT NULL DEFAULT TRUE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE unidades (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nombre       TEXT NOT NULL,
  abreviatura  TEXT NOT NULL,
  activo       BOOLEAN NOT NULL DEFAULT TRUE,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 3. PROFILES TABLE (extends auth.users)
-- ============================================================

CREATE TABLE profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre_completo TEXT,
  rol             user_role NOT NULL DEFAULT 'consulta',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, nombre_completo, rol)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nombre_completo', NEW.email),
    COALESCE((NEW.raw_user_meta_data->>'rol')::user_role, 'consulta')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- 4. MAIN TABLE: REQUISICIONES
-- ============================================================

CREATE TABLE requisiciones (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  fecha_recepcion      DATE NOT NULL,
  proveedor_id         UUID NOT NULL REFERENCES proveedores(id),
  producto_id          UUID NOT NULL REFERENCES productos(id),
  presentacion_id      UUID NOT NULL REFERENCES presentaciones(id),
  destino_id           UUID NOT NULL REFERENCES destinos(id),
  estatus_id           UUID NOT NULL REFERENCES estatus(id),
  cantidad_solicitada  NUMERIC(10, 2) NOT NULL CHECK (cantidad_solicitada > 0),
  unidad_cantidad_id   UUID NOT NULL REFERENCES unidades(id),
  numero_oc            TEXT,
  comentarios          TEXT,
  created_by           UUID NOT NULL REFERENCES auth.users(id),
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_requisiciones_fecha ON requisiciones(fecha_recepcion);
CREATE INDEX idx_requisiciones_proveedor ON requisiciones(proveedor_id);
CREATE INDEX idx_requisiciones_estatus ON requisiciones(estatus_id);
CREATE INDEX idx_requisiciones_destino ON requisiciones(destino_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_requisiciones_updated_at
  BEFORE UPDATE ON requisiciones
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 5. AUDIT TABLE: REQUISICIONES_HISTORIAL
-- ============================================================

CREATE TABLE requisiciones_historial (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  requisicion_id    UUID NOT NULL REFERENCES requisiciones(id) ON DELETE CASCADE,
  campo_modificado  TEXT NOT NULL,
  valor_anterior    TEXT,
  valor_nuevo       TEXT,
  usuario_id        UUID NOT NULL REFERENCES auth.users(id),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_historial_requisicion ON requisiciones_historial(requisicion_id);

-- ============================================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE presentaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE destinos ENABLE ROW LEVEL SECURITY;
ALTER TABLE estatus ENABLE ROW LEVEL SECURITY;
ALTER TABLE unidades ENABLE ROW LEVEL SECURITY;
ALTER TABLE requisiciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE requisiciones_historial ENABLE ROW LEVEL SECURITY;

-- Helper: get current user's role
CREATE OR REPLACE FUNCTION get_my_role()
RETURNS user_role AS $$
  SELECT rol FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ── PROFILES ────────────────────────────────────────────────
CREATE POLICY "profiles: anyone can view own" ON profiles
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "profiles: admin can view all" ON profiles
  FOR SELECT USING (get_my_role() = 'admin');

CREATE POLICY "profiles: user can update own" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "profiles: admin can manage all" ON profiles
  FOR ALL USING (get_my_role() = 'admin');

-- ── CATALOG TABLES (read: all auth / write: admin only) ─────
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOREACH tbl IN ARRAY ARRAY['proveedores', 'productos', 'presentaciones', 'destinos', 'estatus', 'unidades'] LOOP
    EXECUTE format('
      CREATE POLICY "%s: all authenticated can select" ON %s
        FOR SELECT TO authenticated USING (TRUE);', tbl, tbl);
    EXECUTE format('
      CREATE POLICY "%s: admin full access" ON %s
        FOR ALL TO authenticated USING (get_my_role() = ''admin'')
        WITH CHECK (get_my_role() = ''admin'');', tbl, tbl);
  END LOOP;
END;
$$;

-- ── REQUISICIONES ────────────────────────────────────────────

-- SELECT: all authenticated users can read
CREATE POLICY "requisiciones: all authenticated can select" ON requisiciones
  FOR SELECT TO authenticated USING (TRUE);

-- INSERT: admin and coordinadora
CREATE POLICY "requisiciones: admin and coordinadora can insert" ON requisiciones
  FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('admin', 'coordinadora'));

-- UPDATE: admin and coordinadora
CREATE POLICY "requisiciones: admin and coordinadora can update" ON requisiciones
  FOR UPDATE TO authenticated
  USING (get_my_role() IN ('admin', 'coordinadora'))
  WITH CHECK (get_my_role() IN ('admin', 'coordinadora'));

-- DELETE: admin only
CREATE POLICY "requisiciones: admin can delete" ON requisiciones
  FOR DELETE TO authenticated
  USING (get_my_role() = 'admin');

-- ── HISTORIAL ────────────────────────────────────────────────
CREATE POLICY "historial: admin and coordinadora can select" ON requisiciones_historial
  FOR SELECT TO authenticated
  USING (get_my_role() IN ('admin', 'coordinadora'));

CREATE POLICY "historial: system can insert" ON requisiciones_historial
  FOR INSERT TO authenticated
  WITH CHECK (get_my_role() IN ('admin', 'coordinadora'));

-- ============================================================
-- 7. SEED DATA
-- ============================================================

-- Estatus (with colors matching Ginéz design)
INSERT INTO estatus (nombre, color_hex) VALUES
  ('Pendiente',    '#F59E0B'),
  ('Confirmado',   '#3B82F6'),
  ('En Tránsito',  '#8B5CF6'),
  ('Recibido',     '#10B981'),
  ('Cancelado',    '#EF4444'),
  ('En Revisión',  '#F97316');

-- Unidades
INSERT INTO unidades (nombre, abreviatura) VALUES
  ('Kilogramos',  'kg'),
  ('Litros',      'L'),
  ('Piezas',      'pzs'),
  ('Toneladas',   'ton'),
  ('Cajas',       'caj'),
  ('Sacos',       'sac'),
  ('Tambos',      'tam'),
  ('Gramos',      'g');

-- Destinos (example plant locations)
INSERT INTO destinos (nombre) VALUES
  ('Almacén General'),
  ('Línea de Producción 1'),
  ('Línea de Producción 2'),
  ('Laboratorio de Calidad'),
  ('Almacén Materia Prima'),
  ('Planta Amozoc'),
  ('Planta Apizaco');

-- Presentaciones
INSERT INTO presentaciones (nombre) VALUES
  ('Granel'),
  ('Tambor 200 L'),
  ('Cuñete 20 L'),
  ('Garrafón 19 L'),
  ('Saco 25 kg'),
  ('Bolsa 1 kg'),
  ('Caja 12 pzas'),
  ('Pallet');

-- Sample proveedores
INSERT INTO proveedores (nombre) VALUES
  ('Proveedora Química Nacional'),
  ('Distribuidora del Centro'),
  ('Importadora Técnica'),
  ('Soluciones Industriales SA'),
  ('Comercial de Insumos');

-- Sample productos
INSERT INTO productos (nombre, descripcion) VALUES
  ('Sosa Cáustica',       'Hidróxido de sodio en escamas'),
  ('LABSA',               'Ácido sulfonico lineal de benceno'),
  ('Texapon',             'Lauril éter sulfato de sodio'),
  ('Colorante Azul',      'Colorante para productos de limpieza'),
  ('Fragancia Lavanda',   'Esencia aromática concentrada'),
  ('Cloruro de Sodio',    'Sal industrial para formulaciones'),
  ('Glucamato',           'Tensioactivo suave de origen natural'),
  ('Alcohol Cetílico',    'Alcohol graso para cremas y suavizantes');

-- ============================================================
-- END OF SCHEMA
-- ============================================================
