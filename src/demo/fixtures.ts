import type { AccessDTO, AirportDTO, BadgeDTO, CompanyDTO, NotificationDTO, Request, UserDTO } from '../types';

const year = new Date().getFullYear();
const names = [['Amine', 'Exemple'], ['Salma', 'Démo'], ['Youssef', 'Exemple'], ['Lina', 'Démo'], ['Adam', 'Exemple'], ['Nour', 'Démo']];

export function createFixtures() {
  const users: UserDTO[] = names.map(([firstName, lastName], i) => ({
    id: i + 1, firstName, lastName, email: `collaborateur${i + 1}@example.test`,
    role: 'EMPLOYEE', userType: 'EMPLOYEE', status: i === 4 ? 'INACTIVE' : 'ACTIVE',
    matricule: `DEMO-${String(i + 1).padStart(3, '0')}`, phone: '0000000000', companyId: i % 2 + 1,
    badgesIds: i === 5 ? [] : [i + 1],
  }));
  const companies: CompanyDTO[] = [
    { id: 1, name: 'Compagnie Démo', address: 'Adresse fictive', phone: '0000000000', description: 'Entreprise fictive pour la démonstration.' },
    { id: 2, name: 'Services Démo', address: 'Adresse fictive', phone: '0000000000', description: 'Entreprise fictive pour la démonstration.' },
  ];
  const badges: BadgeDTO[] = users.slice(0, 5).map((u, i) => ({ id: i + 1, code: `BDG-DEMO-${String(i + 1).padStart(3, '0')}`,
    issuedDate: `${year - 1}-01-01`, expiryDate: `${i === 2 ? year - 1 : year + 1}-12-31`, companyId: u.companyId,
    userId: u.id, accessListIds: i < 3 ? [i + 1] : [], status: i === 2 ? 'INACTIVE' : 'ACTIVE' }));
  const airports: AirportDTO[] = [{ id: 1, iata: 'CMN', name: 'Casablanca Mohammed V', cityId: 1 }, { id: 2, iata: 'RAK', name: 'Marrakech Ménara', cityId: 2 }, { id: 3, iata: 'AGA', name: 'Agadir Al Massira', cityId: 3 }];
  const accesses: AccessDTO[] = [1, 2, 3].map(id => ({ id, airportId: id, badgeId: id, startDate: `${year}-01-01`, endDate: `${year + 1}-12-31` }));
  const requests: Request[] = [
    { id: 1, userId: 6, reqType: 'NEW_BADGE', description: 'Demande de premier badge — scénario fictif.', reqStatus: 'PENDING', createdAt: `${year}-10-28T09:30:00` },
    { id: 2, userId: 2, reqType: 'AIRPORT_ACCESS', description: 'Accès temporaire à un second aéroport — scénario fictif.', reqStatus: 'PENDING', createdAt: `${year}-10-27T14:15:00` },
    { id: 3, userId: 4, reqType: 'OTHER', description: 'Mise à jour des informations — scénario fictif.', reqStatus: 'APPROVED', createdAt: `${year}-10-26T11:00:00` },
    { id: 4, userId: 1, reqType: 'OTHER', description: 'Demande de renseignement — scénario fictif.', reqStatus: 'PENDING', createdAt: `${year}-10-25T10:00:00` },
    { id: 5, userId: 3, reqType: 'NEW_BADGE', description: 'Renouvellement du badge expiré — scénario fictif.', reqStatus: 'REJECTED', createdAt: `${year}-10-24T08:45:00` },
  ];
  const notification: NotificationDTO[] = [{ id: 1, userId: 1, message: 'Bienvenue dans la démonstration. Toutes les données sont fictives.', read: false, createdAt: `${year}-10-28T09:30:00` }];
  return { users, companies, badges, airports, accesses, requests, notification };
}
