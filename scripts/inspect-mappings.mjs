import { createClient } from '@supabase/supabase-js';
import xlsx from 'xlsx';
import path from 'path';

const supabaseUrl = 'https://cpgktpubyrdrnodduvoc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZ2t0cHVieXJkcm5vZGR1dm9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTY4NDY1OCwiZXhwIjoyMDg3MjYwNjU4fQ.HNYUWBvgmWn7tNMpqcUO2gQxGBQQMhyAH3DIgLdlODo';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function testMappings() {
  console.log('1. Cargando catálogos de Supabase...');
  const [
    { data: dbProveedores },
    { data: dbProductos },
    { data: dbPresentaciones },
    { data: dbDestinos },
    { data: dbEstatus },
    { data: dbUnidades },
    { data: dbProfiles }
  ] = await Promise.all([
    supabase.from('proveedores').select('*'),
    supabase.from('productos').select('*'),
    supabase.from('presentaciones').select('*'),
    supabase.from('destinos').select('*'),
    supabase.from('estatus').select('*'),
    supabase.from('unidades').select('*'),
    supabase.from('profiles').select('*')
  ]);

  console.log(`- Proveedores: ${dbProveedores?.length}`);
  console.log(`- Productos: ${dbProductos?.length}`);
  console.log(`- Presentaciones: ${dbPresentaciones?.length}`);
  console.log(`- Destinos: ${dbDestinos?.length}`);
  console.log(`- Estatus: ${dbEstatus?.length}`);
  console.log(`- Unidades: ${dbUnidades?.length}`);
  console.log(`- Usuarios (profiles): ${dbProfiles?.length}`);
  if (dbProfiles) {
    console.log('Perfiles en DB:', dbProfiles.map(p => ({ email: p.email, rol: p.rol, id: p.id })));
  }

  console.log('\n2. Leyendo archivo Excel...');
  const excelFilePath = path.join(process.cwd(), 'Calendario de entregas 2026.xlsx');
  const workbook = xlsx.readFile(excelFilePath);
  const sheet = workbook.Sheets['2026'];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  let headerIndex = -1;
  for (let r = 0; r < data.length; r++) {
    const row = data[r];
    if (row.includes('PROVEEDOR') && row.includes('ESTÁTUS')) {
      headerIndex = r;
      break;
    }
  }

  if (headerIndex === -1) {
    console.error('No se pudo encontrar la cabecera');
    return;
  }

  const headers = data[headerIndex];
  const rows = [];
  for (let r = headerIndex + 1; r < data.length; r++) {
    const rowData = data[r];
    if (!rowData || rowData.length === 0) continue;
    const rowObj = {};
    headers.forEach((h, colIndex) => {
      rowObj[h] = rowData[colIndex] !== undefined ? rowData[colIndex] : null;
    });
    rows.push(rowObj);
  }

  // Filtrar solo los pendientes
  const pendingRows = rows.filter(r => String(r['ESTÁTUS'] || '').toLowerCase().includes('pendiente'));
  console.log(`\nFilas pendientes a importar: ${pendingRows.length}`);

  // Analizar valores únicos en el Excel para ver si están en la base de datos
  const uniqueExcelProveedores = new Set();
  const uniqueExcelProductos = new Set();
  const uniqueExcelPresentaciones = new Set();
  const uniqueExcelDestinos = new Set();
  const uniqueExcelUnidades = new Set();

  pendingRows.forEach(r => {
    if (r['PROVEEDOR']) uniqueExcelProveedores.add(String(r['PROVEEDOR']).trim());
    if (r['PRODUCTO']) uniqueExcelProductos.add(String(r['PRODUCTO']).trim());
    if (r['PRESENTACIÓN']) uniqueExcelPresentaciones.add(String(r['PRESENTACIÓN']).trim());
    if (r['DESTINO']) uniqueExcelDestinos.add(String(r['DESTINO']).trim());
    if (r['UM']) uniqueExcelUnidades.add(String(r['UM']).trim());
  });

  const missingProveedores = [];
  const missingProductos = [];
  const missingPresentaciones = [];
  const missingDestinos = [];
  const missingUnidades = [];

  // Mapeadores rápidos
  const dbProvNames = new Set(dbProveedores?.map(p => p.nombre.toLowerCase().trim()) || []);
  const dbProdNames = new Set(dbProductos?.map(p => p.nombre.toLowerCase().trim()) || []);
  const dbPresNames = new Set(dbPresentaciones?.map(p => p.nombre.toLowerCase().trim()) || []);
  const dbDestNames = new Set(dbDestinos?.map(p => p.nombre.toLowerCase().trim()) || []);

  uniqueExcelProveedores.forEach(p => {
    if (!dbProvNames.has(p.toLowerCase())) missingProveedores.push(p);
  });

  uniqueExcelProductos.forEach(p => {
    if (!dbProdNames.has(p.toLowerCase())) missingProductos.push(p);
  });

  uniqueExcelPresentaciones.forEach(p => {
    if (!dbPresNames.has(p.toLowerCase())) missingPresentaciones.push(p);
  });

  uniqueExcelDestinos.forEach(d => {
    if (!dbDestNames.has(d.toLowerCase())) missingDestinos.push(d);
  });

  // Para unidades de medida (UM)
  const dbUniNames = {};
  dbUnidades?.forEach(u => {
    dbUniNames[u.abreviatura.toLowerCase().trim()] = u.id;
    dbUniNames[u.nombre.toLowerCase().trim()] = u.id;
  });

  // Mapeos manuales comunes
  const unitMappings = {
    'kgs': 'kg',
    'kg': 'kg',
    'pza': 'pzs',
    'pzas': 'pzs',
    'litros': 'L',
    'l': 'L',
    'tambos': 'tam',
    'tambo': 'tam',
    'toneladas': 'ton',
    'ton': 'ton',
    'sacos': 'sac',
    'saco': 'sac',
    'cajas': 'caj',
    'caja': 'caj'
  };

  uniqueExcelUnidades.forEach(um => {
    const cleanUm = um.toLowerCase().trim();
    const mapped = unitMappings[cleanUm] || cleanUm;
    if (!dbUniNames[mapped]) {
      missingUnidades.push(um);
    }
  });

  console.log('\n--- DIAGNÓSTICO DE MAPEO ---');
  console.log(`\n* PROVEEDORES faltantes en base de datos (${missingProveedores.length}):`);
  console.log(missingProveedores.slice(0, 10));
  if (missingProveedores.length > 10) console.log('... y más');

  console.log(`\n* PRODUCTOS faltantes en base de datos (${missingProductos.length}):`);
  console.log(missingProductos.slice(0, 10));
  if (missingProductos.length > 10) console.log('... y más');

  console.log(`\n* PRESENTACIONES faltantes en base de datos (${missingPresentaciones.length}):`);
  console.log(missingPresentaciones.slice(0, 10));
  if (missingPresentaciones.length > 10) console.log('... y más');

  console.log(`\n* DESTINOS faltantes en base de datos (${missingDestinos.length}):`);
  console.log(missingDestinos);

  console.log(`\n* UNIDADES DE MEDIDA (UM) faltantes en base de datos (${missingUnidades.length}):`);
  console.log(missingUnidades);
}

testMappings();
