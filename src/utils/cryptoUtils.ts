/**
 * ULEP Cryptographic Engine
 * Provides military-grade AES-256-GCM encryption & decryption for:
 * - All Volunteer database records stored in Google Firebase Firestore & localStorage
 * - Files (Excel spreadsheets, PDFs, backups, documents)
 * - Cryptographic SHA-256 integrity verification hashes and digital security seals
 */

// Master Organization Secret Key for ULEP Database & Standard Organization Files
export const DEFAULT_VAULT_KEY = 'ULEP_FUNDACION_COLOMBIA_AES256_GCM_SECURE_KEY_2024_#902050377-7';

const ENCRYPTED_PREFIX = 'ULEP_ENC_V1:';
const PBKDF2_ITERATIONS = 100000;

/**
 * Derives an AES-GCM CryptoKey from a passphrase using PBKDF2-SHA256
 */
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    enc.encode(passphrase),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Encrypts an arbitrary string using AES-256-GCM
 */
export async function encryptText(
  plaintext: string,
  passphrase = DEFAULT_VAULT_KEY
): Promise<string> {
  if (!plaintext) return '';
  try {
    const enc = new TextEncoder();
    const data = enc.encode(plaintext);

    // 16 bytes salt, 12 bytes IV for AES-GCM
    const salt = crypto.getRandomValues(new Uint8Array(16));
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const key = await deriveKey(passphrase, salt);
    const encryptedBuffer = await crypto.subtle.encrypt(
      { name: 'AES-GCM', iv },
      key,
      data
    );

    // Combine salt (16 bytes) + iv (12 bytes) + ciphertext
    const combined = new Uint8Array(salt.length + iv.length + encryptedBuffer.byteLength);
    combined.set(salt, 0);
    combined.set(iv, salt.length);
    combined.set(new Uint8Array(encryptedBuffer), salt.length + iv.length);

    // Convert to base64
    let binary = '';
    const bytes = combined;
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    const b64 = btoa(binary);
    return `${ENCRYPTED_PREFIX}${b64}`;
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Fallo en la encriptación de datos.');
  }
}

/**
 * Decrypts an encrypted string produced by encryptText
 */
export async function decryptText(
  ciphertext: string,
  passphrase = DEFAULT_VAULT_KEY
): Promise<string> {
  if (!ciphertext) return '';
  if (!isEncryptedString(ciphertext)) {
    // If not encrypted, return as is (for backwards compatibility)
    return ciphertext;
  }

  try {
    const rawB64 = ciphertext.replace(ENCRYPTED_PREFIX, '');
    const binary = atob(rawB64);
    const combined = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      combined[i] = binary.charCodeAt(i);
    }

    // Extract salt (16 bytes) and iv (12 bytes)
    const salt = combined.slice(0, 16);
    const iv = combined.slice(16, 28);
    const encryptedData = combined.slice(28);

    const key = await deriveKey(passphrase, salt);
    const decryptedBuffer = await crypto.subtle.decrypt(
      { name: 'AES-GCM', iv },
      key,
      encryptedData
    );

    const dec = new TextDecoder();
    return dec.decode(decryptedBuffer);
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Contraseña incorrecta o archivo cifrado alterado.');
  }
}

/**
 * Checks if a string has the ULEP encrypted format
 */
export function isEncryptedString(val: unknown): boolean {
  return typeof val === 'string' && val.startsWith(ENCRYPTED_PREFIX);
}

/**
 * Encrypts a full JSON object
 */
export async function encryptObject<T>(obj: T, passphrase = DEFAULT_VAULT_KEY): Promise<string> {
  const json = JSON.stringify(obj);
  return encryptText(json, passphrase);
}

/**
 * Decrypts an encrypted JSON string into typed object
 */
export async function decryptObject<T>(
  encryptedStr: string,
  passphrase = DEFAULT_VAULT_KEY
): Promise<T> {
  const decryptedJson = await decryptText(encryptedStr, passphrase);
  return JSON.parse(decryptedJson) as T;
}

/**
 * Computes a standard SHA-256 integrity checksum in hexadecimal
 */
export async function computeSHA256(data: string | ArrayBuffer): Promise<string> {
  let buffer: ArrayBuffer;
  if (typeof data === 'string') {
    buffer = new TextEncoder().encode(data);
  } else {
    buffer = data;
  }

  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * File Encryptor: Encrypts any binary File or Blob with metadata (original name, type, date)
 * Returns an encrypted Blob with the extension .ulepenc
 */
export async function encryptBinaryFile(
  file: File | Blob,
  originalFilename: string,
  passphrase = DEFAULT_VAULT_KEY
): Promise<{ encryptedBlob: Blob; encryptedFilename: string; sha256: string }> {
  const arrayBuffer = await file.arrayBuffer();
  const fileHash = await computeSHA256(arrayBuffer);

  // Package the file metadata + binary contents into a structured bundle
  const enc = new TextEncoder();
  const metadata = JSON.stringify({
    name: originalFilename,
    type: file.type || 'application/octet-stream',
    size: file.size,
    sha256: fileHash,
    encryptedAt: new Date().toISOString(),
    organization: 'FUNDACION ULEP - NIT 902050377-7',
  });

  const metadataBytes = enc.encode(metadata);
  const metadataLength = metadataBytes.byteLength;

  // Header format: [4 bytes metadata length] + [metadata bytes] + [file bytes]
  const container = new Uint8Array(4 + metadataLength + arrayBuffer.byteLength);
  const view = new DataView(container.buffer);
  view.setUint32(0, metadataLength, false); // big-endian
  container.set(metadataBytes, 4);
  container.set(new Uint8Array(arrayBuffer), 4 + metadataLength);

  // Derive key and encrypt entire container with AES-256-GCM
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);

  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    container
  );

  // File structure: "ULEPENC1" (8 bytes magic) + salt (16 bytes) + iv (12 bytes) + ciphertext
  const magic = enc.encode('ULEPENC1');
  const finalFileBytes = new Uint8Array(magic.length + salt.length + iv.length + ciphertext.byteLength);
  finalFileBytes.set(magic, 0);
  finalFileBytes.set(salt, magic.length);
  finalFileBytes.set(iv, magic.length + salt.length);
  finalFileBytes.set(new Uint8Array(ciphertext), magic.length + salt.length + iv.length);

  const encryptedBlob = new Blob([finalFileBytes], { type: 'application/octet-stream' });
  const encryptedFilename = `${originalFilename}.ulepenc`;

  return {
    encryptedBlob,
    encryptedFilename,
    sha256: fileHash,
  };
}

/**
 * File Decryptor: Decrypts a .ulepenc file back to its original name and Blob
 */
export async function decryptBinaryFile(
  encryptedFile: File | Blob,
  passphrase = DEFAULT_VAULT_KEY
): Promise<{
  decryptedBlob: Blob;
  originalFilename: string;
  mimeType: string;
  sha256: string;
  metadata: Record<string, unknown>;
}> {
  const arrayBuffer = await encryptedFile.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);

  const magic = new TextDecoder().decode(bytes.slice(0, 8));
  if (magic !== 'ULEPENC1') {
    throw new Error('El archivo no tiene el formato de archivo encriptado válido de ULEP (.ulepenc).');
  }

  const salt = bytes.slice(8, 24);
  const iv = bytes.slice(24, 36);
  const ciphertext = bytes.slice(36);

  const key = await deriveKey(passphrase, salt);
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    ciphertext
  );

  const decryptedBytes = new Uint8Array(decryptedBuffer);
  const view = new DataView(decryptedBytes.buffer);
  const metadataLength = view.getUint32(0, false);

  const metadataBytes = decryptedBytes.slice(4, 4 + metadataLength);
  const fileBytes = decryptedBytes.slice(4 + metadataLength);

  const metadataStr = new TextDecoder().decode(metadataBytes);
  const metadata = JSON.parse(metadataStr);

  const originalFilename = metadata.name || 'archivo_desencriptado';
  const mimeType = metadata.type || 'application/octet-stream';
  const decryptedBlob = new Blob([fileBytes], { type: mimeType });
  const sha256 = metadata.sha256 || (await computeSHA256(fileBytes));

  return {
    decryptedBlob,
    originalFilename,
    mimeType,
    sha256,
    metadata,
  };
}

/**
 * Helper to download an in-memory Blob with a given filename
 */
export function triggerFileDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
