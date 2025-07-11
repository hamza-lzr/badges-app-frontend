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

export type Status = 'ACTIVE' | 'INACTIVE' | 'BANNED'; // adapte selon ton enum
export type Role = 'EMPLOYEE' | 'ADMIN'; // si besoin plus tard

// ✅ User de base
export interface UserDTO {
    id: number;
    email: string;
    role: string;
    status: Status;
    userType: string;
}

// ✅ Employee = User + infos spécifiques
export interface EmployeeDTO extends UserDTO {
    matricule: string;
    firstName: string;
    lastName: string;
    phone: string;
    companyId: number;
    badgeId: number;
}
