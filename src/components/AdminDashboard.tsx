import React, { useState } from 'react';
import { Volunteer } from '../types';
import { VolunteerModal } from './VolunteerModal';
import { ExperienceCertificate } from './ExperienceCertificate';
import { ExcelUploadModal } from './ExcelUploadModal';
import { SecurityVaultModal } from './SecurityVaultModal';
import {
  downloadExcelTemplate,
  exportVolunteersToExcel,
  exportEncryptedVolunteersFile,
} from '../utils/excelUtils';
import {
  saveVolunteerToFirebase,
  deleteVolunteerFromFirebase,
  batchSaveVolunteersToFirebase,
} from '../lib/firebase';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  FileCheck,
  ShieldCheck,
  LogOut,
  Eye,
  User,
  Shirt,
  HeartPulse,
  Phone,
  Mail,
  MapPin,
  Calendar,
  X,
  FileSpreadsheet,
  UploadCloud,
  FileDown,
  CheckCircle2,
  Cloud,
  Lock,
  Database,
} from 'lucide-react';

interface Props {
  volunteers: Volunteer[];
  onUpdateVolunteers: (updated: Volunteer[]) => void;
  onLogout: () => void;
  isFirebaseConnected?: boolean;
}

export const AdminDashboard: React.FC<Props> = ({
  volunteers,
  onUpdateVolunteers,
  onLogout,
  isFirebaseConnected = true,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isVaultModalOpen, setIsVaultModalOpen] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null);
  const [viewingCertVolunteer, setViewingCertVolunteer] = useState<Volunteer | null>(null);
  const [viewingProfileVolunteer, setViewingProfileVolunteer] = useState<Volunteer | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleDownloadEncryptedFile = async () => {
    try {
      const { filename } = await exportEncryptedVolunteersFile(volunteers);
      showToast(`Archivo encriptado con AES-256 generado: ${filename}`);
    } catch (err) {
      console.error(err);
      alert('Error al generar archivo encriptado.');
    }
  };

  const filteredVolunteers = volunteers.filter((vol) => {
    const term = searchTerm.toLowerCase();
    return (
      vol.fullName.toLowerCase().includes(term) ||
      vol.documentNumber.toLowerCase().includes(term) ||
      vol.career.toLowerCase().includes(term) ||
      vol.roleTitle.toLowerCase().includes(term) ||
      (vol.shirtSize && vol.shirtSize.toLowerCase().includes(term)) ||
      (vol.bloodType && vol.bloodType.toLowerCase().includes(term)) ||
      (vol.certificateCode && vol.certificateCode.toLowerCase().includes(term))
    );
  });

  const handleSaveVolunteer = async (volunteer: Volunteer) => {
    const exists = volunteers.some((v) => v.id === volunteer.id);
    if (exists) {
      onUpdateVolunteers(volunteers.map((v) => (v.id === volunteer.id ? volunteer : v)));
    } else {
      onUpdateVolunteers([volunteer, ...volunteers]);
    }

    try {
      await saveVolunteerToFirebase(volunteer);
      showToast(`Colaborador ${volunteer.fullName} guardado y sincronizado con Google Firebase.`);
    } catch (err) {
      console.error('Error al guardar en Firebase:', err);
      showToast('Guardado localmente. Error al sincronizar en la nube.');
    }
  };

  const handleBatchImport = async (importedVolunteers: Volunteer[], mode: 'append' | 'replace') => {
    if (mode === 'replace') {
      onUpdateVolunteers(importedVolunteers);
      try {
        await batchSaveVolunteersToFirebase(importedVolunteers, true);
        showToast(`Se reemplazó la base de datos en Google Firebase con ${importedVolunteers.length} colaboradores.`);
      } catch (err) {
        console.error('Error al guardar masivamente en Firebase:', err);
        showToast(`Se importaron ${importedVolunteers.length} colaboradores localmente.`);
      }
    } else {
      const updated = [...volunteers];
      let addedCount = 0;
      let updatedCount = 0;

      importedVolunteers.forEach((imp) => {
        const existingIndex = updated.findIndex(
          (v) => v.documentNumber.replace(/\D/g, '') === imp.documentNumber.replace(/\D/g, '')
        );
        if (existingIndex >= 0) {
          updated[existingIndex] = { ...updated[existingIndex], ...imp };
          updatedCount++;
        } else {
          updated.push(imp);
          addedCount++;
        }
      });

      onUpdateVolunteers(updated);
      try {
        await batchSaveVolunteersToFirebase(importedVolunteers, false);
        showToast(`Carga masiva en Google Firebase completada: ${addedCount} nuevos colaboradores, ${updatedCount} actualizados.`);
      } catch (err) {
        console.error('Error al guardar masivamente en Firebase:', err);
        showToast(`Carga masiva local: ${addedCount} nuevos, ${updatedCount} actualizados.`);
      }
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`¿Está seguro de eliminar el registro de ${name}?`)) {
      onUpdateVolunteers(volunteers.filter((v) => v.id !== id));
      try {
        await deleteVolunteerFromFirebase(id);
        showToast(`Registro de ${name} eliminado de Google Firebase.`);
      } catch (err) {
        console.error('Error al eliminar en Firebase:', err);
      }
    }
  };

  return (
    <div className="min-h-screen pb-16">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 bg-emerald-900 text-white text-xs sm:text-sm font-semibold rounded-2xl shadow-xl border border-emerald-700 animate-in fade-in slide-in-from-top-4 duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-300 shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="p-1 text-emerald-300 hover:text-white rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Navbar with Glassmorphism */}
      <header className="bg-white/75 backdrop-blur-xl border-b border-sky-200/70 sticky top-0 z-20 shadow-xs shadow-blue-900/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 min-h-24 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
              <img
                src="/LOGO.png"
                alt="Logo"
                className="w-full h-full object-contain border-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="hidden items-center justify-center w-full h-full text-blue-600">
                <ShieldCheck className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 sm:gap-3">
            {/* Google Firebase Live Connection Status */}
            <div
              title={
                isFirebaseConnected
                  ? 'Base de datos en la nube Google Firebase Firestore protegida con cifrado AES-256-GCM y sincronizada'
                  : 'Conectando con Google Firebase...'
              }
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                isFirebaseConnected
                  ? 'bg-emerald-50/90 text-emerald-900 border-emerald-300/80 shadow-2xs'
                  : 'bg-amber-50 text-amber-900 border-amber-300/80'
              }`}
            >
              <Cloud className={`w-4 h-4 ${isFirebaseConnected ? 'text-emerald-600' : 'text-amber-600'}`} />
              <span className="hidden sm:inline">
                {isFirebaseConnected ? 'Google Firebase Cifrado' : 'Conectando Firebase...'}
              </span>
              <span
                className={`w-2 h-2 rounded-full ${
                  isFirebaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500 animate-ping'
                }`}
              />
            </div>

            {/* Bóveda y Cifrado de Archivos */}
            <button
              type="button"
              onClick={() => setIsVaultModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-950 bg-emerald-50 hover:bg-emerald-100/90 border border-emerald-300/90 rounded-xl transition-all cursor-pointer shadow-2xs"
              title="Centro de Cifrado de Archivos y Seguridad de Datos ULEP"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span className="hidden md:inline">Bóveda Criptográfica</span>
              <span className="px-1.5 py-0.2 bg-emerald-200 text-emerald-900 text-[10px] font-mono rounded">
                AES-256
              </span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-blue-900 bg-white/80 hover:bg-sky-50/80 rounded-xl border border-sky-200/80 transition-all cursor-pointer shadow-2xs"
            >
              <LogOut className="w-4 h-4 text-sky-700" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content: Basic Information Directory */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Directory Controls and Crystalline Table */}
        <div className="bg-white/85 backdrop-blur-md rounded-3xl border border-sky-200/70 shadow-md shadow-blue-950/5 overflow-hidden">
          {/* Action Bar with Search and the 3 Excel Management Buttons */}
          <div className="p-5 border-b border-sky-100/90 flex flex-col lg:flex-row gap-3 lg:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-sky-600/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nombre, cédula, carrera o labor..."
                className="w-full pl-10 pr-4 py-2.5 text-sm bg-white/80 border border-sky-200/80 rounded-2xl focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:outline-hidden transition-all placeholder:text-slate-400 text-slate-900"
              />
            </div>

            {/* Excel & Registration Buttons */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Botón 1: Plantilla de Excel */}
              <button
                type="button"
                onClick={downloadExcelTemplate}
                title="Descargar formato oficial de Excel para cargar colaboradores"
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-emerald-50 hover:bg-emerald-100/90 text-emerald-900 border border-emerald-300 text-xs sm:text-sm font-bold rounded-2xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
                <span>Plantilla Excel</span>
              </button>

              {/* Botón 2: Cargar o Subir Archivos Masivamente */}
              <button
                type="button"
                onClick={() => setIsUploadModalOpen(true)}
                title="Cargar o subir masivamente archivos de Excel (.xlsx, .xls) o CSV"
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100/90 text-blue-900 border border-blue-300 text-xs sm:text-sm font-bold rounded-2xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                <UploadCloud className="w-4 h-4 text-blue-700" />
                <span>Cargar Masivamente</span>
              </button>

              {/* Botón 3: Descargar Archivos Subidos (Excel Estándar) */}
              <button
                type="button"
                onClick={() => exportVolunteersToExcel(volunteers)}
                title="Descargar en Excel todos los colaboradores y archivos registrados actualmente (.xlsx)"
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-sky-50 hover:bg-sky-100/90 text-blue-950 border border-sky-300 text-xs sm:text-sm font-bold rounded-2xl shadow-2xs hover:shadow-xs transition-all cursor-pointer"
              >
                <FileDown className="w-4 h-4 text-sky-800" />
                <span>Excel (.xlsx)</span>
              </button>

              {/* Botón 4: Descargar Archivo Seguro Cifrado (.ulepenc) */}
              <button
                type="button"
                onClick={handleDownloadEncryptedFile}
                title="Descargar archivo blindado con cifrado militar AES-256 (.ulepenc)"
                className="inline-flex items-center justify-center gap-2 px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-emerald-800/20 transition-all cursor-pointer"
              >
                <Lock className="w-4 h-4 text-emerald-200" />
                <span>Excel Seguro (.ulepenc)</span>
              </button>

              {/* Botón Adicional: Registrar Individual */}
              <button
                type="button"
                onClick={() => {
                  setEditingVolunteer(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Registrar Voluntario</span>
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-sky-50/50 border-b border-sky-100 text-sky-900 text-xs uppercase tracking-wider font-semibold">
                  <th className="py-3.5 px-5">Colaborador / Certificado</th>
                  <th className="py-3.5 px-4">Documento</th>
                  <th className="py-3.5 px-4">Periodo Certificado</th>
                  <th className="py-3.5 px-4">Tallas / Dotación</th>
                  <th className="py-3.5 px-4">Cargo / Contrato</th>
                  <th className="py-3.5 px-4">Estado</th>
                  <th className="py-3.5 px-5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-sky-100/70 text-slate-700">
                {filteredVolunteers.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-12 text-center text-slate-400 text-sm">
                      No se encontraron colaboradores con el criterio de búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredVolunteers.map((vol) => (
                    <tr key={vol.id} className="hover:bg-blue-50/40 transition-colors">
                      <td className="py-4 px-5 font-medium text-slate-900">
                        <div>
                          <p className="font-bold text-slate-900">{vol.fullName}</p>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-xs text-sky-700 font-mono">Usuario: {vol.username}</span>
                            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200/70 rounded-md font-bold">
                              {vol.certificateCode}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-slate-800">
                        <span className="font-bold">{vol.documentNumber}</span>
                        <p className="text-[11px] font-sans text-slate-500 font-normal">
                          {vol.documentExpeditionCity || vol.city || 'Popayán, Cauca'}
                        </p>
                      </td>
                      <td className="py-4 px-4 text-xs">
                        <div className="space-y-0.5">
                          <p className="text-slate-800 font-medium">
                            <span className="text-slate-500 font-semibold">Desde: </span>
                            {vol.startDate || 'No definida'}
                          </p>
                          <p className="text-slate-900 font-bold">
                            <span className="text-blue-700 font-semibold">Hasta: </span>
                            {vol.endDate?.toLowerCase().includes('actualidad')
                              ? '15 de diciembre de 2024'
                              : vol.endDate || 'No definida'}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5">
                            <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200/80 rounded-md font-bold text-[11px]">
                              Camisa: {vol.shirtSize || 'M'}
                            </span>
                            <span className="px-2 py-0.5 bg-sky-50 text-blue-900 border border-sky-200/80 rounded-md font-bold text-[11px]">
                              RH: {vol.bloodType || 'O+'}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600">
                            Alt: <span className="font-semibold text-slate-800">{vol.height || '1.68 m'}</span> · Calz: <span className="font-semibold text-slate-800">{vol.shoeSize || '38'}</span>
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="max-w-[200px]">
                          <p className="text-xs font-semibold text-slate-900 truncate" title={vol.roleTitle}>
                            {vol.roleTitle}
                          </p>
                          <p className="text-[11px] text-sky-800 truncate" title={vol.contractType}>
                            {vol.contractType || 'Término Indefinido'}
                          </p>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                            vol.status === 'Activo'
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200/70'
                              : 'bg-slate-100 text-slate-600 border border-slate-200/70'
                          }`}
                        >
                          {vol.status}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setViewingProfileVolunteer(vol)}
                            title="Ver Ficha Completa de Datos y Dotación"
                            className="p-2 rounded-xl text-emerald-700 hover:bg-emerald-50 bg-white/80 border border-emerald-200/80 transition-all cursor-pointer shadow-2xs hover:scale-105"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setViewingCertVolunteer(vol)}
                            title="Ver Certificado de Experiencia"
                            className="p-2 rounded-xl text-blue-700 hover:bg-blue-50 bg-white/80 border border-blue-200/80 transition-all cursor-pointer shadow-2xs hover:scale-105"
                          >
                            <FileCheck className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingVolunteer(vol);
                              setIsModalOpen(true);
                            }}
                            title="Editar todos los datos del certificado y dotación"
                            className="p-2 rounded-xl text-slate-600 hover:text-blue-900 hover:bg-sky-50 bg-white/80 border border-sky-200/80 transition-all cursor-pointer shadow-2xs hover:scale-105"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDelete(vol.id, vol.fullName)}
                            title="Eliminar Registro"
                            className="p-2 rounded-xl text-rose-600 hover:bg-rose-50 bg-white/80 border border-rose-200/80 transition-all cursor-pointer shadow-2xs hover:scale-105"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Volunteer Creation/Edit Modal */}
      <VolunteerModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingVolunteer(null);
        }}
        onSave={handleSaveVolunteer}
        initialVolunteer={editingVolunteer}
        existingVolunteers={volunteers}
      />

      {/* Certificate Viewer Modal with Frosted Glass Backdrop */}
      {viewingCertVolunteer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white/95 backdrop-blur-xl rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl p-6 sm:p-8 overflow-y-auto border border-white/80">
            <ExperienceCertificate
              volunteer={viewingCertVolunteer}
              showCloseButton={true}
              onClose={() => setViewingCertVolunteer(null)}
            />
          </div>
        </div>
      )}

      {/* Collaborator Profile & Tallas Modal */}
      {viewingProfileVolunteer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-sky-100 overflow-hidden my-4">
            <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-800 via-teal-900 to-emerald-950 text-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
                  <User className="w-5 h-5 text-emerald-300" />
                </div>
                <div>
                  <h3 className="text-lg font-bold">{viewingProfileVolunteer.fullName}</h3>
                  <p className="text-xs text-emerald-200">
                    Ficha de Datos Personales, Tallas y Dotación Institucional
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewingProfileVolunteer(null)}
                className="p-2 rounded-xl text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              {/* Tallas y Dotación */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-900 mb-3 flex items-center gap-2">
                  <Shirt className="w-4 h-4 text-emerald-700" />
                  <span>Tallas y Dotación Asignada</span>
                </h4>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5 text-center">
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-2.5">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Camisa</span>
                    <p className="text-lg font-extrabold text-emerald-950">{viewingProfileVolunteer.shirtSize || 'M'}</p>
                  </div>
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-2.5">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Pantalón</span>
                    <p className="text-lg font-extrabold text-emerald-950">{viewingProfileVolunteer.pantsSize || '30'}</p>
                  </div>
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-2.5">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Calzado</span>
                    <p className="text-lg font-extrabold text-emerald-950">{viewingProfileVolunteer.shoeSize || '38'}</p>
                  </div>
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-2.5">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Estatura</span>
                    <p className="text-lg font-extrabold text-emerald-950">{viewingProfileVolunteer.height || '1.68 m'}</p>
                  </div>
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-2.5">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">Peso</span>
                    <p className="text-lg font-extrabold text-emerald-950">{viewingProfileVolunteer.weight || '62 kg'}</p>
                  </div>
                  <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-2.5">
                    <span className="text-[10px] uppercase font-bold text-emerald-800 block">RH</span>
                    <p className="text-lg font-extrabold text-emerald-950">{viewingProfileVolunteer.bloodType || 'O+'}</p>
                  </div>
                </div>
              </div>

              {/* Información Personal y Contacto */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-500 block">Identificación Oficial</span>
                  <p className="font-semibold text-slate-900">
                    {viewingProfileVolunteer.documentType || 'Cédula'}: <span className="font-mono">{viewingProfileVolunteer.documentNumber}</span>
                  </p>
                  <p className="text-xs text-slate-600">
                    Expedida en: {viewingProfileVolunteer.documentExpeditionCity || viewingProfileVolunteer.city}
                  </p>
                  <p className="text-xs text-slate-600">
                    Nacimiento: {viewingProfileVolunteer.birthDate || 'No registrado'} ({viewingProfileVolunteer.age} años)
                  </p>
                  {viewingProfileVolunteer.gender && (
                    <p className="text-xs text-slate-600">Género: {viewingProfileVolunteer.gender}</p>
                  )}
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
                  <span className="text-xs font-bold uppercase text-slate-500 block">Salud & Emergencia</span>
                  <p className="font-semibold text-slate-900">
                    EPS: {viewingProfileVolunteer.epsHealth || 'Nueva EPS'}
                  </p>
                  <p className="text-xs text-slate-600">
                    Contacto: {viewingProfileVolunteer.emergencyContactName || 'No registrado'}
                  </p>
                  <p className="text-xs text-slate-600 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-rose-600" />
                    {viewingProfileVolunteer.emergencyContactPhone || 'No registrado'}
                  </p>
                </div>
              </div>

              {/* Cargo y Periodo Laboral */}
              <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-200/80 space-y-2 text-sm">
                <span className="text-xs font-bold uppercase text-blue-900 block">Vinculación Institucional</span>
                <p className="font-bold text-slate-900">{viewingProfileVolunteer.roleTitle}</p>
                <p className="text-xs text-sky-900">{viewingProfileVolunteer.contractType || 'Contrato a Término Indefinido'}</p>
                <p className="text-xs text-slate-700">
                  <span className="font-semibold">Periodo: </span>
                  Desde {viewingProfileVolunteer.startDate} hasta {viewingProfileVolunteer.endDate}
                </p>
                <p className="text-xs text-slate-600">
                  Código de Certificado: <span className="font-mono font-bold text-blue-900">{viewingProfileVolunteer.certificateCode}</span>
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    const toEdit = viewingProfileVolunteer;
                    setViewingProfileVolunteer(null);
                    setEditingVolunteer(toEdit);
                    setIsModalOpen(true);
                  }}
                  className="px-4 py-2 text-xs font-bold text-blue-900 bg-sky-100 hover:bg-sky-200 rounded-xl transition-all cursor-pointer"
                >
                  Editar Información Completa
                </button>
                <button
                  type="button"
                  onClick={() => setViewingProfileVolunteer(null)}
                  className="px-5 py-2 text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-all cursor-pointer"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Excel Upload Modal */}
      <ExcelUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        existingVolunteers={volunteers}
        onImport={handleBatchImport}
      />

      {/* Security and Universal File Vault Modal */}
      <SecurityVaultModal
        isOpen={isVaultModalOpen}
        onClose={() => setIsVaultModalOpen(false)}
        volunteers={volunteers}
        isFirebaseConnected={isFirebaseConnected}
      />
    </div>
  );
};
