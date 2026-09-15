import React, { useState } from 'react';
import { Volunteer } from '../types';
import { ExperienceCertificate } from './ExperienceCertificate';
import {
  User,
  Award,
  Phone,
  Mail,
  MapPin,
  LogOut,
} from 'lucide-react';

interface Props {
  volunteer: Volunteer;
  onLogout: () => void;
}

export const WorkerDashboard: React.FC<Props> = ({ volunteer, onLogout }) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'certificate'>('profile');

  return (
    <div className="min-h-screen pb-16">
      {/* Top Header with Crystalline Navbar */}
      <header className="bg-white/75 backdrop-blur-xl border-b border-sky-200/70 sticky top-0 z-20 shadow-xs shadow-blue-900/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 min-h-24 flex items-center justify-between">
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
                <User className="w-8 h-8" />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
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

      {/* Main Container */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 space-y-6">
        {/* Navigation Tabs with Soft Crystalline Borders */}
        <div className="flex border border-sky-200/70 bg-white/80 backdrop-blur-md rounded-2xl p-1.5 shadow-sm shadow-blue-900/5 gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 hover:text-blue-900 hover:bg-sky-50/80'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Datos Básicos de la Persona</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('certificate')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'certificate'
                ? 'bg-gradient-to-r from-blue-600 to-sky-600 text-white shadow-md shadow-blue-600/20'
                : 'text-slate-600 hover:text-blue-900 hover:bg-sky-50/80'
            }`}
          >
            <Award className="w-4 h-4" />
            <span>Certificado de Experiencia</span>
          </button>
        </div>

        {/* Tab 1: Profile & Basic Info */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            {/* Identity Card with Basic Information */}
            <div className="bg-white/85 backdrop-blur-md rounded-3xl border border-sky-200/70 p-6 sm:p-8 shadow-md shadow-blue-900/5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-sky-100 gap-4">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
                    {volunteer.fullName}
                  </h2>
                  <p className="text-sm text-sky-800 font-medium mt-0.5">
                    {volunteer.career}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 bg-sky-50/90 border border-sky-200/80 rounded-xl text-xs font-mono font-semibold text-blue-900 shadow-2xs">
                    Cód: {volunteer.certificateCode}
                  </span>
                </div>
              </div>

              {/* Grid of Basic Data requested */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 pt-6">
                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-800/80 block">
                    {volunteer.documentType || 'Cédula de Ciudadanía'}
                  </span>
                  <p className="text-base font-bold text-slate-900 font-mono">
                    {volunteer.documentNumber}
                  </p>
                  <span className="text-xs text-slate-500 block">
                    Expedida en: {volunteer.documentExpeditionCity || volunteer.city}
                  </span>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-800/80 block">
                    Cargo Desempeñado
                  </span>
                  <p className="text-base font-bold text-slate-900">
                    {volunteer.roleTitle}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-800/80 block">
                    Tipo de Contrato
                  </span>
                  <p className="text-base font-semibold text-slate-900">
                    {volunteer.contractType || 'Contrato a Término Indefinido'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-800/80 block">
                    Período Certificado
                  </span>
                  <p className="text-sm font-semibold text-slate-900">
                    Desde: {volunteer.startDate} <br />
                    Hasta: {volunteer.endDate?.toLowerCase().includes('actualidad')
                      ? '15 de diciembre de 2024'
                      : volunteer.endDate || '15 de diciembre de 2024'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-800/80 block">
                    Ciudad de Ubicación
                  </span>
                  <p className="text-base font-semibold text-slate-900 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-sky-600" />
                    {volunteer.city}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-800/80 block">
                    Teléfono
                  </span>
                  <p className="text-base font-semibold text-slate-900 flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-sky-600" />
                    {volunteer.phone || 'No registrado'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-800/80 block">
                    Correo Electrónico
                  </span>
                  <p className="text-base font-semibold text-slate-900 flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-sky-600" />
                    {volunteer.email || 'No registrado'}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-800/80 block">
                    Fecha de Nacimiento / Edad
                  </span>
                  <p className="text-base font-semibold text-slate-900">
                    {volunteer.birthDate ? `${volunteer.birthDate} (${volunteer.age} años)` : `${volunteer.age} años`}
                  </p>
                  {volunteer.gender && (
                    <span className="text-xs text-slate-500 block">
                      Género: {volunteer.gender}
                    </span>
                  )}
                </div>

                <div className="space-y-1">
                  <span className="text-xs font-bold uppercase tracking-wider text-sky-800/80 block">
                    Estado Actual
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                    volunteer.status === 'Activo' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {volunteer.status === 'Activo' ? 'Activo (labora)' : 'Finalizado (laboró)'}
                  </span>
                </div>
              </div>

              {/* Ficha de Tallas, Medidas y Dotación */}
              <div className="mt-8 pt-6 border-t border-sky-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block"></span>
                  Ficha de Tallas, Medidas Físicas y Dotación
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3 text-center">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide block mb-0.5">
                      Camisa
                    </span>
                    <p className="text-xl font-extrabold text-emerald-950">
                      {volunteer.shirtSize || 'M'}
                    </p>
                    <span className="text-[10px] text-emerald-700">Talla dotación</span>
                  </div>

                  <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3 text-center">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide block mb-0.5">
                      Pantalón
                    </span>
                    <p className="text-xl font-extrabold text-emerald-950">
                      {volunteer.pantsSize || '30'}
                    </p>
                    <span className="text-[10px] text-emerald-700">Talla estándar</span>
                  </div>

                  <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3 text-center">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide block mb-0.5">
                      Calzado
                    </span>
                    <p className="text-xl font-extrabold text-emerald-950">
                      {volunteer.shoeSize || '38'}
                    </p>
                    <span className="text-[10px] text-emerald-700">Talla calzado</span>
                  </div>

                  <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3 text-center">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide block mb-0.5">
                      Estatura
                    </span>
                    <p className="text-xl font-extrabold text-emerald-950">
                      {volunteer.height || '1.68 m'}
                    </p>
                    <span className="text-[10px] text-emerald-700">Altura física</span>
                  </div>

                  <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3 text-center">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide block mb-0.5">
                      Peso
                    </span>
                    <p className="text-xl font-extrabold text-emerald-950">
                      {volunteer.weight || '62 kg'}
                    </p>
                    <span className="text-[10px] text-emerald-700">Aproximado</span>
                  </div>

                  <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-2xl p-3 text-center">
                    <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide block mb-0.5">
                      RH / Sangre
                    </span>
                    <p className="text-xl font-extrabold text-emerald-950">
                      {volunteer.bloodType || 'O+'}
                    </p>
                    <span className="text-[10px] text-emerald-700">Grupo sanguíneo</span>
                  </div>
                </div>
              </div>

              {/* Salud y Contacto de Emergencia */}
              <div className="mt-6 pt-6 border-t border-sky-100">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-900 mb-4 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-rose-500 inline-block"></span>
                  Información Médica y Contacto de Emergencia
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">
                      EPS / Afiliación Salud
                    </span>
                    <p className="text-base font-bold text-slate-900">
                      {volunteer.epsHealth || 'Nueva EPS'}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">
                      Contacto de Emergencia
                    </span>
                    <p className="text-base font-bold text-slate-900">
                      {volunteer.emergencyContactName || 'No registrado'}
                    </p>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <span className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">
                      Teléfono de Emergencia
                    </span>
                    <p className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Phone className="w-4 h-4 text-rose-600" />
                      {volunteer.emergencyContactPhone ? (
                        <a href={`tel:${volunteer.emergencyContactPhone}`} className="hover:underline text-rose-700">
                          {volunteer.emergencyContactPhone}
                        </a>
                      ) : (
                        <span className="text-slate-500 font-normal">No registrado</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-sky-100 flex justify-end">
                <button
                  type="button"
                  onClick={() => setActiveTab('certificate')}
                  className="inline-flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-semibold rounded-xl shadow-md shadow-blue-600/20 transition-all cursor-pointer"
                >
                  <Award className="w-4 h-4" />
                  <span>Ver Certificado de Experiencia</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Certificate */}
        {activeTab === 'certificate' && (
          <div className="space-y-4">
            <ExperienceCertificate volunteer={volunteer} />
          </div>
        )}
      </main>
    </div>
  );
};
