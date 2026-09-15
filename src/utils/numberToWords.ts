/**
 * Helper to convert numbers to Colombian Pesos in uppercase words
 */
export function numberToSpanishWords(numStr: string | number): string {
  if (!numStr) return '';
  
  // Clean string to get numeric value
  const clean = String(numStr).replace(/[^0-9]/g, '');
  if (!clean) return '';
  const num = parseInt(clean, 10);
  if (isNaN(num) || num === 0) return 'CERO PESOS M/CTE';

  const unidades = ['', 'UN', 'DOS', 'TRES', 'CUATRO', 'CINCO', 'SEIS', 'SIETE', 'OCHO', 'NUEVE'];
  const especiales = [
    'DIEZ', 'ONCE', 'DOCE', 'TRECE', 'CATORCE', 'QUINCE',
    'DIECISÉIS', 'DIECISIETE', 'DIECIOCHO', 'DIECINUEVE'
  ];
  const decenas = [
    '', '', 'VEINTE', 'TREINTA', 'CUARENTA', 'CINCUENTA',
    'SESENTA', 'SETENTA', 'OCHENTA', 'NOVENTA'
  ];
  const centenas = [
    '', 'CIENTO', 'DOSCIENTOS', 'TRESCIENTOS', 'CUATROCIENTOS',
    'QUINIENTOS', 'SEISCIENTOS', 'SETECIENTOS', 'OCHOCIENTOS', 'NOVECIENTOS'
  ];

  function getHundreds(n: number): string {
    if (n === 0) return '';
    if (n === 100) return 'CIEN';
    let str = '';
    const c = Math.floor(n / 100);
    const d = Math.floor((n % 100) / 10);
    const u = n % 10;

    if (c > 0) str += centenas[c] + ' ';

    if (d === 1) {
      str += especiales[u] + ' ';
    } else if (d === 2) {
      if (u === 0) str += 'VEINTE ';
      else str += 'VEINTI' + unidades[u].toLowerCase() + ' ';
    } else if (d > 2) {
      str += decenas[d];
      if (u > 0) str += ' Y ' + unidades[u];
      str += ' ';
    } else if (u > 0) {
      str += unidades[u] + ' ';
    }

    return str.trim();
  }

  function convert(n: number): string {
    if (n === 0) return 'CERO';

    const millions = Math.floor(n / 1000000);
    const thousands = Math.floor((n % 1000000) / 1000);
    const remainder = n % 1000;

    let result = '';

    if (millions === 1) {
      result += 'UN MILLÓN ';
    } else if (millions > 1) {
      result += getHundreds(millions) + ' MILLONES ';
    }

    if (thousands === 1) {
      result += 'MIL ';
    } else if (thousands > 1) {
      result += getHundreds(thousands) + ' MIL ';
    }

    if (remainder > 0) {
      result += getHundreds(remainder);
    }

    return result.trim().toUpperCase();
  }

  return `${convert(num)} PESOS M/CTE`;
}

export function formatCurrencyNumber(value: string | number): string {
  if (!value && value !== 0) return '';
  const clean = String(value).replace(/[^0-9]/g, '');
  if (!clean) return '';
  const num = parseInt(clean, 10);
  return num.toLocaleString('es-CO');
}
