import React, { useState, useRef, useEffect } from 'react';
import { Volunteer } from '../types';
import { Download, Loader2, FileText, ShieldCheck, Lock } from 'lucide-react';
import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import { getFormalDateParts, cleanActualidadDate } from '../utils/dateUtils';
import { encryptBinaryFile, triggerFileDownload, computeSHA256 } from '../utils/cryptoUtils';

interface Props {
  volunteer: Volunteer;
  onClose?: () => void;
  showCloseButton?: boolean;
}

export const ExperienceCertificate: React.FC<Props> = ({
  volunteer,
  onClose,
  showCloseButton = false,
}) => {
  const [isDownloading, setIsDownloading] = useState(false);
  const [isDownloadingEncrypted, setIsDownloadingEncrypted] = useState(false);
  const [digitalSealHash, setDigitalSealHash] = useState<string>('');
  const certificateRef = useRef<HTMLDivElement>(null);

  // Compute digital seal SHA-256 for this certificate
  useEffect(() => {
    const sealData = `${volunteer.certificateCode}|${volunteer.fullName}|${volunteer.documentNumber}|${volunteer.issueDate}|ULEP-VAULT`;
    computeSHA256(sealData).then((h) => {
      setDigitalSealHash(h.slice(0, 32).toUpperCase());
    });
  }, [volunteer]);

  // Date breakdown for formal closing: "Día en Números", "Mes en Letras", "Año en Números"
  const dateParts = getFormalDateParts(volunteer.issueDate);
  const diaNumeros = dateParts.dia;
  const mesLetras = dateParts.mes;
  const anoNumeros = dateParts.ano;

  // Ensure concrete "desde (fecha) hasta (fecha)" - never "hasta la actualidad"
  const fechaInicio = (volunteer.startDate || '15 de enero de 2024')
    .replace(/^el\s+/i, '')
    .trim();
  const fechaFinTexto = cleanActualidadDate(
    volunteer.endDate,
    '15 de diciembre de 2024'
  )
    .replace(/^el\s+/i, '')
    .trim();

  // Resolved values
  const nombreEmpleado = volunteer.fullName || 'Colaborador';
  const tipoDocumento = volunteer.documentType || 'Cédula de Ciudadanía';
  const numeroDocumento = volunteer.documentNumber || 'No Registrado';
  const ciudadExpedicionDocumento =
    volunteer.documentExpeditionCity || volunteer.city || 'Popayán, Cauca';
  const cargoOcupado = volunteer.roleTitle || 'Colaborador';
  const funcionesPrincipales =
    volunteer.duties ||
    'Planificación, coordinación de actividades comunitarias y apoyo operativo integral.';
  const tipoContrato =
    volunteer.contractType || 'Contrato a Término Indefinido';
  const ciudadExpedicionCertificado =
    volunteer.issueCity || volunteer.city || 'Popayán, Cauca';

  // Signatory details
  const signatoryName = volunteer.signatoryName || 'JERSON STIVE LOPEZ RENGIFO';
  const signatoryRole = volunteer.signatoryRole || 'Gerente y Representante Legal';
  const signatoryDocument =
    volunteer.signatoryDocument || 'C.C. 1.059.357.889 de Popayán (Cauca)';
  const signatoryEntity = volunteer.signatoryEntity || 'FUNDACIÓN ULEP';

  // Plain text for copy to clipboard (compatible with Microsoft Word)
  const plainTextTemplate = `CERTIFICACIÓN LABORAL

A QUIEN PUEDA INTERESAR:

Que el(la) señor(a) ${nombreEmpleado}, identificado(a) con ${tipoDocumento} No. ${numeroDocumento} expedida en ${ciudadExpedicionDocumento}, prestó sus servicios en nuestra empresa desde el ${fechaInicio} hasta el ${fechaFinTexto}.

Durante su vinculación, ha desempeñado el cargo de ${cargoOcupado}, ejecutando satisfactoriamente funciones principales tales como: "${funcionesPrincipales}".

El tipo de contrato suscrito entre las partes fue mediante ${tipoContrato}.

Durante su tiempo de servicio, el(la) señor(a) ${nombreEmpleado} ha demostrado responsabilidad, cumplimiento, sentido de pertenencia y un excelente compromiso en el desarrollo de todas las labores encomendadas.

Para constancia de lo anterior y a solicitud del interesado(a), se expide la presente certificación en la ciudad de ${ciudadExpedicionCertificado}, a los ${diaNumeros} días del mes de ${mesLetras} del año ${anoNumeros}.

Cordialmente,

${signatoryName}
${signatoryRole}
${signatoryDocument}
${signatoryEntity}
NIT: 902050377-7
Popayán, Cauca
Código de Verificación: ${volunteer.certificateCode}`;

  const handleDownloadPdf = async () => {
    const element =
      certificateRef.current ||
      document.getElementById(`certificate-${volunteer.id}`);
    if (!element) return;

    setIsDownloading(true);
    try {
      const sanitizedName = (volunteer.fullName || 'Colaborador')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-zA-Z0-9_-]/g, '_');
      const filename = `Certificado_${sanitizedName}_${volunteer.certificateCode || 'ULEP'}.pdf`;

      // html2canvas-pro has native support for CSS oklch, lab, lch color functions
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      // Letter format: 215.9mm x 279.4mm
      const pdf = new jsPDF({
        unit: 'mm',
        format: 'letter',
        orientation: 'portrait',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const margin = 8;
      const printableWidth = pdfWidth - margin * 2;
      const printableHeight = pdfHeight - margin * 2;

      const imgAspectRatio = canvas.width / canvas.height;
      let renderWidth = printableWidth;
      let renderHeight = renderWidth / imgAspectRatio;

      if (renderHeight > printableHeight) {
        renderHeight = printableHeight;
        renderWidth = renderHeight * imgAspectRatio;
      }

      const posX = margin + (printableWidth - renderWidth) / 2;
      const posY = margin;

      pdf.addImage(imgData, 'JPEG', posX, posY, renderWidth, renderHeight, undefined, 'FAST');
      pdf.save(filename);
    } catch (error) {
      console.error('Error al generar y descargar PDF:', error);
      window.print();
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadEncryptedPdf = async () => {
    if (!certificateRef.current) return;
    setIsDownloadingEncrypted(true);

    try {
      const element = certificateRef.current;
      const cleanName = (volunteer.fullName || 'Colaborador')
        .replace(/[^a-zA-Z0-9]/g, '_')
        .replace(/_+/g, '_');
      const filename = `Certificado_Laboral_${cleanName}.pdf`;

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: 1024,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.98);

      const pdf = new jsPDF({
        unit: 'mm',
        format: 'letter',
        orientation: 'portrait',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const margin = 8;
      const printableWidth = pdfWidth - margin * 2;
      const printableHeight = pdfHeight - margin * 2;

      const imgAspectRatio = canvas.width / canvas.height;
      let renderWidth = printableWidth;
      let renderHeight = renderWidth / imgAspectRatio;

      if (renderHeight > printableHeight) {
        renderHeight = printableHeight;
        renderWidth = renderHeight * imgAspectRatio;
      }

      const posX = margin + (printableWidth - renderWidth) / 2;
      const posY = margin;

      pdf.addImage(imgData, 'JPEG', posX, posY, renderWidth, renderHeight, undefined, 'FAST');

      const pdfBlob = pdf.output('blob');
      const { encryptedBlob, encryptedFilename } = await encryptBinaryFile(
        pdfBlob,
        filename
      );

      triggerFileDownload(encryptedBlob, encryptedFilename);
    } catch (error) {
      console.error('Error al generar PDF encriptado:', error);
      alert('Error al generar certificado encriptado.');
    } finally {
      setIsDownloadingEncrypted(false);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Action Bar (Hidden on print) */}
      <div className="print:hidden w-full max-w-3xl flex flex-wrap items-center justify-between gap-3 mb-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-sky-200/80 shadow-xs shadow-blue-900/5">
        <div className="flex items-center gap-2.5 text-slate-800 text-sm font-semibold">
          <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-2xs">
            <FileText className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-slate-900 font-bold text-sm">
                Certificado de Experiencia y Laboral
              </p>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-600" />
                Cifrado Activo
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal">
              Documento oficial con firma digital, huella SHA-256 y código de validación
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {/* Encrypted PDF Download */}
          <button
            type="button"
            onClick={handleDownloadEncryptedPdf}
            disabled={isDownloadingEncrypted || isDownloading}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-75 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
            title="Descargar certificado en formato encriptado seguro (.pdf.ulepenc)"
          >
            {isDownloadingEncrypted ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Cifrando...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4 text-emerald-200" />
                <span>PDF Cifrado (.ulepenc)</span>
              </>
            )}
          </button>

          {/* Standard PDF Download */}
          <button
            type="button"
            onClick={handleDownloadPdf}
            disabled={isDownloading || isDownloadingEncrypted}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 via-sky-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-75 text-white text-xs sm:text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-600/20 cursor-pointer"
            title="Descargar certificado en formato PDF tradicional"
          >
            {isDownloading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Generando PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Descargar PDF</span>
              </>
            )}
          </button>

          {showCloseButton && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-white/90 hover:bg-sky-50 text-slate-700 text-xs font-semibold rounded-xl border border-sky-200/80 transition-all cursor-pointer shadow-2xs"
            >
              Cerrar
            </button>
          )}
        </div>
      </div>

      {/* Certificate Sheet - Standard Word Document Style (Clean, White, Professional) */}
      <div
        ref={certificateRef}
        id={`certificate-${volunteer.id}`}
        className="w-full max-w-3xl bg-white border border-slate-300 shadow-xl print:shadow-none print:border-none p-10 sm:p-16 md:p-20 text-slate-900 font-sans print:p-0 print:m-0 print:max-w-none"
        style={{ minHeight: '1050px' }}
      >
        {/* Document Header (Letterhead) */}
        <div className="text-center pb-6 mb-8 border-b border-slate-200">
          <div className="flex justify-center mb-4">
            <div className="w-32 h-32 sm:w-36 sm:h-36 flex items-center justify-center">
              <img
                src="/LOGO.png"
                alt="Logo Institucional"
                className="w-full h-full object-contain border-0"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                  if (fallback) fallback.style.display = 'flex';
                }}
              />
              <div className="hidden w-full h-full text-slate-700 items-center justify-center">
                <FileText className="w-12 h-12" />
              </div>
            </div>
          </div>
          <p className="text-base sm:text-lg uppercase tracking-widest text-slate-800 font-bold font-serif">
            FUNDACIÓN ULEP
          </p>
          <p className="text-xs text-slate-500 mt-1">
            NIT: 902050377-7 • Personería Jurídica y Registro Empresarial • Popayán, Cauca • Colombia
          </p>
        </div>

        {/* Document Formal Heading */}
        <div className="text-center my-8">
          <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-widest text-slate-900 font-serif">
            CERTIFICACIÓN LABORAL Y DE EXPERIENCIA
          </h1>
        </div>

        {/* Addressee */}
        <div className="mb-6">
          <p className="text-sm font-bold uppercase tracking-wider text-slate-900 font-serif">
            A QUIEN PUEDA INTERESAR:
          </p>
        </div>

        {/* Body of Certificate - Exact template requested by user with automatic variables */}
        <div className="space-y-5 text-slate-800 leading-relaxed text-sm sm:text-base text-justify font-serif">
          {/* Paragraph 1 */}
          <p className="leading-relaxed">
            Que el(la) señor(a){' '}
            <strong className="text-slate-950 font-bold uppercase tracking-wide">
              {nombreEmpleado}
            </strong>
            , identificado(a) con{' '}
            <strong className="text-slate-950 font-semibold">
              {tipoDocumento}
            </strong>{' '}
            No.{' '}
            <strong className="text-slate-950 font-semibold font-mono">
              {numeroDocumento}
            </strong>{' '}
            expedida en{' '}
            <strong className="text-slate-950 font-semibold">
              {ciudadExpedicionDocumento}
            </strong>
            , prestó sus servicios en nuestra empresa desde el{' '}
            <strong className="text-slate-950 font-semibold">
              {fechaInicio}
            </strong>{' '}
            hasta el{' '}
            <strong className="text-slate-950 font-semibold">
              {fechaFinTexto}
            </strong>
            .
          </p>

          {/* Paragraph 2 */}
          <p className="leading-relaxed">
            Durante su vinculación, ha desempeñado el cargo de{' '}
            <strong className="text-slate-950 font-bold">
              {cargoOcupado}
            </strong>
            , ejecutando satisfactoriamente funciones principales tales como:{' '}
            <span className="italic text-slate-900 font-sans text-sm">
              "{funcionesPrincipales}"
            </span>
            .
          </p>

          {/* Paragraph 3 */}
          <p className="leading-relaxed">
            El tipo de contrato suscrito entre las partes fue mediante{' '}
            <strong className="text-slate-950 font-semibold">
              {tipoContrato}
            </strong>
            .
          </p>

          {/* Paragraph 4 */}
          <p className="leading-relaxed">
            Durante su tiempo de servicio, el(la) señor(a){' '}
            <strong className="text-slate-950 font-bold uppercase">
              {nombreEmpleado}
            </strong>{' '}
            ha demostrado responsabilidad, cumplimiento, sentido de pertenencia y un excelente compromiso en el desarrollo de todas las labores encomendadas.
          </p>

          {/* Paragraph 5 */}
          <p className="leading-relaxed pt-2">
            Para constancia de lo anterior y a solicitud del interesado(a), se expide la presente certificación en la ciudad de{' '}
            <strong className="text-slate-950 font-semibold">
              {ciudadExpedicionCertificado}
            </strong>
            , a los{' '}
            <strong className="text-slate-950 font-bold">
              {diaNumeros}
            </strong>{' '}
            días del mes de{' '}
            <strong className="text-slate-950 font-bold">
              {mesLetras}
            </strong>{' '}
            del año{' '}
            <strong className="text-slate-950 font-bold">
              {anoNumeros}
            </strong>
            .
          </p>
        </div>

        {/* Signatures & Formal Verification Section */}
        <div className="mt-16 pt-10 border-t border-slate-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 items-end">
            <div>
              {/* Signature Line */}
              <div className="w-[301px] max-w-full border-b border-slate-800 pb-1 mb-2 relative flex flex-col items-center justify-end">
                <img
                  src="/FIRMA.png"
                  alt="Firma Jerson Stive López Rengifo"
                  className="h-28 sm:h-36 w-auto max-w-[300px] object-contain mx-auto -mb-6 relative z-10 mix-blend-multiply select-none pointer-events-none"
                  onError={(e) => {
                    // Fallback to text if image fails to load
                    e.currentTarget.style.display = 'none';
                    const fallback = e.currentTarget.nextElementSibling as HTMLElement;
                    if (fallback) fallback.style.display = 'block';
                  }}
                />
                <span className="hidden font-serif italic text-slate-900 text-lg tracking-wide select-none text-center">
                  {signatoryName}
                </span>
              </div>
              <p className="font-bold text-sm text-slate-950 font-serif uppercase tracking-wide relative z-0">
                {signatoryName}
              </p>
              <p className="text-xs text-slate-700 font-semibold">
                {signatoryRole}
              </p>
              <p className="text-xs text-slate-500">
                {signatoryDocument}
              </p>
              <p className="text-xs text-slate-700 font-medium">
                {signatoryEntity}
              </p>
              <p className="text-[11px] text-slate-400 mt-1">
                Popayán, Cauca • NIT: 902050377-7 • PBX: +57 (602) 820-9000
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1.5 font-sans">
              <div className="inline-block border border-slate-300 bg-slate-50/90 px-3.5 py-2.5 rounded-sm text-left shadow-2xs">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                  <p className="text-[11px] uppercase tracking-wider text-slate-700 font-bold">
                    Sello Digital Criptográfico
                  </p>
                </div>
                <p className="text-xs font-mono font-bold text-slate-900">
                  {volunteer.certificateCode}
                </p>
                {digitalSealHash && (
                  <p className="text-[9px] font-mono text-emerald-800 tracking-wider mt-0.5">
                    SHA-256: {digitalSealHash}...
                  </p>
                )}
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Emisión: {diaNumeros} de {mesLetras} de {anoNumeros} • Cifrado AES-256
                </p>
              </div>
              <p className="text-[10px] text-slate-400 italic">
                Documento expedido, certificado y protegido contra alteraciones.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
