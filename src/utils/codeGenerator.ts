import { Volunteer } from '../types';

export const CODE_PREFIX = 'CERT-ULEP';

/**
 * Extracts the numerical sequence index from a validation code string.
 * Example: 'CERT-ULEP-2024-007' -> 7, 'CERT-VOL-2024-003' -> 3
 */
export function extractSequenceNumber(code?: string): number | null {
  if (!code) return null;
  const match = code.trim().match(/(\d+)$/);
  if (match) {
    const num = parseInt(match[1], 10);
    return isNaN(num) ? null : num;
  }
  return null;
}

/**
 * Generates the next sequential code based on existing volunteers.
 * Guaranteed to be unique and strictly sequential (001, 002, 003, ...).
 */
export function generateNextSequentialCode(
  existingVolunteers: Volunteer[],
  year: number = new Date().getFullYear(),
  prefix: string = CODE_PREFIX
): string {
  let highest = 0;
  for (const vol of existingVolunteers) {
    const num = extractSequenceNumber(vol.certificateCode);
    if (num !== null && num > highest) {
      highest = num;
    }
  }

  const nextSeq = highest + 1;
  const padded = String(nextSeq).padStart(3, '0');
  return `${prefix}-${year}-${padded}`;
}

/**
 * Validates and ensures all volunteers have unique, sequential validation codes.
 * If duplicates or legacy irregular codes are detected, re-indexes sequentially.
 */
export function ensureSequentialCodes(volunteers: Volunteer[], year: number = 2024): Volunteer[] {
  if (!volunteers || volunteers.length === 0) return [];

  const seenCodes = new Set<string>();
  let needsReindex = false;

  for (const vol of volunteers) {
    if (!vol.certificateCode || seenCodes.has(vol.certificateCode.trim().toUpperCase())) {
      needsReindex = true;
      break;
    }
    seenCodes.add(vol.certificateCode.trim().toUpperCase());
  }

  // Also check if any are old random format like CERT-EXP-2026-xxx
  for (const vol of volunteers) {
    if (vol.certificateCode && vol.certificateCode.startsWith('CERT-EXP-')) {
      needsReindex = true;
      break;
    }
  }

  if (!needsReindex) {
    return volunteers;
  }

  return volunteers.map((vol, index) => {
    const padded = String(index + 1).padStart(3, '0');
    return {
      ...vol,
      certificateCode: `${CODE_PREFIX}-${year}-${padded}`,
    };
  });
}
