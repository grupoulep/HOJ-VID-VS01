import React, { useState, useRef } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  FileCheck2,
  Download,
  UploadCloud,
  CheckCircle2,
  Database,
  HardDrive,
  Copy,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { Volunteer } from '../types';
import {
  encryptBinaryFile,
  decryptBinaryFile,
  triggerFileDownload,
  computeSHA256,
} from '../utils/cryptoUtils';
import { exportEncryptedVolunteersFile } from '../utils/excelUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  volunteers: Volunteer[];
  isFirebaseConnected: boolean;
}

export const SecurityVaultModal: React.FC<Props> = ({
  isOpen,
  onClose,
  volunteers,
  isFirebaseConnected,
}) => {
  const [activeTab, setActiveTab] = useState<'status' | 'encrypt' | 'decrypt'>('status');

  // Encryption tool state
  const [fileToEncrypt, setFileToEncrypt] = useState<File | null>(null);
  const [encryptPassphrase, setEncryptPassphrase] = useState('');
  const [isEncrypting, setIsEncrypting] = useState(false);
  const [encryptionSuccess, setEncryptionSuccess] = useState<{
    filename: string;
    sha256: string;
    size: number;
  } | null>(null);

  // Decryption tool state
  const [fileToDecrypt, setFileToDecrypt] = useState<File | null>(null);
  const [decryptPassphrase, setDecryptPassphrase] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptionError, setDecryptionError] = useState<string | null>(null);
  const [decryptionSuccess, setDecryptionSuccess] = useState<{
    originalFilename: string;
    sha256: string;
  } | null>(null);

  // Backup state
  const [isExportingBackup, setIsExportingBackup] = useState(false);
  const [copiedHash, setCopiedHash] = useState(false);

  const encryptFileInputRef = useRef<HTMLInputElement>(null);
  const decryptFileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  // Handle Encrypting any File
  const handleEncryptFile = async () => {
    if (!fileToEncrypt) return;
    setIsEncrypting(true);
    setEncryptionSuccess(null);

    try {
      const { encryptedBlob, encryptedFilename, sha256 } = await encryptBinaryFile(
        fileToEncrypt,
        fileToEncrypt.name,
        encryptPassphrase.trim() || undefined
      );

      triggerFileDownload(encryptedBlob, encryptedFilename);

      setEncryptionSuccess({
        filename: encryptedFilename,
        sha256,
        size: encryptedBlob.size,
      });
    } catch (err) {
      console.error(err);
      alert('Error al encriptar el archivo.');
    } finally {
      setIsEncrypting(false);
    }
  };

  // Handle Decrypting a .ulepenc File
  const handleDecryptFile = async () => {
    if (!fileToDecrypt) return;
    setIsDecrypting(true);
    setDecryptionError(null);
    setDecryptionSuccess(null);

    try {
      const { decryptedBlob, originalFilename, sha256 } = await decryptBinaryFile(
        fileToDecrypt,
        decryptPassphrase.trim() || undefined
      );

      triggerFileDownload(decryptedBlob, originalFilename);

      setDecryptionSuccess({
        originalFilename,
        sha256,
      });
    } catch (err: unknown) {
      console.error(err);
      const msg =
        err instanceof Error
          ? err.message
          : 'Error al desencriptar. Compruebe la contraseña ingresada.';
      setDecryptionError(msg);
    } finally {
      setIsDecrypting(false);
    }
  };

  // Download Encrypted Database Backup
  const handleDownloadDatabaseBackup = async () => {
    setIsExportingBackup(true);
    try {
      await exportEncryptedVolunteersFile(volunteers);
    } catch (err) {
      console.error(err);
      alert('Error generando copia de seguridad encriptada.');
    } finally {
      setIsExportingBackup(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden my-4">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-slate-900 via-emerald-950 to-teal-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center border border-emerald-400/30 text-emerald-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-bold">
                  Bóveda de Seguridad y Cifrado
                </h3>
                <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold rounded-md border border-emerald-500/30">
                  AES-256-GCM
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Protección criptográfica militar para bases de datos, colaboradores y archivos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 bg-slate-50/70 px-6 pt-3 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('status')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'status'
                ? 'bg-white text-emerald-800 border-t-2 border-emerald-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>Estado de Cifrado Activo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('encrypt')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'encrypt'
                ? 'bg-white text-emerald-800 border-t-2 border-emerald-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>Cifrar Cualquier Archivo</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('decrypt')}
            className={`px-4 py-2.5 text-xs font-bold rounded-t-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'decrypt'
                ? 'bg-white text-emerald-800 border-t-2 border-emerald-600 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Unlock className="w-4 h-4" />
            <span>Desencriptar (.ulepenc)</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* TAB 1: STATUS */}
          {activeTab === 'status' && (
            <div className="space-y-6">
              {/* Security Shield Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl">
                  <div className="flex items-center gap-2 text-emerald-800 mb-1.5">
                    <Database className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Google Firebase</span>
                  </div>
                  <p className="text-sm font-extrabold text-emerald-950">
                    {isFirebaseConnected ? 'Cifrado en la Nube' : 'En espera'}
                  </p>
                  <p className="text-[11px] text-emerald-800 mt-1">
                    Documentos guardados con AES-256-GCM y firma SHA-256.
                  </p>
                </div>

                <div className="p-4 bg-sky-50 border border-sky-200 rounded-2xl">
                  <div className="flex items-center gap-2 text-blue-800 mb-1.5">
                    <HardDrive className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Almacenamiento Local</span>
                  </div>
                  <p className="text-sm font-extrabold text-blue-950">Caché Blindado</p>
                  <p className="text-[11px] text-blue-800 mt-1">
                    Datos en memoria encriptados, nunca en texto plano.
                  </p>
                </div>

                <div className="p-4 bg-teal-50 border border-teal-200 rounded-2xl">
                  <div className="flex items-center gap-2 text-teal-800 mb-1.5">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span className="text-xs font-bold uppercase">Archivos Exportados</span>
                  </div>
                  <p className="text-sm font-extrabold text-teal-950">Formato .ulepenc</p>
                  <p className="text-[11px] text-teal-800 mt-1">
                    Libros Excel y archivos binarios empaquetados y sellados.
                  </p>
                </div>
              </div>

              {/* Technical Specifications */}
              <div className="p-4 bg-slate-900 text-slate-200 rounded-2xl space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400 font-sans font-bold">Parámetros Criptográficos:</span>
                  <span className="text-emerald-400">Estándar FIPS 197</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div>• Algoritmo de Bloque: <strong>AES-256-GCM</strong> (Galois/Counter)</div>
                  <div>• Derivación de Claves: <strong>PBKDF2 (100,000 iteraciones)</strong></div>
                  <div>• Vector de Inicialización: <strong>IV 96-bit (Cripto Seguro)</strong></div>
                  <div>• Integridad / Huella Digital: <strong>SHA-256 (256 bits)</strong></div>
                </div>
              </div>

              {/* Backup Trigger */}
              <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    Descargar Copia de Seguridad Encriptada
                  </h4>
                  <p className="text-xs text-emerald-800 mt-0.5">
                    Descarga los {volunteers.length} registros en una hoja de cálculo encriptada (.ulepenc).
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadDatabaseBackup}
                  disabled={isExportingBackup}
                  className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-2 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExportingBackup ? 'Cifrando...' : 'Descargar Backup (.ulepenc)'}</span>
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: ENCRYPT ANY FILE */}
          {activeTab === 'encrypt' && (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl">
                <p className="text-xs text-emerald-900 font-medium">
                  Cifra cualquier archivo de tu computadora (Excel, PDF de certificados, imágenes de documentos, etc.) con el estándar militar AES-256-GCM. El archivo resultante tendrá extensión <strong>.ulepenc</strong>.
                </p>
              </div>

              {/* File selector */}
              <div
                onClick={() => encryptFileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-emerald-50/30 transition-all"
              >
                <input
                  ref={encryptFileInputRef}
                  type="file"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFileToEncrypt(e.target.files[0]);
                      setEncryptionSuccess(null);
                    }
                  }}
                  className="hidden"
                />
                <UploadCloud className="w-10 h-10 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">
                  {fileToEncrypt ? fileToEncrypt.name : 'Haz clic para seleccionar el archivo a cifrar'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {fileToEncrypt
                    ? `Tamaño: ${(fileToEncrypt.size / 1024).toFixed(1)} KB`
                    : 'Cualquier formato compatible (Excel, PDF, imágenes, contratos, etc.)'}
                </p>
              </div>

              {/* Passphrase optional */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-500" />
                  Contraseña de Cifrado (Opcional - por defecto usa la clave de la Fundación):
                </label>
                <input
                  type="password"
                  autoComplete="off"
                  value={encryptPassphrase}
                  onChange={(e) => setEncryptPassphrase(e.target.value)}
                  placeholder="Dejar en blanco para usar la clave institucional ULEP..."
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                />
              </div>

              <button
                type="button"
                onClick={handleEncryptFile}
                disabled={!fileToEncrypt || isEncrypting}
                className="w-full py-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Lock className="w-4 h-4" />
                <span>{isEncrypting ? 'Encriptando con AES-256...' : 'Encriptar y Descargar Archivo Seguro (.ulepenc)'}</span>
              </button>

              {/* Success badge */}
              {encryptionSuccess && (
                <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold font-sans">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>¡Archivo encriptado con éxito!</span>
                  </div>
                  <p className="text-slate-300">Descargado: {encryptionSuccess.filename}</p>
                  <div className="flex items-center justify-between gap-2 p-2 bg-slate-800 rounded-lg">
                    <span className="truncate text-[11px] text-emerald-300">
                      SHA-256: {encryptionSuccess.sha256}
                    </span>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(encryptionSuccess.sha256)}
                      className="text-slate-400 hover:text-white shrink-0 p-1"
                      title="Copiar Hash"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: DECRYPT A FILE */}
          {activeTab === 'decrypt' && (
            <div className="space-y-4">
              <div className="p-4 bg-sky-50/70 border border-sky-200 rounded-2xl">
                <p className="text-xs text-blue-900 font-medium">
                  Sube un archivo <strong>.ulepenc</strong> para descifrarlo y recuperar el documento original intacto.
                </p>
              </div>

              {/* Decrypt selector */}
              <div
                onClick={() => decryptFileInputRef.current?.click()}
                className="border-2 border-dashed border-sky-300 hover:border-blue-500 rounded-2xl p-6 text-center cursor-pointer bg-slate-50/50 hover:bg-sky-50/30 transition-all"
              >
                <input
                  ref={decryptFileInputRef}
                  type="file"
                  accept=".ulepenc, .enc"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFileToDecrypt(e.target.files[0]);
                      setDecryptionError(null);
                      setDecryptionSuccess(null);
                    }
                  }}
                  className="hidden"
                />
                <Unlock className="w-10 h-10 text-sky-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-800">
                  {fileToDecrypt ? fileToDecrypt.name : 'Haz clic para seleccionar el archivo .ulepenc'}
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  {fileToDecrypt ? `Tamaño: ${(fileToDecrypt.size / 1024).toFixed(1)} KB` : 'Archivos con extensión .ulepenc'}
                </p>
              </div>

              {/* Passphrase optional */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-slate-500" />
                  Contraseña de Descifrado:
                </label>
                <input
                  type="password"
                  autoComplete="off"
                  value={decryptPassphrase}
                  onChange={(e) => setDecryptPassphrase(e.target.value)}
                  placeholder="Dejar en blanco si se utilizó la clave institucional..."
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl focus:ring-2 focus:ring-sky-500 outline-hidden"
                />
              </div>

              <button
                type="button"
                onClick={handleDecryptFile}
                disabled={!fileToDecrypt || isDecrypting}
                className="w-full py-3 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Unlock className="w-4 h-4" />
                <span>{isDecrypting ? 'Descifrando archivo...' : 'Descifrar y Restaurar Archivo Original'}</span>
              </button>

              {/* Error message */}
              {decryptionError && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{decryptionError}</span>
                </div>
              )}

              {/* Success */}
              {decryptionSuccess && (
                <div className="p-4 bg-slate-900 text-slate-100 rounded-2xl space-y-2 text-xs font-mono">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold font-sans">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>¡Archivo descifrado y restaurado con éxito!</span>
                  </div>
                  <p className="text-slate-300">Documento original: {decryptionSuccess.originalFilename}</p>
                  <p className="text-emerald-300 text-[11px]">SHA-256 Verificado: {decryptionSuccess.sha256}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Cifrado de Extremo a Extremo ULEP Cryptographic Engine</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
