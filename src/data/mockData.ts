import { Volunteer } from '../types';
import { ensureSequentialCodes } from '../utils/codeGenerator';
import { encryptText, decryptText, isEncryptedString } from '../utils/cryptoUtils';

export const INITIAL_VOLUNTEERS: Volunteer[] = [
  {
    id: 'vol-1',
    username: 'camila.rodriguez',
    password: '123',
    fullName: 'Camila Andrea Rodríguez Parra',
    documentType: 'Cédula de Ciudadanía',
    documentNumber: '1.020.849.201',
    documentExpeditionCity: 'Popayán, Cauca',
    age: 23,
    career: 'Licenciatura en Educación Infantil',
    email: 'camila.rodriguez@voluntariado.org',
    phone: '+57 312 456 7890',
    city: 'Popayán, Cauca',
    startDate: '15 de febrero de 2024',
    endDate: '15 de diciembre de 2024',
    roleTitle: 'Coordinadora de Acompañamiento Pedagógico',
    hoursCompleted: 160,
    duties: 'Facilitación de talleres de lectura infantil, diseño curricular de refuerzo escolar y gestión de dinámicas lúdicas comunitarias.',
    contractType: 'Contrato a Término Indefinido',
    issueCity: 'Popayán, Cauca',
    certificateCode: 'CERT-ULEP-2024-001',
    status: 'Activo',
    shirtSize: 'M',
    pantsSize: '8 (28)',
    shoeSize: '37',
    height: '1.65 m',
    weight: '58 kg',
    bloodType: 'O+',
    epsHealth: 'Nueva EPS',
    emergencyContactName: 'María Cristina Parra (Madre)',
    emergencyContactPhone: '+57 311 890 1234',
    birthDate: '12 de marzo de 2001',
    gender: 'Femenino',
  },
  {
    id: 'vol-2',
    username: 'juan.perez',
    password: '123',
    fullName: 'Juan David Pérez Morales',
    documentType: 'Cédula de Ciudadanía',
    documentNumber: '1.018.992.341',
    documentExpeditionCity: 'Popayán, Cauca',
    age: 26,
    career: 'Ingeniería de Sistemas',
    email: 'juan.perez@voluntariado.org',
    phone: '+57 301 987 6543',
    city: 'Popayán, Cauca',
    startDate: '10 de agosto de 2023',
    endDate: '30 de junio de 2024',
    roleTitle: 'Especialista en Alfabetización Digital e Infraestructura TI',
    hoursCompleted: 220,
    duties: 'Capacitación en ofimática e internet para adultos mayores, mantenimiento preventivo de equipos y soporte técnico integral.',
    contractType: 'Contrato a Término Fijo',
    issueCity: 'Popayán, Cauca',
    certificateCode: 'CERT-ULEP-2024-002',
    status: 'Finalizado',
    shirtSize: 'L',
    pantsSize: '32',
    shoeSize: '41',
    height: '1.78 m',
    weight: '74 kg',
    bloodType: 'A+',
    epsHealth: 'Sanitas EPS',
    emergencyContactName: 'Carlos Pérez (Padre)',
    emergencyContactPhone: '+57 300 456 7891',
    birthDate: '24 de agosto de 1998',
    gender: 'Masculino',
  },
  {
    id: 'vol-3',
    username: 'valentina.gomez',
    password: '123',
    fullName: 'Valentina Gómez Muñoz',
    documentType: 'Cédula de Ciudadanía',
    documentNumber: '1.037.654.128',
    documentExpeditionCity: 'Popayán, Cauca',
    age: 21,
    career: 'Psicología (6to Semestre)',
    email: 'valentina.gomez@voluntariado.org',
    phone: '+57 315 223 9081',
    city: 'Popayán, Cauca',
    startDate: '01 de abril de 2024',
    endDate: '30 de noviembre de 2024',
    roleTitle: 'Asesora en Apoyo Psicosocial Comunitario',
    hoursCompleted: 95,
    duties: 'Organización de círculos de escucha participativos, dinamización de grupos de integración y orientación psicosocial básica.',
    contractType: 'Contrato de Prestación de Servicios',
    issueCity: 'Popayán, Cauca',
    certificateCode: 'CERT-ULEP-2024-003',
    status: 'Activo',
    shirtSize: 'S',
    pantsSize: '6 (26)',
    shoeSize: '36',
    height: '1.60 m',
    weight: '52 kg',
    bloodType: 'O+',
    epsHealth: 'Sura EPS',
    emergencyContactName: 'Claudia Muñoz (Madre)',
    emergencyContactPhone: '+57 318 654 3210',
    birthDate: '05 de noviembre de 2003',
    gender: 'Femenino',
  },
];

const STORAGE_KEY = 'portal_voluntarios_data_v6_enc';

export function getStoredVolunteers(): Volunteer[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY) || localStorage.getItem('portal_voluntarios_data_v6');
    if (data) {
      if (isEncryptedString(data)) {
        // Fast sync fallback or wait for decryption: if encrypted string, we schedule transparent upgrade
        // We also keep an in-memory or sync cache if available
        const rawJson = sessionStorage.getItem('ulep_cached_volunteers');
        if (rawJson) {
          return JSON.parse(rawJson) as Volunteer[];
        }
      } else {
        const parsed: Volunteer[] = JSON.parse(data);
        const normalized = ensureSequentialCodes(parsed).map((v) => {
          if (!v.endDate || v.endDate.toLowerCase().includes('actualidad')) {
            return {
              ...v,
              endDate: '15 de diciembre de 2024',
            };
          }
          return v;
        });
        // Automatically re-encrypt
        saveStoredVolunteers(normalized);
        return normalized;
      }
    }
  } catch (e) {
    console.error('Error al leer de localStorage:', e);
  }
  saveStoredVolunteers(INITIAL_VOLUNTEERS);
  return INITIAL_VOLUNTEERS;
}

export function saveStoredVolunteers(volunteers: Volunteer[]): void {
  try {
    sessionStorage.setItem('ulep_cached_volunteers', JSON.stringify(volunteers));
    // Asynchronously encrypt into localStorage so that raw sensitive PII is never stored in plain text
    encryptText(JSON.stringify(volunteers))
      .then((encrypted) => {
        localStorage.setItem(STORAGE_KEY, encrypted);
        // Remove unencrypted legacy key
        localStorage.removeItem('portal_voluntarios_data_v6');
      })
      .catch((err) => {
        console.error('Error encriptando almacenamiento local:', err);
      });
  } catch (e) {
    console.error('Error al guardar en localStorage:', e);
  }
}

export async function loadEncryptedStoredVolunteers(): Promise<Volunteer[]> {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data && isEncryptedString(data)) {
      const decrypted = await decryptText(data);
      const parsed = JSON.parse(decrypted) as Volunteer[];
      sessionStorage.setItem('ulep_cached_volunteers', decrypted);
      return ensureSequentialCodes(parsed);
    }
  } catch (err) {
    console.error('Error leyendo almacenamiento encriptado:', err);
  }
  return getStoredVolunteers();
}
