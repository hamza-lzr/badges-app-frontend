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
}

export interface EmployeeDTO extends UserDTO {
    matricule: string;
    firstName: string;
    lastName: string;
    phone: string;
    companyId: number;
    badgeId: number;
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
  city: string;
  country: string;
}

export interface BadgeDTO {
    id?: number;
  code: string;
  issuedDate: string;   // Dates as ISO strings
  expiryDate: string;
  companyId: number;
  employeeId: number;
  accessListIds: number[];
}




