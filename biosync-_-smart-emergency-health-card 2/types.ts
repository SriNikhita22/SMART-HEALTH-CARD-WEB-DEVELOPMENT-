export enum BloodGroups {
  APositive = 'A+',
  ANegative = 'A-',
  BPositive = 'B+',
  BNegative = 'B-',
  ABPositive = 'AB+',
  ABNegative = 'AB-',
  OPositive = 'O+',
  ONegative = 'O-'
}

export type TimelineCategory = 'Labs' | 'Surgeries' | 'Prescriptions';

export interface TimelineEvent {
  id: string;
  date: string;
  category: TimelineCategory;
  title: string;
  summary: string;
  notes?: string;
  fileName?: string;
  fileUrl?: string;
  lastModified?: string;
}

export interface UserHealthData {
  fullName: string;
  bloodGroup: string;
  allergies: string;
  chronicDiseases: string;
  currentMedications: string;
  profileImage?: string;
  pastSurgeries?: string;
  emergencyContact: string;
  gender?: string;
  height?: number;
  weight?: number;
  bmi?: number;
  age?: number;
  lastUpdated: string;
  timeline?: TimelineEvent[];
}