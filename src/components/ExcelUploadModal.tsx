import React, { useState, useRef } from 'react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  FileDown,
  Users,
  Info,
  Loader2,
  ShieldCheck,
  Lock,
  Key,
} from 'lucide-react';
import { Volunteer } from '../types';
import {
  parseVolunteersFromExcel,
  downloadExcelTemplate,
  ExcelImportResult,
} from '../utils/excelUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  existingVolunteers: Volunteer[];
  onImport: (newVolunteers: Volunteer[], mode: 'append' | 'replace') => void;
}

export const ExcelUploadModal: React.FC<Props> = ({
  isOpen,
  onClose,
  existingVolunteers,
  onImport,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [importResult, setImportResult] = useState<ExcelImportResult | null>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [customPassphrase, setCustomPassphrase] = useState('');
  const [showPassphraseInput, setShowPassphraseInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const processFile = async (file: File, passphraseToUse?: string) => {
    const validExtensions = ['.xlsx', '.xls', '.csv', '.ulepenc', '.enc'];
    const lowerName = file.name.toLowerCase();
    const isValid = validExtensions.some((ext) => lowerName.endsWith(ext));

    if (!isValid) {
      alert(
        'Por favor seleccione un archivo válido de Excel (.xlsx, .xls), CSV (.csv) o Archivo Encriptado ULEP (.ulepenc).'
      );
      return;
    }

    const isEncrypted = lowerName.endsWith('.ulepenc') || lowerName.endsWith('.enc');
    if (isEncrypted && !passphraseToUse && customPassphrase) {
      passphraseToUse = customPassphrase;
    }

    setSelectedFile(file);
    setIsLoading(true);
    try {
      const result = await parseVolunteersFromExcel(
        file,
        existingVolunteers,
        passphraseToUse || (customPassphrase ? customPassphrase : undefined)
      );
      setImportResult(result);
    } catch (err) {
      console.error(err);
      alert('Ocurrió un error al procesar el archivo.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleRetryWithPassphrase = () => {
    if (selectedFile) {
      processFile(selectedFile, customPassphrase);
    }
  };

  const handleConfirm = () => {
    if (!importResult || importResult.volunteers.length === 0) return;
    onImport(importResult.volunteers, importMode);
    handleReset();
    onClose();
  };

  const handleReset = () => {
    setSelectedFile(null);
    setImportResult(null);
    setCustomPassphrase('');
    setShowPassphraseInput(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-sky-100 overflow-hidden my-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-800 via-teal-900 to-blue-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <UploadCloud className="w-5 h-5 text-emerald-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                Carga Masiva de Colaboradores
              </h3>
              <p className="text-xs text-emerald-200">
                Sube tu archivo de Excel (.xlsx, .xls) o CSV con el personal
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Quick template banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-sky-50/80 border border-sky-200/80 rounded-2xl gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 text-white rounded-xl shrink-0">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900">
                  ¿Aún no tienes el formato estructurado?
                </h4>
                <p className="text-xs text-slate-600">
                  Descarga la plantilla oficial con encabezados, columnas de tallas y filas de ejemplo.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={downloadExcelTemplate}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-blue-900 bg-white hover:bg-sky-100/80 border border-sky-300 rounded-xl transition-all shadow-2xs cursor-pointer shrink-0"
            >
              <FileDown className="w-4 h-4 text-blue-700" />
              <span>Descargar Plantilla Excel</span>
            </button>
          </div>

          {!selectedFile ? (
            /* Upload Drop Area */
            <div
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-3xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                dragActive
                  ? 'border-emerald-500 bg-emerald-50/60 scale-[1.01]'
                  : 'border-sky-300 hover:border-blue-500 hover:bg-sky-50/40 bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls, .csv, .ulepenc, .enc"
                onChange={handleFileChange}
                className="hidden"
              />
              <div className="w-16 h-16 mx-auto mb-4 bg-emerald-100/80 text-emerald-800 rounded-2xl flex items-center justify-center shadow-xs">
                <UploadCloud className="w-8 h-8 text-emerald-700" />
              </div>
              <h4 className="text-base font-bold text-slate-900 mb-1">
                Arrastra tu archivo aquí o haz clic para seleccionarlo
              </h4>
              <p className="text-xs text-slate-500 mb-4 max-w-md mx-auto">
                Formatos compatibles: Microsoft Excel (.xlsx, .xls), CSV (.csv) o <strong>Archivos Encriptados ULEP (.ulepenc)</strong> protegidos con AES-256.
              </p>
              <div className="flex flex-wrap items-center justify-center gap-2">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-700/20 transition-all">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Explorar archivos</span>
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-50 text-emerald-900 border border-emerald-300 text-xs font-semibold rounded-xl">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Bóveda Encriptada ULEP (.ulepenc)</span>
                </span>
              </div>
            </div>
          ) : (
            /* Selected File / Parsing Result Preview */
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-2xl gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl text-white ${selectedFile.name.toLowerCase().endsWith('.ulepenc') ? 'bg-emerald-700' : 'bg-blue-600'}`}>
                    {selectedFile.name.toLowerCase().endsWith('.ulepenc') ? (
                      <Lock className="w-5 h-5" />
                    ) : (
                      <FileSpreadsheet className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-900 truncate max-w-xs sm:max-w-md">
                        {selectedFile.name}
                      </p>
                      {selectedFile.name.toLowerCase().endsWith('.ulepenc') && (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-900 text-[10px] font-bold rounded-md flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3 text-emerald-700" />
                          AES-256
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500">
                      {(selectedFile.size / 1024).toFixed(1)} KB
                      {importResult?.originalFilename && importResult.originalFilename !== selectedFile.name && (
                        <span className="ml-2 text-slate-700 font-medium">
                          (Origen: {importResult.originalFilename})
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 self-end sm:self-auto">
                  {selectedFile.name.toLowerCase().endsWith('.ulepenc') && (
                    <button
                      type="button"
                      onClick={() => setShowPassphraseInput(!showPassphraseInput)}
                      className="text-xs font-semibold text-slate-700 hover:text-slate-900 bg-white border border-slate-300 px-3 py-1.5 rounded-xl cursor-pointer flex items-center gap-1.5 transition-all"
                    >
                      <Key className="w-3.5 h-3.5 text-slate-600" />
                      <span>Clave personalizada</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-xs font-semibold text-rose-700 hover:text-rose-900 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-xl cursor-pointer transition-all"
                  >
                    Cambiar archivo
                  </button>
                </div>
              </div>

              {/* Custom passphrase input if file requires it */}
              {showPassphraseInput && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row gap-3 items-center">
                  <div className="flex-1 w-full">
                    <label className="block text-xs font-bold text-emerald-950 mb-1">
                      Contraseña / Clave de Cifrado (opcional si usa la clave predeterminada ULEP):
                    </label>
                    <input
                      type="password"
                      autoComplete="off"
                      value={customPassphrase}
                      onChange={(e) => setCustomPassphrase(e.target.value)}
                      placeholder="Ingrese clave de descifrado..."
                      className="w-full text-xs px-3 py-2 bg-white border border-emerald-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-hidden"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRetryWithPassphrase}
                    className="w-full sm:w-auto px-4 py-2 bg-emerald-700 text-white text-xs font-bold rounded-xl hover:bg-emerald-800 transition-all self-end"
                  >
                    Reintentar Descifrado
                  </button>
                </div>
              )}

              {/* Cryptographic SHA-256 integrity seal badge */}
              {importResult?.sha256 && (
                <div className="flex items-center gap-2 p-3 bg-slate-900 text-emerald-300 rounded-2xl text-xs font-mono">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div className="truncate">
                    <span className="text-slate-400 font-sans font-semibold mr-2">Sello SHA-256 de Integridad:</span>
                    <span className="text-emerald-300">{importResult.sha256}</span>
                  </div>
                </div>
              )}

              {isLoading ? (
                <div className="py-12 flex flex-col items-center justify-center text-slate-600 space-y-2">
                  <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                  <p className="text-sm font-semibold">Procesando y validando filas del Excel...</p>
                </div>
              ) : importResult ? (
                <div className="space-y-4">
                  {/* Results Metric */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl">
                      <span className="text-[11px] font-bold text-emerald-800 uppercase block">
                        Registros Válidos
                      </span>
                      <p className="text-2xl font-extrabold text-emerald-950 flex items-center gap-1.5">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        {importResult.validRows}
                      </p>
                    </div>

                    <div className="p-3.5 bg-sky-50 border border-sky-200 rounded-2xl">
                      <span className="text-[11px] font-bold text-blue-900 uppercase block">
                        Total Filas Leídas
                      </span>
                      <p className="text-2xl font-extrabold text-blue-950 flex items-center gap-1.5">
                        <Users className="w-5 h-5 text-sky-600" />
                        {importResult.totalRows}
                      </p>
                    </div>

                    <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl col-span-2 sm:col-span-1">
                      <span className="text-[11px] font-bold text-amber-900 uppercase block">
                        Observaciones / Omitidos
                      </span>
                      <p className="text-2xl font-extrabold text-amber-950 flex items-center gap-1.5">
                        <AlertTriangle className="w-5 h-5 text-amber-600" />
                        {importResult.errors.length}
                      </p>
                    </div>
                  </div>

                  {/* Any Errors or Warnings */}
                  {importResult.errors.length > 0 && (
                    <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-1 max-h-32 overflow-y-auto">
                      <span className="text-xs font-bold text-amber-900 block">
                        Detalles de filas no importadas:
                      </span>
                      {importResult.errors.map((err, idx) => (
                        <p key={idx} className="text-xs text-amber-800 flex items-center gap-1.5">
                          • {err}
                        </p>
                      ))}
                    </div>
                  )}

                  {/* Preview Table */}
                  {importResult.volunteers.length > 0 && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                          Vista previa de colaboradores a importar (primeros {Math.min(5, importResult.volunteers.length)} de {importResult.volunteers.length}):
                        </h4>
                      </div>

                      <div className="border border-slate-200 rounded-2xl overflow-hidden max-h-56 overflow-y-auto shadow-2xs">
                        <table className="w-full text-left text-xs text-slate-700">
                          <thead className="bg-slate-100 text-slate-900 font-bold sticky top-0">
                            <tr>
                              <th className="py-2.5 px-3">Cód. Cert</th>
                              <th className="py-2.5 px-3">Nombre</th>
                              <th className="py-2.5 px-3">Documento</th>
                              <th className="py-2.5 px-3">Cargo</th>
                              <th className="py-2.5 px-3">Periodo</th>
                              <th className="py-2.5 px-3">Camisa / RH</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {importResult.volunteers.slice(0, 5).map((v, i) => (
                              <tr key={i} className="hover:bg-slate-50/80">
                                <td className="py-2 px-3 font-mono font-bold text-blue-900">
                                  {v.certificateCode}
                                </td>
                                <td className="py-2 px-3 font-semibold text-slate-900">
                                  {v.fullName}
                                </td>
                                <td className="py-2 px-3 font-mono">
                                  {v.documentNumber}
                                </td>
                                <td className="py-2 px-3 truncate max-w-[140px]" title={v.roleTitle}>
                                  {v.roleTitle}
                                </td>
                                <td className="py-2 px-3 text-[11px]">
                                  {v.startDate} → {v.endDate}
                                </td>
                                <td className="py-2 px-3">
                                  <span className="font-semibold text-emerald-800">
                                    {v.shirtSize || 'M'}
                                  </span>{' '}
                                  · <span className="font-semibold">{v.bloodType || 'O+'}</span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {/* Import Mode Selector */}
                  <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-200/80 space-y-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-blue-950 block">
                      ¿Cómo desea aplicar la carga masiva?
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          importMode === 'append'
                            ? 'bg-white border-blue-600 shadow-xs ring-2 ring-blue-500/20'
                            : 'bg-white/70 border-slate-200 hover:bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="importMode"
                          value="append"
                          checked={importMode === 'append'}
                          onChange={() => setImportMode('append')}
                          className="mt-1"
                        />
                        <div>
                          <span className="text-xs font-bold text-slate-900 block">
                            Añadir a los existentes ({existingVolunteers.length} actuales)
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Conserva los colaboradores registrados y suma los nuevos del archivo.
                          </span>
                        </div>
                      </label>

                      <label
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                          importMode === 'replace'
                            ? 'bg-white border-amber-600 shadow-xs ring-2 ring-amber-500/20'
                            : 'bg-white/70 border-slate-200 hover:bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="importMode"
                          value="replace"
                          checked={importMode === 'replace'}
                          onChange={() => setImportMode('replace')}
                          className="mt-1"
                        />
                        <div>
                          <span className="text-xs font-bold text-amber-950 block">
                            Reemplazar lista completa
                          </span>
                          <span className="text-[11px] text-slate-500">
                            Sustituye todos los datos actuales con los registros de este archivo.
                          </span>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          )}

          {/* Quick Notice */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
            <Info className="w-4 h-4 text-sky-600 shrink-0 mt-0.5" />
            <span>
              <strong>Consecutivo automático:</strong> Si una fila no incluye código de certificado, el sistema le asignará el siguiente número correlativo disponible (ej. <em>CERT-ULEP-2024-...</em>) de forma ordenada.
            </span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-t border-slate-200">
          <button
            type="button"
            onClick={() => {
              handleReset();
              onClose();
            }}
            className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-slate-900 bg-white hover:bg-slate-100 rounded-xl border border-slate-300 transition-all cursor-pointer"
          >
            Cancelar
          </button>

          {importResult && importResult.volunteers.length > 0 && (
            <button
              type="button"
              onClick={handleConfirm}
              className="inline-flex items-center gap-2 px-6 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 rounded-xl shadow-md shadow-emerald-700/20 transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>
                Confirmar e Importar {importResult.volunteers.length} Colaborador
                {importResult.volunteers.length > 1 ? 'es' : ''}
              </span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
