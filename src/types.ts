export type UserRole = 'admin' | 'worker';

export interface Volunteer {
  id: string;
  username: string;
  password?: string;
  fullName: string;
  documentType?: string; // Tipo de Documento: e.g. 'Cédula de Ciudadanía'
  documentNumber: string; // Número de Documento
  documentExpeditionCity?: string; // Ciudad de Expedición del Documento
  age: number;
  career: string; // Carrera / Formación
  email: string;
  phone: string;
  city: string; // Ciudad de ubicación / expedición del certificado
  startDate: string; // Fecha de inicio
  endDate: string; // Fecha fin o 'Activo actualmente' / 'la actualidad'
  roleTitle: string; // Cargo ocupado
  hoursCompleted?: number; // Horas dedicadas
  duties: string; // Breve descripción de funciones principales
  contractType?: string; // Tipo de contrato
  issueCity?: string; // Ciudad de expedición del certificado
  issueDate?: string; // Fecha de expedición del certificado (ej. '14 de septiembre de 2024')
  certificateCode: string;
  status: 'Activo' | 'Finalizado';
  signatoryName?: string; // Nombre de quien firma
  signatoryRole?: string; // Cargo de quien firma
  signatoryDocument?: string; // Documento de identidad de quien firma
  signatoryEntity?: string; // Empresa o entidad certificadora (ej. FUNDACIÓN ULEP)
  // Información Básica y Dotación
  shirtSize?: string; // Talla de camisa / dotación (ej. 'S', 'M', 'L', 'XL')
  pantsSize?: string; // Talla de pantalón (ej. '28', '30', '32')
  shoeSize?: string; // Calzado (ej. '38', '40')
  height?: string; // Estatura / Altura (ej. '1.68 m')
  weight?: string; // Peso aproximado (ej. '62 kg')
  bloodType?: string; // Grupo sanguíneo y RH (ej. 'O+', 'A+', 'B+', etc.)
  epsHealth?: string; // EPS / Sistema de salud (ej. 'Sanitas', 'Nueva EPS')
  emergencyContactName?: string; // Contacto de emergencia (Nombre y parentesco)
  emergencyContactPhone?: string; // Contacto de emergencia (Teléfono)
  birthDate?: string; // Fecha de nacimiento
  gender?: string; // Género (Femenino / Masculino / Otro)
}

export interface AuthUser {
  id: string;
  username: string;
  role: UserRole;
  volunteerData?: Volunteer;
}
