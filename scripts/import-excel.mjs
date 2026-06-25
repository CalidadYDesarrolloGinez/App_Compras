import { createClient } from '@supabase/supabase-js';
import xlsx from 'xlsx';
import path from 'path';

// Supabase credentials
const supabaseUrl = 'https://cpgktpubyrdrnodduvoc.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNwZ2t0cHVieXJkcm5vZGR1dm9jIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MTY4NDY1OCwiZXhwIjoyMDg3MjYwNjU4fQ.HNYUWBvgmWn7tNMpqcUO2gQxGBQQMhyAH3DIgLdlODo';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Configure dry run mode (change to false to actually insert data)
const DRY_RUN = process.env.DRY_RUN !== 'false';

// Helper to parse Excel dates (serial numbers) to YYYY-MM-DD
function parseExcelDate(excelDate) {
  if (excelDate === null || excelDate === undefined) return null;
  if (typeof excelDate === 'number') {
    // Excel dates are days since 1900-01-01
    // 25569 is the offset in days between 1900-01-01 and 1970-01-01 (Unix Epoch)
    const date = new Date((excelDate - 25569) * 86400 * 1000);
    // Adjust timezone offset to get local date string
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
    return adjustedDate.toISOString().split('T')[0];
  }
  const cleanStr = String(excelDate).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(cleanStr)) return cleanStr;
  
  const parsedDate = new Date(excelDate);
  if (!isNaN(parsedDate.getTime())) {
    return parsedDate.toISOString().split('T')[0];
  }
  return null;
}

async function run() {
  console.log(`=== INICIANDO IMPORTACIÓN DE EXCEL (${DRY_RUN ? 'MODO DE PRUEBA / DRY-RUN' : 'MODO ESCRITURA'}) ===\n`);

  // 1. Fetch current database catalogs
  console.log('1. Cargando catálogos existentes de la base de datos...');
  const [
    { data: dbProveedores, error: errProv },
    { data: dbProductos, error: errProd },
    { data: dbPresentaciones, error: errPres },
    { data: dbDestinos, error: errDest },
    { data: dbEstatus, error: errEst },
    { data: dbUnidades, error: errUnid },
    { data: dbProfiles, error: errProf }
  ] = await Promise.all([
    supabase.from('proveedores').select('*'),
    supabase.from('productos').select('*'),
    supabase.from('presentaciones').select('*'),
    supabase.from('destinos').select('*'),
    supabase.from('estatus').select('*'),
    supabase.from('unidades').select('*'),
    supabase.from('profiles').select('*')
  ]);

  if (errProv || errProd || errPres || errDest || errEst || errUnid || errProf) {
    console.error('Error al cargar catálogos:', { errProv, errProd, errPres, errDest, errEst, errUnid, errProf });
    return;
  }

  // Find default admin user
  const adminProfile = dbProfiles.find(p => p.rol === 'admin') || dbProfiles[0];
  if (!adminProfile) {
    console.error('No se encontró ningún usuario en la tabla "profiles" para asociar los registros.');
    return;
  }
  console.log(`- Registros asociados al administrador: ${adminProfile.nombre_completo || adminProfile.email} (${adminProfile.id})`);

  // Build maps for quick UUID lookup
  const provMap = new Map(dbProveedores.map(p => [p.nombre.toLowerCase().trim(), p.id]));
  const prodMap = new Map(dbProductos.map(p => [p.nombre.toLowerCase().trim(), p.id]));
  const presMap = new Map(dbPresentaciones.map(p => [p.nombre.toLowerCase().trim(), p.id]));
  const destMap = new Map(dbDestinos.map(p => [p.nombre.toLowerCase().trim(), p.id]));
  const estMap = new Map(dbEstatus.map(e => [e.nombre.toLowerCase().trim(), e.id]));
  
  const unitMap = new Map();
  dbUnidades.forEach(u => {
    unitMap.set(u.abreviatura.toLowerCase().trim(), u.id);
    unitMap.set(u.nombre.toLowerCase().trim(), u.id);
  });

  // Manual unit mapping rules (Excel value -> DB representation)
  const unitMappings = {
    'kgs': 'kg',
    'kg': 'kg',
    'kilogramos': 'kg',
    'pza': 'pzs',
    'pzas': 'pzs',
    'piezas': 'pzs',
    'litros': 'l',
    'lts': 'l',
    'l': 'l',
    'tambos': 'tam',
    'tambo': 'tam',
    'toneladas': 'ton',
    'ton': 'ton',
    'sacos': 'sac',
    'saco': 'sac',
    'cajas': 'caj',
    'caja': 'caj',
    'gramos': 'g',
    'g': 'g'
  };

  // 2. Read Excel Sheet 2026
  console.log('\n2. Leyendo archivo Excel...');
  const excelFilePath = path.join(process.cwd(), 'Calendario de entregas 2026.xlsx');
  let workbook;
  try {
    workbook = xlsx.readFile(excelFilePath);
  } catch (e) {
    console.error(`Error al abrir el archivo Excel en: ${excelFilePath}`, e.message);
    return;
  }

  const sheetName = '2026';
  if (!workbook.SheetNames.includes(sheetName)) {
    console.error(`No se encontró la hoja "${sheetName}". Disponibles:`, workbook.SheetNames);
    return;
  }

  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  // Locate headers
  let headerIndex = -1;
  for (let r = 0; r < data.length; r++) {
    const row = data[r];
    if (row.includes('PROVEEDOR') && row.includes('ESTÁTUS')) {
      headerIndex = r;
      break;
    }
  }

  if (headerIndex === -1) {
    console.error('No se pudo encontrar la fila de encabezados en el Excel.');
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
    // Skip entirely empty rows
    if (Object.values(rowObj).every(v => v === null)) continue;
    rows.push(rowObj);
  }

  // Filter only 'Pendiente' rows
  const pendingRows = rows.filter(r => String(r['ESTÁTUS'] || '').toLowerCase().trim() === 'pendiente');
  console.log(`- Total de filas leídas: ${rows.length}`);
  console.log(`- Filas con estatus "Pendiente": ${pendingRows.length}`);

  if (pendingRows.length === 0) {
    console.log('No hay filas con estatus "Pendiente" para importar.');
    return;
  }

  // 3. Handle missing catalog items
  console.log('\n3. Verificando y creando elementos faltantes en catálogos...');
  
  // Track dynamically created catalog items to avoid duplicated inserts
  const newProveedores = new Set();
  const newProductos = new Set();
  const newPresentaciones = new Set();

  pendingRows.forEach(r => {
    const prov = String(r['PROVEEDOR'] || '').trim();
    const prod = String(r['PRODUCTO'] || '').trim();
    const pres = String(r['PRESENTACIÓN'] || '').trim();

    if (prov && !provMap.has(prov.toLowerCase())) newProveedores.add(prov);
    if (prod && !prodMap.has(prod.toLowerCase())) newProductos.add(prod);
    if (pres && !presMap.has(pres.toLowerCase())) newPresentaciones.add(pres);
  });

  // Create new Proveedores
  if (newProveedores.size > 0) {
    console.log(`- Detectados ${newProveedores.size} proveedores nuevos:`, Array.from(newProveedores));
    if (!DRY_RUN) {
      for (const provName of newProveedores) {
        const { data: newProv, error } = await supabase
          .from('proveedores')
          .insert({ nombre: provName, activo: true })
          .select()
          .single();
        if (error) {
          console.error(`Error creando proveedor "${provName}":`, error.message);
        } else {
          console.log(`  + Creado proveedor: ${provName} (ID: ${newProv.id})`);
          provMap.set(provName.toLowerCase(), newProv.id);
        }
      }
    } else {
      console.log('  [Simulado] Se crearían estos proveedores en la base de datos.');
    }
  }

  // Create new Productos
  if (newProductos.size > 0) {
    console.log(`- Detectados ${newProductos.size} productos nuevos:`, Array.from(newProductos));
    if (!DRY_RUN) {
      for (const prodName of newProductos) {
        const { data: newProd, error } = await supabase
          .from('productos')
          .insert({ nombre: prodName, activo: true, requiere_inspeccion: false })
          .select()
          .single();
        if (error) {
          console.error(`Error creando producto "${prodName}":`, error.message);
        } else {
          console.log(`  + Creado producto: ${prodName} (ID: ${newProd.id})`);
          prodMap.set(prodName.toLowerCase(), newProd.id);
        }
      }
    } else {
      console.log('  [Simulado] Se crearían estos productos en la base de datos.');
    }
  }

  // Create new Presentaciones
  if (newPresentaciones.size > 0) {
    console.log(`- Detectadas ${newPresentaciones.size} presentaciones nuevas:`, Array.from(newPresentaciones));
    if (!DRY_RUN) {
      for (const presName of newPresentaciones) {
        const { data: newPres, error } = await supabase
          .from('presentaciones')
          .insert({ nombre: presName, activo: true })
          .select()
          .single();
        if (error) {
          console.error(`Error creando presentación "${presName}":`, error.message);
        } else {
          console.log(`  + Creado presentación: ${presName} (ID: ${newPres.id})`);
          presMap.set(presName.toLowerCase(), newPres.id);
        }
      }
    } else {
      console.log('  [Simulado] Se crearían estas presentaciones en la base de datos.');
    }
  }

  // 4. Map Requisiciones
  console.log('\n4. Mapeando filas del Excel al esquema de requisiciones...');
  const requisicionesToInsert = [];
  const errors = [];

  for (let i = 0; i < pendingRows.length; i++) {
    const r = pendingRows[i];
    const rowNum = headerIndex + 2 + i; // Excel row index for reference
    
    // Resolve UUIDs
    const provName = String(r['PROVEEDOR'] || '').trim();
    const prodName = String(r['PRODUCTO'] || '').trim();
    const presName = String(r['PRESENTACIÓN'] || '').trim();
    const destName = String(r['DESTINO'] || '').trim();
    const statusName = String(r['ESTÁTUS'] || '').trim();
    const umRaw = String(r['UM'] || '').trim();

    // Map units
    const cleanUm = umRaw.toLowerCase();
    const mappedUmKey = unitMappings[cleanUm] || cleanUm;
    const unitId = unitMap.get(mappedUmKey);

    // Lookups
    const proveedor_id = provMap.get(provName.toLowerCase());
    const producto_id = prodMap.get(prodName.toLowerCase());
    const presentacion_id = presMap.get(presName.toLowerCase());
    const destino_id = destMap.get(destName.toLowerCase());
    const estatus_id = estMap.get(statusName.toLowerCase());

    // Validation checks
    if (!proveedor_id && !DRY_RUN) {
      errors.push(`Fila ${rowNum}: Proveedor "${provName}" no encontrado y no pudo crearse.`);
      continue;
    }
    if (!producto_id && !DRY_RUN) {
      errors.push(`Fila ${rowNum}: Producto "${prodName}" no encontrado y no pudo crearse.`);
      continue;
    }
    if (!presentacion_id && !DRY_RUN) {
      errors.push(`Fila ${rowNum}: Presentación "${presName}" no encontrada y no pudo crearse.`);
      continue;
    }
    if (!destino_id) {
      errors.push(`Fila ${rowNum}: Destino "${destName}" no encontrado en la base de datos.`);
      continue;
    }
    if (!estatus_id) {
      errors.push(`Fila ${rowNum}: Estatus "${statusName}" no encontrado en la base de datos.`);
      continue;
    }
    if (!unitId) {
      errors.push(`Fila ${rowNum}: Unidad de Medida "${umRaw}" no mapea a ninguna en la base de datos.`);
      continue;
    }

    // Parse dates
    const fecha_oc = parseExcelDate(r['FECHA DE OC']);
    const fecha_solicitada_entrega = parseExcelDate(r['FECHA SOLICITADA DE ENTREGA']);
    const fecha_confirmada = parseExcelDate(r['FECHA CONFIRMADA']);
    const fecha_entregado = parseExcelDate(r['FECHA ENTREGADO']);

    // fecha_recepcion is NOT NULL in database. Use confirmada, then solicitada, then OC date, then today.
    const fecha_recepcion = fecha_confirmada || fecha_solicitada_entrega || fecha_oc || new Date().toISOString().split('T')[0];

    const cantidad_solicitada = parseFloat(r['CANTIDAD SOLICITADA']);
    if (isNaN(cantidad_solicitada) || cantidad_solicitada <= 0) {
      errors.push(`Fila ${rowNum}: Cantidad solicitada inválida (${r['CANTIDAD SOLICITADA']}).`);
      continue;
    }

    const cantidad_entregada = r['CANTIDAD ENTREGADA'] !== null && r['CANTIDAD ENTREGADA'] !== undefined ? parseFloat(r['CANTIDAD ENTREGADA']) : null;

    requisicionesToInsert.push({
      fecha_recepcion,
      proveedor_id: proveedor_id || 'dummy-uuid-dryrun',
      producto_id: producto_id || 'dummy-uuid-dryrun',
      presentacion_id: presentacion_id || 'dummy-uuid-dryrun',
      destino_id,
      estatus_id,
      cantidad_solicitada,
      unidad_cantidad_id: unitId,
      numero_oc: r['FOLIO OC'] ? String(r['FOLIO OC']).trim() : null,
      requisicion_numero: r['# REQUI'] ? String(r['# REQUI']).trim() : null,
      fecha_oc,
      fecha_solicitada_entrega,
      fecha_confirmada,
      fecha_entregado,
      cantidad_entregada: isNaN(cantidad_entregada) ? null : cantidad_entregada,
      factura_remision: r['FACTURA/REMISIÓN'] ? String(r['FACTURA/REMISIÓN']).trim() : null,
      comentarios: r['COMENTARIOS'] ? String(r['COMENTARIOS']).trim() : null,
      created_by: adminProfile.id
    });
  }

  if (errors.length > 0) {
    console.log(`\nAdvertencias/Errores encontrados durante el mapeo (${errors.length}):`);
    errors.slice(0, 15).forEach(e => console.log(`  - ${e}`));
    if (errors.length > 15) console.log(`  ... y ${errors.length - 15} errores más.`);
    
    if (!DRY_RUN) {
      console.log('\nAbortando importación debido a errores de mapeo en modo escritura.');
      return;
    }
  }

  console.log(`- Mapeo completado. ${requisicionesToInsert.length} requisiciones listas para insertar.`);

  // 5. Perform Database Inserts
  if (requisicionesToInsert.length > 0) {
    if (!DRY_RUN) {
      console.log(`\n5. Insertando ${requisicionesToInsert.length} requisiciones en la base de datos...`);
      // Chunk insertions in groups of 100 to prevent database payload issues
      const chunkSize = 100;
      let insertedCount = 0;

      for (let i = 0; i < requisicionesToInsert.length; i += chunkSize) {
        const chunk = requisicionesToInsert.slice(i, i + chunkSize);
        const { error } = await supabase.from('requisiciones').insert(chunk);
        
        if (error) {
          console.error(`  X Error al insertar lote del índice ${i} al ${i + chunk.length}:`, error.message);
        } else {
          insertedCount += chunk.length;
          console.log(`  + Insertadas ${insertedCount}/${requisicionesToInsert.length} requisiciones...`);
        }
      }
      console.log('\n=== IMPORTACIÓN FINALIZADA CON ÉXITO ===');
    } else {
      console.log('\n5. [Simulado] Se insertarían las requisiciones.');
      console.log('Ejemplo del primer registro a insertar:');
      console.log(JSON.stringify(requisicionesToInsert[0], null, 2));
      console.log('\n=== DRY-RUN FINALIZADO CON ÉXITO ===');
    }
  }
}

run();
