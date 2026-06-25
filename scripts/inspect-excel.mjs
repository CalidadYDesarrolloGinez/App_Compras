import xlsx from 'xlsx';
import path from 'path';

const excelFilePath = path.join(process.cwd(), 'Calendario de entregas 2026.xlsx');

function inspect() {
  console.log(`Leyendo archivo: ${excelFilePath}`);
  try {
    const workbook = xlsx.readFile(excelFilePath);
    const sheetName = '2026';
    if (!workbook.SheetNames.includes(sheetName)) {
      console.error(`No se encontró la hoja "${sheetName}". Hojas disponibles:`, workbook.SheetNames);
      return;
    }

    const sheet = workbook.Sheets[sheetName];
    // Convert sheet to a 2D array of values
    const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });
    
    // Find the header row by searching for "PROVEEDOR" or "ESTÁTUS"
    let headerIndex = -1;
    for (let r = 0; r < data.length; r++) {
      const row = data[r];
      if (row.includes('PROVEEDOR') && row.includes('ESTÁTUS')) {
        headerIndex = r;
        break;
      }
    }
    
    if (headerIndex === -1) {
      console.error('No se pudo encontrar la fila de encabezados con "PROVEEDOR" y "ESTÁTUS".');
      return;
    }
    
    console.log(`Encabezados encontrados en la fila índice: ${headerIndex}`);
    const headers = data[headerIndex];
    console.log('Encabezados:', headers);
    
    // Extract rows after the header
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
    
    console.log(`Total de filas procesadas: ${rows.length}`);
    
    // Check status values
    const statusCounts = {};
    rows.forEach(r => {
      const status = String(r['ESTÁTUS'] || '').trim();
      statusCounts[status] = (statusCounts[status] || 0) + 1;
    });
    console.log('\nConteos de ESTÁTUS en la hoja 2026:', statusCounts);
    
    // Filter and show some "Pendiente" rows
    const pendingRows = rows.filter(r => String(r['ESTÁTUS'] || '').toLowerCase().includes('pendiente'));
    console.log(`\nFilas con estatus conteniendo "pendiente": ${pendingRows.length}`);
    if (pendingRows.length > 0) {
      console.log('Ejemplo de las primeras 3 filas con estatus "Pendiente":');
      console.log(JSON.stringify(pendingRows.slice(0, 3), null, 2));
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

inspect();
