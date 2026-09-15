import * as XLSX from 'xlsx';
import { Volunteer } from '../types';
import { generateNextSequentialCode } from './codeGenerator';
import {
  encryptBinaryFile,
  decryptBinaryFile,
  triggerFileDownload,
  computeSHA256,
} from './cryptoUtils';

export function cleanActualidadDate(dateStr?: string): string {
  if (!dateStr || dateStr.trim().toLowerCase().includes('actualidad')) {
    return '15 de diciembre de 2024';
  }
  return dateStr;
}

export interface ExcelImportResult {
  success: boolean;
  volunteers: Volunteer[];
  totalRows: number;
  validRows: number;
  errors: string[];
  isEncrypted?: boolean;
  sha256?: string;
  originalFilename?: string;
}

// Canonical column headers for Excel templates and exports
export const EXCEL_COLUMNS = [
  { header: 'Nombre Completo *', key: 'fullName', width: 28 },
  { header: 'Tipo Documento', key: 'documentType', width: 22 },
  { header: 'Número Documento *', key: 'documentNumber', width: 18 },
  { header: 'Ciudad Expedición Doc', key: 'documentExpeditionCity', width: 22 },
  { header: 'Fecha de Nacimiento', key: 'birthDate', width: 20 },
  { header: 'Edad', key: 'age', width: 8 },
  { header: 'Género', key: 'gender', width: 12 },
  { header: 'Carrera o Profesión', key: 'career', width: 26 },
  { header: 'Teléfono', key: 'phone', width: 16 },
  { header: 'Correo Electrónico', key: 'email', width: 26 },
  { header: 'Ciudad Ubicación', key: 'city', width: 18 },
  { header: 'Fecha Inicio (Desde) *', key: 'startDate', width: 22 },
  { header: 'Fecha Fin (Hasta) *', key: 'endDate', width: 22 },
  { header: 'Cargo Desempeñado *', key: 'roleTitle', width: 28 },
  { header: 'Tipo de Contrato', key: 'contractType', width: 26 },
  { header: 'Funciones Principales', key: 'duties', width: 40 },
  { header: 'Horas Concluidas', key: 'hoursCompleted', width: 16 },
  { header: 'Estado', key: 'status', width: 12 },
  { header: 'Talla Camisa', key: 'shirtSize', width: 14 },
  { header: 'Talla Pantalón', key: 'pantsSize', width: 14 },
  { header: 'Talla Calzado', key: 'shoeSize', width: 14 },
  { header: 'Estatura', key: 'height', width: 12 },
  { header: 'Peso', key: 'weight', width: 12 },
  { header: 'RH Sangre', key: 'bloodType', width: 12 },
  { header: 'EPS Salud', key: 'epsHealth', width: 18 },
  { header: 'Contacto Emergencia', key: 'emergencyContactName', width: 26 },
  { header: 'Teléfono Emergencia', key: 'emergencyContactPhone', width: 20 },
  { header: 'Código Certificado (Opcional)', key: 'certificateCode', width: 24 },
  { header: 'Ciudad Expedición Cert', key: 'issueCity', width: 22 },
];

/**
 * Generates and downloads an Excel template with proper headers and sample guide rows.
 */
export function downloadExcelTemplate(): void {
  const sampleData = [
    {
      'Nombre Completo *': 'Camila Andrea Rodríguez Parra',
      'Tipo Documento': 'Cédula de Ciudadanía',
      'Número Documento *': '1.020.849.201',
      'Ciudad Expedición Doc': 'Popayán, Cauca',
      'Fecha de Nacimiento': '12 de marzo de 2001',
      'Edad': 23,
      'Género': 'Femenino',
      'Carrera o Profesión': 'Licenciatura en Pedagogía Infantil',
      'Teléfono': '+57 312 456 7890',
      'Correo Electrónico': 'camila.rodriguez@fundacionulep.org',
      'Ciudad Ubicación': 'Popayán, Cauca',
      'Fecha Inicio (Desde) *': '15 de febrero de 2024',
      'Fecha Fin (Hasta) *': '15 de diciembre de 2024',
      'Cargo Desempeñado *': 'Coordinadora de Proyectos Pedagógicos',
      'Tipo de Contrato': 'Contrato a Término Indefinido',
      'Funciones Principales': 'Facilitación de talleres de lectura infantil, diseño curricular de refuerzo escolar y gestión comunitaria.',
      'Horas Concluidas': 160,
      'Estado': 'Activo',
      'Talla Camisa': 'M',
      'Talla Pantalón': '8 (28)',
      'Talla Calzado': '37',
      'Estatura': '1.65 m',
      'Peso': '58 kg',
      'RH Sangre': 'O+',
      'EPS Salud': 'Nueva EPS',
      'Contacto Emergencia': 'María Cristina Parra (Madre)',
      'Teléfono Emergencia': '+57 311 890 1234',
      'Código Certificado (Opcional)': 'CERT-ULEP-2024-001',
      'Ciudad Expedición Cert': 'Popayán, Cauca',
    },
    {
      'Nombre Completo *': 'Juan David Pérez Gómez',
      'Tipo Documento': 'Cédula de Ciudadanía',
      'Número Documento *': '1.059.732.110',
      'Ciudad Expedición Doc': 'Popayán, Cauca',
      'Fecha de Nacimiento': '24 de agosto de 1998',
      'Edad': 26,
      'Género': 'Masculino',
      'Carrera o Profesión': 'Ingeniería de Sistemas',
      'Teléfono': '+57 315 789 0123',
      'Correo Electrónico': 'juan.perez@fundacionulep.org',
      'Ciudad Ubicación': 'Popayán, Cauca',
      'Fecha Inicio (Desde) *': '10 de marzo de 2024',
      'Fecha Fin (Hasta) *': '20 de noviembre de 2024',
      'Cargo Desempeñado *': 'Gestor de Infraestructura y Soporte TIC',
      'Tipo de Contrato': 'Contrato a Término Fijo',
      'Funciones Principales': 'Mantenimiento preventivo de computadores, soporte de conectividad en aulas digitales y apoyo técnico.',
      'Horas Concluidas': 210,
      'Estado': 'Finalizado',
      'Talla Camisa': 'L',
      'Talla Pantalón': '32',
      'Talla Calzado': '41',
      'Estatura': '1.78 m',
      'Peso': '74 kg',
      'RH Sangre': 'A+',
      'EPS Salud': 'Sanitas EPS',
      'Contacto Emergencia': 'Carlos Pérez (Padre)',
      'Teléfono Emergencia': '+57 300 456 7891',
      'Código Certificado (Opcional)': '',
      'Ciudad Expedición Cert': 'Popayán, Cauca',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);

  // Set column widths
  worksheet['!cols'] = EXCEL_COLUMNS.map((col) => ({ wch: col.width }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Plantilla_Colaboradores');

  XLSX.writeFile(workbook, 'Plantilla_Carga_Masiva_Colaboradores_ULEP.xlsx');
}

/**
 * Exports all registered volunteers to an Excel file with complete columns.
 */
export function exportVolunteersToExcel(volunteers: Volunteer[]): void {
  const exportData = volunteers.map((vol) => ({
    'Código Certificado': vol.certificateCode || '',
    'Nombre Completo': vol.fullName,
    'Tipo Documento': vol.documentType || 'Cédula de Ciudadanía',
    'Número Documento': vol.documentNumber,
    'Ciudad Expedición Doc': vol.documentExpeditionCity || vol.city,
    'Fecha Nacimiento': vol.birthDate || '',
    'Edad': vol.age,
    'Género': vol.gender || '',
    'Carrera o Profesión': vol.career,
    'Teléfono': vol.phone || '',
    'Correo Electrónico': vol.email,
    'Ciudad Ubicación': vol.city,
    'Periodo Desde': vol.startDate,
    'Periodo Hasta': cleanActualidadDate(vol.endDate),
    'Cargo Desempeñado': vol.roleTitle,
    'Tipo Contrato': vol.contractType || 'Contrato a Término Indefinido',
    'Funciones Principales': vol.duties || '',
    'Horas Concluidas': vol.hoursCompleted ?? 0,
    'Estado': vol.status,
    'Talla Camisa': vol.shirtSize || 'M',
    'Talla Pantalón': vol.pantsSize || '30',
    'Talla Calzado': vol.shoeSize || '38',
    'Estatura': vol.height || '1.68 m',
    'Peso': vol.weight || '62 kg',
    'RH Sangre': vol.bloodType || 'O+',
    'EPS Salud': vol.epsHealth || 'Nueva EPS',
    'Contacto Emergencia': vol.emergencyContactName || '',
    'Teléfono Emergencia': vol.emergencyContactPhone || '',
    'Ciudad Expedición Certificado': vol.issueCity || vol.city,
    'Fecha Expedición Certificado': vol.issueDate || '',
    'Representante Legal': vol.signatoryName || 'JERSON STIVE LOPEZ RENGIFO',
    'Cargo Representante': vol.signatoryRole || 'Gerente y Representante Legal',
    'Documento Representante': vol.signatoryDocument || 'C.C. 1.059.357.889 de Popayán (Cauca)',
    'Entidad Certificadora': vol.signatoryEntity || 'FUNDACIÓN ULEP',
    'Usuario Acceso': vol.username,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);

  // Set column widths dynamically
  worksheet['!cols'] = Object.keys(exportData[0] || {}).map(() => ({ wch: 22 }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Colaboradores_Registrados');

  const todayStr = new Date().toISOString().split('T')[0];
  XLSX.writeFile(workbook, `Colaboradores_Registrados_ULEP_${todayStr}.xlsx`);
}

/**
 * Exports all registered volunteers to an encrypted AES-256-GCM file (.ulepenc) with SHA-256 integrity seal.
 */
export async function exportEncryptedVolunteersFile(
  volunteers: Volunteer[],
  passphrase?: string
): Promise<{ filename: string; sha256: string }> {
  const exportData = volunteers.map((vol) => ({
    'Código Certificado': vol.certificateCode || '',
    'Nombre Completo': vol.fullName,
    'Tipo Documento': vol.documentType || 'Cédula de Ciudadanía',
    'Número Documento': vol.documentNumber,
    'Ciudad Expedición Doc': vol.documentExpeditionCity || vol.city,
    'Fecha Nacimiento': vol.birthDate || '',
    'Edad': vol.age,
    'Género': vol.gender || '',
    'Carrera o Profesión': vol.career,
    'Teléfono': vol.phone || '',
    'Correo Electrónico': vol.email,
    'Ciudad Ubicación': vol.city,
    'Periodo Desde': vol.startDate,
    'Periodo Hasta': cleanActualidadDate(vol.endDate),
    'Cargo Desempeñado': vol.roleTitle,
    'Tipo Contrato': vol.contractType || 'Contrato a Término Indefinido',
    'Funciones Principales': vol.duties || '',
    'Horas Concluidas': vol.hoursCompleted ?? 0,
    'Estado': vol.status,
    'Talla Camisa': vol.shirtSize || 'M',
    'Talla Pantalón': vol.pantsSize || '30',
    'Talla Calzado': vol.shoeSize || '38',
    'Estatura': vol.height || '1.68 m',
    'Peso': vol.weight || '62 kg',
    'RH Sangre': vol.bloodType || 'O+',
    'EPS Salud': vol.epsHealth || 'Nueva EPS',
    'Contacto Emergencia': vol.emergencyContactName || '',
    'Teléfono Emergencia': vol.emergencyContactPhone || '',
    'Ciudad Expedición Certificado': vol.issueCity || vol.city,
    'Fecha Expedición Certificado': vol.issueDate || '',
    'Representante Legal': vol.signatoryName || 'JERSON STIVE LOPEZ RENGIFO',
    'Cargo Representante': vol.signatoryRole || 'Gerente y Representante Legal',
    'Documento Representante': vol.signatoryDocument || 'C.C. 1.059.357.889 de Popayán (Cauca)',
    'Entidad Certificadora': vol.signatoryEntity || 'FUNDACIÓN ULEP',
    'Usuario Acceso': vol.username,
  }));

  const worksheet = XLSX.utils.json_to_sheet(exportData);
  worksheet['!cols'] = Object.keys(exportData[0] || {}).map(() => ({ wch: 22 }));

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Colaboradores_Registrados');

  const excelArrayBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const excelBlob = new Blob([excelArrayBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  const todayStr = new Date().toISOString().split('T')[0];
  const baseFilename = `Colaboradores_Registrados_ULEP_${todayStr}.xlsx`;

  const { encryptedBlob, encryptedFilename, sha256 } = await encryptBinaryFile(
    excelBlob,
    baseFilename,
    passphrase
  );

  triggerFileDownload(encryptedBlob, encryptedFilename);

  return { filename: encryptedFilename, sha256 };
}

/**
 * Normalizes an object's keys to lowercase alphanumeric tokens for flexible mapping.
 */
function normalizeKey(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

/**
 * Reads and parses an uploaded Excel (.xlsx, .xls), CSV or encrypted (.ulepenc) file into Volunteer objects.
 */
export async function parseVolunteersFromExcel(
  file: File,
  existingVolunteers: Volunteer[],
  customPassphrase?: string
): Promise<ExcelImportResult> {
  let targetBuffer: ArrayBuffer;
  let isEncrypted = false;
  let fileSha256 = '';
  let originalFilename = file.name;

  try {
    const isEncryptedFile =
      file.name.toLowerCase().endsWith('.ulepenc') ||
      file.name.toLowerCase().endsWith('.enc');

    if (isEncryptedFile) {
      isEncrypted = true;
      const decrypted = await decryptBinaryFile(file, customPassphrase);
      targetBuffer = await decrypted.decryptedBlob.arrayBuffer();
      fileSha256 = decrypted.sha256;
      originalFilename = decrypted.originalFilename;
    } else {
      targetBuffer = await file.arrayBuffer();
      fileSha256 = await computeSHA256(targetBuffer);
    }
  } catch (err: unknown) {
    const msg =
      err instanceof Error
        ? err.message
        : 'Error al desencriptar el archivo. Verifique la clave de seguridad.';
    return {
      success: false,
      volunteers: [],
      totalRows: 0,
      validRows: 0,
      errors: [msg],
      isEncrypted: true,
    };
  }

  return new Promise((resolve) => {
    try {
      const workbook = XLSX.read(targetBuffer, { type: 'array' });

      const firstSheetName = workbook.SheetNames[0];
      if (!firstSheetName) {
        resolve({
          success: false,
          volunteers: [],
          totalRows: 0,
          validRows: 0,
          errors: ['El archivo no contiene ninguna hoja de cálculo válida.'],
          isEncrypted,
          sha256: fileSha256,
          originalFilename,
        });
        return;
      }

      const worksheet = workbook.Sheets[firstSheetName];
      const rawJson = XLSX.utils.sheet_to_json<Record<string, unknown>>(worksheet, { defval: '' });

      if (!rawJson || rawJson.length === 0) {
        resolve({
          success: false,
          volunteers: [],
          totalRows: 0,
          validRows: 0,
          errors: ['La hoja de cálculo está vacía o no contiene registros.'],
          isEncrypted,
          sha256: fileSha256,
          originalFilename,
        });
        return;
      }

      const errors: string[] = [];
      const parsedVolunteers: Volunteer[] = [];
      const cumulativeVolunteers = [...existingVolunteers];

        rawJson.forEach((rawRow, index) => {
          const rowNum = index + 2; // Row 1 is header

          // Create normalized map of row values
          const normalizedRow: Record<string, string> = {};
          for (const [key, value] of Object.entries(rawRow)) {
            const cleanKey = normalizeKey(key);
            normalizedRow[cleanKey] = String(value ?? '').trim();
          }

          const findValue = (...possibleKeys: string[]): string => {
            for (const key of possibleKeys) {
              const norm = normalizeKey(key);
              if (normalizedRow[norm] !== undefined && normalizedRow[norm] !== '') {
                return normalizedRow[norm];
              }
            }
            return '';
          };

          const fullName = findValue('nombrecompleto', 'nombre', 'nombres', 'fullname', 'colaborador');
          const documentNumber = findValue('numerodocumento', 'documento', 'cedula', 'identificacion', 'doc', 'documentnumber');
          const roleTitle = findValue('cargodesempenado', 'cargo', 'rol', 'labor', 'cargoocupado', 'roletitle');

          // Check required fields
          if (!fullName && !documentNumber && !roleTitle) {
            // Probably an empty row, skip silently
            return;
          }

          if (!fullName) {
            errors.push(`Fila ${rowNum}: Falta el Nombre Completo.`);
            return;
          }

          if (!documentNumber) {
            errors.push(`Fila ${rowNum} (${fullName}): Falta el Número de Documento.`);
            return;
          }

          if (!roleTitle) {
            errors.push(`Fila ${rowNum} (${fullName}): Falta el Cargo Desempeñado.`);
            return;
          }

          // Dates
          let startDate = findValue('fechainiciodesde', 'fechainicio', 'desde', 'fechadesde', 'startdate');
          if (!startDate) {
            startDate = '15 de enero de 2024';
          }

          let endDate = findValue('fechafinhasta', 'fechafin', 'hasta', 'fechahasta', 'enddate');
          if (!endDate || endDate.toLowerCase().includes('actualidad')) {
            endDate = '15 de diciembre de 2024';
          }

          // Certificate code: Use provided code, or generate sequential
          let certCode = findValue('codigocertificado', 'codigodecertificado', 'codigo', 'codigocert', 'certificatecode');
          if (!certCode) {
            certCode = generateNextSequentialCode(cumulativeVolunteers);
          }

          // Other fields
          const documentType = findValue('tipodocumento', 'tipodoc', 'documenttype') || 'Cédula de Ciudadanía';
          const documentExpeditionCity = findValue('ciudadexpediciondoc', 'ciudadexpediciondocumento', 'expedicion', 'ciudaddoc') || 'Popayán, Cauca';
          const career = findValue('carreraoprofesion', 'carrera', 'profesion', 'estudios', 'career') || 'Formación Técnica / Profesional';
          const ageNum = parseInt(findValue('edad', 'age'), 10);
          const age = isNaN(ageNum) || ageNum <= 0 ? 23 : ageNum;
          const gender = findValue('genero', 'sexo', 'gender') || 'Femenino';
          const birthDate = findValue('fechanacimiento', 'fechadenacimiento', 'nacimiento', 'birthdate') || '';
          const phone = findValue('telefono', 'celular', 'phone', 'movil') || '+57 310 000 0000';
          const city = findValue('ciudadubicacion', 'ciudad', 'ubicacion', 'municipio', 'city') || 'Popayán, Cauca';

          const generatedUsername = fullName
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]/g, '.')
            .replace(/\.+/g, '.')
            .slice(0, 16);

          const email = findValue('correoelectronico', 'correo', 'email') || `${generatedUsername}@fundacionulep.org`;
          const contractType = findValue('tipodecontrato', 'tipocontrato', 'contrato', 'contracttype') || 'Contrato a Término Indefinido';
          const duties = findValue('funcionesprincipales', 'funciones', 'labores', 'duties') || 'Planificación, coordinación de actividades y apoyo operativo integral.';
          const hoursCompleted = parseInt(findValue('horasconcluidas', 'horas', 'hourscompleted'), 10) || 120;
          const statusRaw = findValue('estado', 'status').toLowerCase();
          const status: 'Activo' | 'Finalizado' = statusRaw.includes('fin') || statusRaw.includes('inact') ? 'Finalizado' : 'Activo';

          // Physical & size data
          const shirtSize = findValue('tallacamisa', 'camisa', 'talla', 'shirtsize') || 'M';
          const pantsSize = findValue('tallapantalon', 'pantalon', 'pantsize', 'pantssize') || '30';
          const shoeSize = findValue('tallacalzado', 'calzado', 'zapatos', 'shoesize') || '38';
          const height = findValue('estatura', 'altura', 'height') || '1.68 m';
          const weight = findValue('peso', 'weight') || '62 kg';
          const bloodType = findValue('rhsangre', 'rh', 'gruposanguineo', 'sangre', 'bloodtype') || 'O+';
          const epsHealth = findValue('epssalud', 'eps', 'salud', 'epshealth') || 'Nueva EPS';
          const emergencyContactName = findValue('contactoemergencia', 'emergencianombre', 'acudiente', 'emergencycontactname') || '';
          const emergencyContactPhone = findValue('telefonoemergencia', 'emergenciatelefono', 'celularemergencia', 'emergencycontactphone') || '';
          const issueCity = findValue('ciudadexpedicioncert', 'ciudadexpedicioncertificado', 'ciudadcert', 'issuecity') || 'Popayán, Cauca';

          const newVolunteer: Volunteer = {
            id: `vol-${Date.now()}-${index}`,
            username: generatedUsername,
            password: '123',
            fullName,
            documentType,
            documentNumber,
            documentExpeditionCity,
            age,
            career,
            email,
            phone,
            city,
            startDate,
            endDate,
            roleTitle,
            hoursCompleted,
            duties,
            contractType,
            issueCity,
            certificateCode: certCode,
            status,
            signatoryName: 'JERSON STIVE LOPEZ RENGIFO',
            signatoryRole: 'Gerente y Representante Legal',
            signatoryDocument: 'C.C. 1.059.357.889 de Popayán (Cauca)',
            signatoryEntity: 'FUNDACIÓN ULEP',
            shirtSize,
            pantsSize,
            shoeSize,
            height,
            weight,
            bloodType,
            epsHealth,
            emergencyContactName,
            emergencyContactPhone,
            birthDate,
            gender,
          };

          parsedVolunteers.push(newVolunteer);
          cumulativeVolunteers.push(newVolunteer);
        });

        resolve({
          success: parsedVolunteers.length > 0,
          volunteers: parsedVolunteers,
          totalRows: rawJson.length,
          validRows: parsedVolunteers.length,
          errors,
          isEncrypted,
          sha256: fileSha256,
          originalFilename,
        });
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Error al procesar el archivo Excel.';
        resolve({
          success: false,
          volunteers: [],
          totalRows: 0,
          validRows: 0,
          errors: [errorMsg],
          isEncrypted,
          sha256: fileSha256,
          originalFilename,
        });
      }
  });
}
