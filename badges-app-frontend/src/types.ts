export type ReqStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type ReqType = 'NEW_BADGE' | 'RENEWAL' | 'LOST_BADGE';

export interface Request {
    id: number;
    description: string;
    reqStatus: ReqStatus;
    employeeId: number;
    createdAt: string;
    reqType: ReqType;
}

export type Status = 'ACTIVE' | 'INACTIVE' | 'BLOCKED'; 
export type Role = 'EMPLOYEE' | 'ADMIN'; // si besoin plus tard

export interface UserDTO {
    id: number;
    email: string;
    role: string;
    status: Status;
    userType: string;
    matricule: string;
    firstName: string;
    lastName: string;
    phone: string;
    companyId: number;
    badgesIds: number[];
}



export interface CompanyDTO {
    id?: number;
    name: string;
    address: string;
    phone: string;
    description: string;
}

export interface AirportDTO {
  id?: number;
  iata: string;
  name: string;
  cityId: number;
}

export interface BadgeDTO {
    id?: number;
  code: string;
  issuedDate: string;   // Dates as ISO strings
  expiryDate: string;
  companyId: number;
  userId: number;
  accessListIds: number[];
}

export interface CityDTO {
  id?: number;
  name: string;
  countryId: string;
}

export interface CountryDTO {
  id?: number;
  name: string;
}

export interface AccessDTO {
  id?: number;
  startDate: string; // Dates as ISO strings
  endDate: string;
  description: string;
  airportId: number;
  badgeId: number;
} 

export interface NotificationDTO {
  id?: number;
  message: string;
  userId: number;
  read: boolean;
  createdAt: string; 
}
