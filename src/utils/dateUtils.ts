const MONTH_NAMES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

/**
 * Converts an ISO date string (YYYY-MM-DD) to full formal Spanish text.
 * Example: "2024-02-15" -> "15 de febrero de 2024"
 */
export function isoToSpanishDate(isoDate: string): string {
  if (!isoDate) return '';
  const parts = isoDate.split('-');
  if (parts.length !== 3) return isoDate;

  const year = parseInt(parts[0], 10);
  const monthIdx = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(monthIdx) || isNaN(day)) return isoDate;
  const monthName = MONTH_NAMES[monthIdx] || '';
  return `${day} de ${monthName} de ${year}`;
}

/**
 * Tries to convert Spanish text ("15 de febrero de 2024") back to ISO date ("2024-02-15")
 * for native HTML5 date picker inputs.
 */
export function spanishDateToIso(spanishText?: string): string {
  if (!spanishText) return '';
  const trimmed = spanishText.trim().toLowerCase().replace(/^el\s+/i, '');
  
  // Format: "15 de febrero de 2024" or "15/02/2024" or "2024-02-15"
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const match = trimmed.match(/^(\d{1,2})\s+de\s+([a-záéíóúñ]+)\s+de\s+(\d{4})$/i);
  if (match) {
    const day = parseInt(match[1], 10);
    const monthName = match[2].toLowerCase();
    const year = parseInt(match[3], 10);

    const monthIdx = MONTH_NAMES.findIndex((m) => m === monthName);
    if (monthIdx !== -1) {
      const mm = String(monthIdx + 1).padStart(2, '0');
      const dd = String(day).padStart(2, '0');
      return `${year}-${mm}-${dd}`;
    }
  }

  // Format: DD/MM/YYYY
  const slashMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const day = String(parseInt(slashMatch[1], 10)).padStart(2, '0');
    const month = String(parseInt(slashMatch[2], 10)).padStart(2, '0');
    const year = slashMatch[3];
    return `${year}-${month}-${day}`;
  }

  return '';
}

/**
 * Parses day, month (in letters) and year for the closing statement of the certificate.
 * E.g. "a los [dia] días del mes de [mes] del año [año]"
 */
export function getFormalDateParts(dateStr?: string): {
  dia: string;
  mes: string;
  ano: string;
} {
  const today = new Date();
  let dayNum = today.getDate();
  let monthName = MONTH_NAMES[today.getMonth()];
  let yearNum = today.getFullYear();

  if (dateStr) {
    const iso = spanishDateToIso(dateStr);
    if (iso) {
      const parts = iso.split('-');
      yearNum = parseInt(parts[0], 10);
      const mIdx = parseInt(parts[1], 10) - 1;
      monthName = MONTH_NAMES[mIdx] || monthName;
      dayNum = parseInt(parts[2], 10);
    }
  }

  return {
    dia: dayNum.toString(),
    mes: monthName,
    ano: yearNum.toString(),
  };
}

/**
 * Normalizes a date range string, ensuring it never says "la actualidad"
 */
export function cleanActualidadDate(date?: string, fallback: string = '15 de noviembre de 2024'): string {
  if (!date || date.toLowerCase().includes('actualidad') || date.toLowerCase().includes('activo')) {
    return fallback;
  }
  return date;
}
