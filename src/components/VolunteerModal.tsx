import React, { useState, useEffect } from 'react';
import { Volunteer } from '../types';
import {
  X,
  Hash,
  RotateCcw,
  Calendar,
  UserCheck,
  Briefcase,
  FileSignature,
  ShieldCheck,
  AlertCircle,
  Shirt,
  HeartPulse,
  PhoneCall,
  Activity,
} from 'lucide-react';
import { generateNextSequentialCode } from '../utils/codeGenerator';
import { isoToSpanishDate, spanishDateToIso } from '../utils/dateUtils';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (volunteer: Volunteer) => void;
  initialVolunteer?: Volunteer | null;
  existingVolunteers?: Volunteer[];
}

export const VolunteerModal: React.FC<Props> = ({
  isOpen,
  onClose,
  onSave,
  initialVolunteer,
  existingVolunteers = [],
}) => {
  const [formData, setFormData] = useState<Partial<Volunteer>>({
    fullName: '',
    documentType: 'Cédula de Ciudadanía',
    documentNumber: '',
    documentExpeditionCity: 'Popayán, Cauca',
    age: 22,
    career: '',
    email: '',
    phone: '',
    city: 'Popayán, Cauca',
    startDate: '15 de enero de 2024',
    endDate: '15 de diciembre de 2024',
    roleTitle: '',
    hoursCompleted: 0,
    duties: '',
    contractType: 'Contrato a Término Indefinido',
    issueCity: 'Popayán, Cauca',
    issueDate: '',
    certificateCode: '',
    status: 'Activo',
    username: '',
    password: '123',
    signatoryName: 'JERSON STIVE LOPEZ RENGIFO',
    signatoryRole: 'Gerente y Representante Legal',
    signatoryDocument: 'C.C. 1.059.357.889 de Popayán (Cauca)',
    signatoryEntity: 'FUNDACIÓN ULEP',
    // New Physical & Size Data
    shirtSize: 'M',
    pantsSize: '30',
    shoeSize: '38',
    height: '1.68 m',
    weight: '62 kg',
    bloodType: 'O+',
    epsHealth: 'Nueva EPS',
    emergencyContactName: '',
    emergencyContactPhone: '',
    birthDate: '',
    gender: 'Femenino',
  });

  const [dateError, setDateError] = useState<string | null>(null);

  useEffect(() => {
    if (initialVolunteer) {
      const safeEndDate =
        !initialVolunteer.endDate || initialVolunteer.endDate.toLowerCase().includes('actualidad')
          ? '15 de diciembre de 2024'
          : initialVolunteer.endDate;

      setFormData({
        ...initialVolunteer,
        endDate: safeEndDate,
        signatoryName: initialVolunteer.signatoryName || 'JERSON STIVE LOPEZ RENGIFO',
        signatoryRole: initialVolunteer.signatoryRole || 'Gerente y Representante Legal',
        signatoryDocument: initialVolunteer.signatoryDocument || 'C.C. 1.059.357.889 de Popayán (Cauca)',
        signatoryEntity: initialVolunteer.signatoryEntity || 'FUNDACIÓN ULEP',
        shirtSize: initialVolunteer.shirtSize || 'M',
        pantsSize: initialVolunteer.pantsSize || '30',
        shoeSize: initialVolunteer.shoeSize || '38',
        height: initialVolunteer.height || '1.68 m',
        weight: initialVolunteer.weight || '62 kg',
        bloodType: initialVolunteer.bloodType || 'O+',
        epsHealth: initialVolunteer.epsHealth || 'Nueva EPS',
        emergencyContactName: initialVolunteer.emergencyContactName || '',
        emergencyContactPhone: initialVolunteer.emergencyContactPhone || '',
        birthDate: initialVolunteer.birthDate || '',
        gender: initialVolunteer.gender || 'Femenino',
      });
    } else {
      const nextCode = generateNextSequentialCode(existingVolunteers);
      setFormData({
        fullName: '',
        documentType: 'Cédula de Ciudadanía',
        documentNumber: '',
        documentExpeditionCity: 'Popayán, Cauca',
        age: 22,
        career: '',
        email: '',
        phone: '',
        city: 'Popayán, Cauca',
        startDate: '15 de enero de 2024',
        endDate: '15 de diciembre de 2024',
        roleTitle: 'Asesor(a) de Proyectos y Operaciones',
        hoursCompleted: 0,
        duties: 'Coordinación y ejecución de actividades operativas, gestión documental y atención a usuarios.',
        contractType: 'Contrato a Término Indefinido',
        issueCity: 'Popayán, Cauca',
        issueDate: '',
        certificateCode: nextCode,
        status: 'Activo',
        username: '',
        password: '123',
        signatoryName: 'JERSON STIVE LOPEZ RENGIFO',
        signatoryRole: 'Gerente y Representante Legal',
        signatoryDocument: 'C.C. 1.059.357.889 de Popayán (Cauca)',
        signatoryEntity: 'FUNDACIÓN ULEP',
        shirtSize: 'M',
        pantsSize: '30',
        shoeSize: '38',
        height: '1.68 m',
        weight: '62 kg',
        bloodType: 'O+',
        epsHealth: 'Nueva EPS',
        emergencyContactName: '',
        emergencyContactPhone: '',
        birthDate: '',
        gender: 'Femenino',
      });
    }
    setDateError(null);
  }, [initialVolunteer, isOpen, existingVolunteers]);

  if (!isOpen) return null;

  const handleRegenerateCode = () => {
    const nextCode = generateNextSequentialCode(existingVolunteers);
    setFormData((prev) => ({ ...prev, certificateCode: nextCode }));
  };

  const handleStartDatePicker = (iso: string) => {
    if (!iso) return;
    const spanish = isoToSpanishDate(iso);
    setFormData((prev) => ({ ...prev, startDate: spanish }));
  };

  const handleEndDatePicker = (iso: string) => {
    if (!iso) return;
    const spanish = isoToSpanishDate(iso);
    setDateError(null);
    setFormData((prev) => ({ ...prev, endDate: spanish }));
  };

  const handleIssueDatePicker = (iso: string) => {
    if (!iso) return;
    const spanish = isoToSpanishDate(iso);
    setFormData((prev) => ({ ...prev, issueDate: spanish }));
  };

  const handleBirthDatePicker = (iso: string) => {
    if (!iso) return;
    const spanish = isoToSpanishDate(iso);
    setFormData((prev) => ({ ...prev, birthDate: spanish }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDateError(null);

    if (!formData.fullName?.trim() || !formData.documentNumber?.trim() || !formData.roleTitle?.trim()) {
      alert('Por favor complete los campos obligatorios: Nombre, Documento y Cargo.');
      return;
    }

    if (!formData.startDate?.trim()) {
      setDateError('Debe ingresar una Fecha de Inicio (Desde).');
      return;
    }

    const trimmedEndDate = formData.endDate?.trim() || '';
    if (!trimmedEndDate || trimmedEndDate.toLowerCase().includes('actualidad')) {
      setDateError('Debe indicar una fecha específica de culminación (Hasta). No se permite dejar "hasta la actualidad".');
      return;
    }

    const uniqueId = initialVolunteer ? initialVolunteer.id : `vol-${Date.now()}`;
    const certCode = formData.certificateCode?.trim()
      ? formData.certificateCode.trim().toUpperCase()
      : initialVolunteer
        ? initialVolunteer.certificateCode
        : generateNextSequentialCode(existingVolunteers);

    const generatedUsername = formData.username?.trim()
      ? formData.username.trim()
      : formData.fullName
          .toLowerCase()
          .replace(/[^a-z0-9]/g, '.')
          .replace(/\.+/g, '.')
          .slice(0, 15);

    const savedVolunteer: Volunteer = {
      id: uniqueId,
      username: generatedUsername,
      password: formData.password || '123',
      fullName: formData.fullName.trim(),
      documentType: formData.documentType || 'Cédula de Ciudadanía',
      documentNumber: formData.documentNumber.trim(),
      documentExpeditionCity: formData.documentExpeditionCity?.trim() || 'Popayán, Cauca',
      age: Number(formData.age) || 20,
      career: formData.career?.trim() || '',
      email: formData.email?.trim() || `${generatedUsername}@fundacionulep.org`,
      phone: formData.phone?.trim() || '',
      city: formData.city?.trim() || 'Popayán, Cauca',
      startDate: formData.startDate.trim(),
      endDate: trimmedEndDate,
      roleTitle: formData.roleTitle.trim(),
      hoursCompleted: Number(formData.hoursCompleted) || 0,
      duties: formData.duties?.trim() || 'Planificación, coordinación de actividades y apoyo operativo integral.',
      contractType: formData.contractType?.trim() || 'Contrato a Término Indefinido',
      issueCity: formData.issueCity?.trim() || formData.city?.trim() || 'Popayán, Cauca',
      issueDate: formData.issueDate?.trim() || undefined,
      certificateCode: certCode,
      status: formData.status === 'Finalizado' ? 'Finalizado' : 'Activo',
      signatoryName: formData.signatoryName?.trim() || 'JERSON STIVE LOPEZ RENGIFO',
      signatoryRole: formData.signatoryRole?.trim() || 'Gerente y Representante Legal',
      signatoryDocument: formData.signatoryDocument?.trim() || 'C.C. 1.059.357.889 de Popayán (Cauca)',
      signatoryEntity: formData.signatoryEntity?.trim() || 'FUNDACIÓN ULEP',
      // Physical, size & medical fields
      shirtSize: formData.shirtSize?.trim() || 'M',
      pantsSize: formData.pantsSize?.trim() || '30',
      shoeSize: formData.shoeSize?.trim() || '38',
      height: formData.height?.trim() || '1.68 m',
      weight: formData.weight?.trim() || '62 kg',
      bloodType: formData.bloodType?.trim() || 'O+',
      epsHealth: formData.epsHealth?.trim() || 'Nueva EPS',
      emergencyContactName: formData.emergencyContactName?.trim() || '',
      emergencyContactPhone: formData.emergencyContactPhone?.trim() || '',
      birthDate: formData.birthDate?.trim() || '',
      gender: formData.gender?.trim() || 'Femenino',
    };

    onSave(savedVolunteer);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-sky-100 my-4 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-blue-900 via-sky-900 to-blue-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
              <FileSignature className="w-5 h-5 text-sky-300" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold">
                {initialVolunteer ? 'Editar Información del Colaborador' : 'Registrar Nuevo Colaborador'}
              </h3>
              <p className="text-xs text-sky-200">
                Datos personales, tallas, dotación y configuración del certificado
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-sky-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-6 text-slate-800">
          {/* Validation Notice if any */}
          {dateError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-rose-800 text-xs font-semibold">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{dateError}</span>
            </div>
          )}

          {/* Section 1: Identificación del Colaborador */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900 pb-1.5 border-b border-sky-100">
              <UserCheck className="w-4 h-4 text-blue-700" />
              <span>1. Identificación y Datos Personales</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Nombre Completo del Empleado *
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName || ''}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-sky-200 rounded-xl focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:outline-hidden font-semibold text-slate-900 placeholder:text-slate-400 transition-all"
                  placeholder="Ej. Camila Andrea Rodríguez Parra"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Tipo de Documento *
                </label>
                <select
                  value={formData.documentType || 'Cédula de Ciudadanía'}
                  onChange={(e) => setFormData({ ...formData, documentType: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-sky-200 rounded-xl focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:outline-hidden text-slate-900 transition-all"
                >
                  <option value="Cédula de Ciudadanía">Cédula de Ciudadanía</option>
                  <option value="Cédula de Extranjería">Cédula de Extranjería</option>
                  <option value="Tarjeta de Identidad">Tarjeta de Identidad</option>
                  <option value="Pasaporte">Pasaporte</option>
                  <option value="Permiso por Protección Temporal (PPT)">Permiso por Protección Temporal (PPT)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Número de Documento *
                </label>
                <input
                  type="text"
                  required
                  value={formData.documentNumber || ''}
                  onChange={(e) => setFormData({ ...formData, documentNumber: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-sky-200 rounded-xl focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:outline-hidden font-mono font-semibold text-slate-900 placeholder:text-slate-400 transition-all"
                  placeholder="Ej. 1.020.849.201"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Ciudad de Expedición del Documento *
                </label>
                <input
                  type="text"
                  required
                  value={formData.documentExpeditionCity || ''}
                  onChange={(e) => setFormData({ ...formData, documentExpeditionCity: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-sky-200 rounded-xl focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:outline-hidden text-slate-900 placeholder:text-slate-400 transition-all"
                  placeholder="Ej. Popayán, Cauca"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Carrera / Formación Académica
                </label>
                <input
                  type="text"
                  value={formData.career || ''}
                  onChange={(e) => setFormData({ ...formData, career: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-sky-200 rounded-xl focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:outline-hidden text-slate-900 placeholder:text-slate-400 transition-all"
                  placeholder="Ej. Licenciatura en Pedagogía Infantil"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Edad
                </label>
                <input
                  type="number"
                  min="16"
                  max="99"
                  value={formData.age || ''}
                  onChange={(e) => setFormData({ ...formData, age: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-sky-200 rounded-xl focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:outline-hidden text-slate-900 transition-all"
                  placeholder="Ej. 23"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Género
                </label>
                <select
                  value={formData.gender || 'Femenino'}
                  onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-sky-200 rounded-xl focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:outline-hidden text-slate-900 transition-all"
                >
                  <option value="Femenino">Femenino</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Otro">Otro / No especifica</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Fecha de Nacimiento
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={formData.birthDate || ''}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    className="w-full pr-10 pl-3.5 py-2.5 text-sm bg-white border border-sky-200 rounded-xl focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:outline-hidden text-slate-900 placeholder:text-slate-400 transition-all"
                    placeholder="Ej. 12 de marzo de 2001"
                  />
                  <div className="absolute right-2.5 flex items-center">
                    <input
                      type="date"
                      title="Seleccionar fecha"
                      value={spanishDateToIso(formData.birthDate)}
                      onChange={(e) => handleBirthDatePicker(e.target.value)}
                      className="w-6 h-6 opacity-0 absolute inset-0 cursor-pointer z-10"
                    />
                    <Calendar className="w-4 h-4 text-sky-600 pointer-events-none" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Teléfono de Contacto
                </label>
                <input
                  type="text"
                  value={formData.phone || ''}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-sky-200 rounded-xl focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:outline-hidden text-slate-900 placeholder:text-slate-400 transition-all"
                  placeholder="Ej. +57 312 456 7890"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Ficha de Tallas, Altura y Dotación */}
          <div className="space-y-3 p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/80">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-950 pb-1.5 border-b border-emerald-200">
              <Shirt className="w-4 h-4 text-emerald-700" />
              <span>2. Ficha de Tallas, Medidas y Dotación</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Talla de Camisa *
                </label>
                <select
                  value={formData.shirtSize || 'M'}
                  onChange={(e) => setFormData({ ...formData, shirtSize: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-emerald-300 rounded-xl focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 focus:outline-hidden text-slate-900 font-semibold transition-all"
                >
                  <option value="XS">XS (Extra Pequeña)</option>
                  <option value="S">S (Pequeña)</option>
                  <option value="M">M (Mediana)</option>
                  <option value="L">L (Grande)</option>
                  <option value="XL">XL (Extra Grande)</option>
                  <option value="XXL">XXL (Doble Extra Grande)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Talla de Pantalón
                </label>
                <input
                  type="text"
                  value={formData.pantsSize || ''}
                  onChange={(e) => setFormData({ ...formData, pantsSize: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-emerald-300 rounded-xl focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 focus:outline-hidden text-slate-900 font-semibold transition-all"
                  placeholder="Ej. 30 o 8 (28)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Talla de Calzado
                </label>
                <input
                  type="text"
                  value={formData.shoeSize || ''}
                  onChange={(e) => setFormData({ ...formData, shoeSize: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-emerald-300 rounded-xl focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 focus:outline-hidden text-slate-900 font-semibold transition-all"
                  placeholder="Ej. 37, 38, 40..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Estatura / Altura *
                </label>
                <input
                  type="text"
                  value={formData.height || ''}
                  onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-emerald-300 rounded-xl focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 focus:outline-hidden text-slate-900 font-semibold transition-all"
                  placeholder="Ej. 1.68 m"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Peso Aproximado
                </label>
                <input
                  type="text"
                  value={formData.weight || ''}
                  onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-emerald-300 rounded-xl focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 focus:outline-hidden text-slate-900 font-semibold transition-all"
                  placeholder="Ej. 62 kg"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Grupo Sanguíneo y RH
                </label>
                <select
                  value={formData.bloodType || 'O+'}
                  onChange={(e) => setFormData({ ...formData, bloodType: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-emerald-300 rounded-xl focus:ring-4 focus:ring-emerald-500/15 focus:border-emerald-500 focus:outline-hidden text-slate-900 font-bold transition-all"
                >
                  <option value="O+">O Positivo (O+)</option>
                  <option value="O-">O Negativo (O-)</option>
                  <option value="A+">A Positivo (A+)</option>
                  <option value="A-">A Negativo (A-)</option>
                  <option value="B+">B Positivo (B+)</option>
                  <option value="B-">B Negativo (B-)</option>
                  <option value="AB+">AB Positivo (AB+)</option>
                  <option value="AB-">AB Negativo (AB-)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Salud y Contacto de Emergencia */}
          <div className="space-y-3 p-4 bg-rose-50/40 rounded-2xl border border-rose-200/80">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-950 pb-1.5 border-b border-rose-200">
              <HeartPulse className="w-4 h-4 text-rose-700" />
              <span>3. Salud y Contacto en Caso de Emergencia</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  EPS / Sistema de Salud
                </label>
                <input
                  type="text"
                  value={formData.epsHealth || ''}
                  onChange={(e) => setFormData({ ...formData, epsHealth: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-rose-200 rounded-xl focus:ring-4 focus:ring-rose-500/15 focus:border-rose-500 focus:outline-hidden text-slate-900 transition-all"
                  placeholder="Ej. Nueva EPS / Sanitas / Sura"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Contacto de Emergencia
                </label>
                <input
                  type="text"
                  value={formData.emergencyContactName || ''}
                  onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-rose-200 rounded-xl focus:ring-4 focus:ring-rose-500/15 focus:border-rose-500 focus:outline-hidden text-slate-900 transition-all"
                  placeholder="Ej. María Parra (Madre)"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Teléfono de Emergencia
                </label>
                <input
                  type="text"
                  value={formData.emergencyContactPhone || ''}
                  onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-rose-200 rounded-xl focus:ring-4 focus:ring-rose-500/15 focus:border-rose-500 focus:outline-hidden text-slate-900 transition-all"
                  placeholder="Ej. +57 311 890 1234"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Periodo de Servicios Certificado (Desde y Hasta - Fechas Concretas) */}
          <div className="space-y-3 p-4 bg-sky-50/60 rounded-2xl border border-sky-200/80">
            <div className="flex items-center justify-between pb-1 border-b border-sky-200">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-950">
                <Calendar className="w-4 h-4 text-blue-700" />
                <span>4. Periodo Laboral Certificado: Desde (Fecha) hasta (Fecha)</span>
              </div>
              <span className="text-[11px] font-semibold text-blue-800 bg-white px-2 py-0.5 rounded-md border border-blue-200">
                Sin "la actualidad"
              </span>
            </div>

            <p className="text-xs text-slate-600">
              Indique el rango de fechas exacto. En el certificado se plasmará: <em>"desde el [Fecha de Inicio] hasta el [Fecha de Finalización]"</em>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Fecha Inicio */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Desde (Fecha de Inicio) *
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={formData.startDate || ''}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full pr-10 pl-3.5 py-2.5 text-sm bg-white border border-sky-200 rounded-xl focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:outline-hidden font-medium text-slate-900 placeholder:text-slate-400 transition-all"
                    placeholder="Ej. 15 de febrero de 2024"
                  />
                  <div className="absolute right-2.5 flex items-center">
                    <input
                      type="date"
                      title="Seleccionar fecha en calendario"
                      value={spanishDateToIso(formData.startDate)}
                      onChange={(e) => handleStartDatePicker(e.target.value)}
                      className="w-6 h-6 opacity-0 absolute inset-0 cursor-pointer z-10"
                    />
                    <Calendar className="w-4 h-4 text-sky-600 pointer-events-none" />
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Escriba en texto o pulse el calendario
                </span>
              </div>

              {/* Fecha Fin */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Hasta (Fecha de Finalización) *
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    required
                    value={formData.endDate || ''}
                    onChange={(e) => {
                      setDateError(null);
                      setFormData({ ...formData, endDate: e.target.value });
                    }}
                    className="w-full pr-10 pl-3.5 py-2.5 text-sm bg-white border border-sky-200 rounded-xl focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:outline-hidden font-medium text-slate-900 placeholder:text-slate-400 transition-all"
                    placeholder="Ej. 15 de diciembre de 2024"
                  />
                  <div className="absolute right-2.5 flex items-center">
                    <input
                      type="date"
                      title="Seleccionar fecha en calendario"
                      value={spanishDateToIso(formData.endDate)}
                      onChange={(e) => handleEndDatePicker(e.target.value)}
                      className="w-6 h-6 opacity-0 absolute inset-0 cursor-pointer z-10"
                    />
                    <Calendar className="w-4 h-4 text-sky-600 pointer-events-none" />
                  </div>
                </div>
                <span className="text-[11px] text-amber-800 font-medium mt-1 block">
                  Fecha concreta obligatoria (no ingresar "la actualidad")
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Horas Totales Concluidas
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.hoursCompleted ?? 0}
                  onChange={(e) => setFormData({ ...formData, hoursCompleted: Number(e.target.value) })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-sky-200 rounded-xl focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:outline-hidden text-slate-900 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Estado de la Vinculación *
                </label>
                <select
                  value={formData.status || 'Activo'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as 'Activo' | 'Finalizado' })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-sky-200 rounded-xl focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:outline-hidden text-slate-900 transition-all font-medium"
                >
                  <option value="Activo">Activo (Periodo vigente)</option>
                  <option value="Finalizado">Finalizado (Periodo culminado)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 5: Cargo, Contrato y Funciones */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900 pb-1.5 border-b border-sky-100">
              <Briefcase className="w-4 h-4 text-blue-700" />
              <span>5. Cargo, Tipo de Contrato y Funciones</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Cargo Desempeñado *
                </label>
                <input
                  type="text"
                  required
                  value={formData.roleTitle || ''}
                  onChange={(e) => setFormData({ ...formData, roleTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-sky-200 rounded-xl focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:outline-hidden font-semibold text-slate-900 placeholder:text-slate-400 transition-all"
                  placeholder="Ej. Coordinador(a) de Proyectos Pedagógicos"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Tipo de Contrato *
                </label>
                <input
                  type="text"
                  required
                  value={formData.contractType || ''}
                  onChange={(e) => setFormData({ ...formData, contractType: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-sky-200 rounded-xl focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:outline-hidden text-slate-900 placeholder:text-slate-400 transition-all"
                  placeholder="Ej. Contrato a Término Indefinido / Término Fijo / Prestación de Servicios"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Breve descripción de las funciones principales *
                </label>
                <textarea
                  rows={3}
                  required
                  value={formData.duties || ''}
                  onChange={(e) => setFormData({ ...formData, duties: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-sky-200 rounded-xl focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:outline-hidden text-slate-900 placeholder:text-slate-400 transition-all font-sans"
                  placeholder="Ej. Facilitación de talleres de lectura infantil, diseño curricular de refuerzo escolar y gestión de dinámicas comunitarias."
                />
                <span className="text-[11px] text-slate-500">
                  Este párrafo se inserta entre comillas en el cuerpo del certificado.
                </span>
              </div>
            </div>
          </div>

          {/* Section 6: Emisión y Código de Validación */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-900 pb-1.5 border-b border-sky-100">
              <ShieldCheck className="w-4 h-4 text-blue-700" />
              <span>6. Emisión y Código de Validación Oficial</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Ciudad de Expedición del Certificado *
                </label>
                <input
                  type="text"
                  required
                  value={formData.issueCity || formData.city || ''}
                  onChange={(e) => setFormData({ ...formData, issueCity: e.target.value, city: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-sky-200 rounded-xl focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:outline-hidden text-slate-900 placeholder:text-slate-400 transition-all"
                  placeholder="Ej. Popayán, Cauca"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Fecha de Expedición del Certificado
                </label>
                <div className="relative flex items-center">
                  <input
                    type="text"
                    value={formData.issueDate || ''}
                    onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                    className="w-full pr-10 pl-3.5 py-2.5 text-sm bg-white border border-sky-200 rounded-xl focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:outline-hidden text-slate-900 placeholder:text-slate-400 transition-all"
                    placeholder="Dejar en blanco para usar la fecha actual"
                  />
                  <div className="absolute right-2.5 flex items-center">
                    <input
                      type="date"
                      title="Seleccionar fecha de expedición"
                      value={spanishDateToIso(formData.issueDate)}
                      onChange={(e) => handleIssueDatePicker(e.target.value)}
                      className="w-6 h-6 opacity-0 absolute inset-0 cursor-pointer z-10"
                    />
                    <Calendar className="w-4 h-4 text-sky-600 pointer-events-none" />
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Define el día, mes y año de expedición en el texto final
                </span>
              </div>

              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                    Código de Validación Oficial *
                  </label>
                  <button
                    type="button"
                    onClick={handleRegenerateCode}
                    title="Recalcular siguiente código de la secuencia"
                    className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-700 hover:text-blue-900 cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Siguiente en secuencia</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={formData.certificateCode || ''}
                    onChange={(e) => setFormData({ ...formData, certificateCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-sky-200 rounded-xl focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:outline-hidden text-blue-950 font-mono font-bold placeholder:text-slate-400 transition-all"
                    placeholder="Ej. CERT-ULEP-2024-004"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                    <Hash className="w-4 h-4 text-sky-500" />
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Consecutivo correlativo único (ej. CERT-ULEP-2024-001, 002, 003...)
                </span>
              </div>
            </div>
          </div>

          {/* Section 7: Representante Legal / Firmante */}
          <div className="space-y-3 p-4 bg-slate-50 rounded-2xl border border-slate-200">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-800 pb-1.5 border-b border-slate-200">
              <FileSignature className="w-4 h-4 text-slate-600" />
              <span>7. Datos del Firmante / Representante Legal</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre del Representante Legal
                </label>
                <input
                  type="text"
                  value={formData.signatoryName || ''}
                  onChange={(e) => setFormData({ ...formData, signatoryName: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-semibold"
                  placeholder="JERSON STIVE LOPEZ RENGIFO"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cargo del Firmante
                </label>
                <input
                  type="text"
                  value={formData.signatoryRole || ''}
                  onChange={(e) => setFormData({ ...formData, signatoryRole: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900"
                  placeholder="Gerente y Representante Legal"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Documento de Identidad del Firmante
                </label>
                <input
                  type="text"
                  value={formData.signatoryDocument || ''}
                  onChange={(e) => setFormData({ ...formData, signatoryDocument: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900 font-mono text-xs"
                  placeholder="C.C. 1.059.357.889 de Popayán (Cauca)"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Empresa o Entidad Certificadora
                </label>
                <input
                  type="text"
                  value={formData.signatoryEntity || ''}
                  onChange={(e) => setFormData({ ...formData, signatoryEntity: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-slate-300 rounded-xl text-slate-900"
                  placeholder="FUNDACIÓN ULEP"
                />
              </div>
            </div>
          </div>

          {/* Section 8: Credenciales de Acceso */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 pb-1.5 border-b border-sky-100">
              <ShieldCheck className="w-4 h-4 text-sky-700" />
              <span>8. Credenciales de Acceso para el Colaborador</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Usuario de Acceso</label>
                <input
                  type="text"
                  value={formData.username || ''}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-sky-200 rounded-xl focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:outline-hidden font-mono text-slate-900 placeholder:text-slate-400 transition-all"
                  placeholder="Ej. camila.rodriguez"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Contraseña</label>
                <input
                  type="text"
                  value={formData.password || ''}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-sky-200 rounded-xl focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 focus:outline-hidden font-mono text-slate-900 placeholder:text-slate-400 transition-all"
                  placeholder="Contraseña (ej. 123)"
                />
              </div>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-sky-100">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-semibold text-slate-700 hover:text-blue-950 bg-white hover:bg-sky-50 rounded-xl border border-sky-200 transition-all cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
            >
              {initialVolunteer ? 'Guardar Cambios' : 'Registrar Colaborador'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
