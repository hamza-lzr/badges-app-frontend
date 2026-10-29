import axios, { AxiosError } from 'axios';
import type { AxiosAdapter } from 'axios';
import { createFixtures } from './fixtures';

type DemoRow = { id?: number; [key: string]: unknown };
let store = createFixtures();

export function resetDemo() { store = createFixtures(); }

// Installed only by the standalone demo entry, before importing application pages.
// This adapter never sends a request to an API or identity provider.
export const demoAdapter: AxiosAdapter = async config => {
  const path = new URL(`${(config.baseURL ?? '').replace(/\/$/, '')}/${(config.url ?? '').replace(/^\//, '')}`, 'https://demo.invalid').pathname;
  const [endpoint, action, extra] = path.split('/').filter(Boolean);
  const resource = ({ company: 'companies', airport: 'airports', access: 'accesses' } as Record<string, string>)[endpoint] ?? endpoint;
  const collections = store as unknown as Record<string, DemoRow[]>;
  const rows = collections[resource];
  if (!rows) throw new AxiosError(`Écran non inclus dans la démo : ${resource}`, 'DEMO_UNSUPPORTED', config);
  const method = config.method?.toLowerCase() ?? 'get';
  let payload: unknown = config.data;
  if (typeof payload === 'string') { try { payload = JSON.parse(payload); } catch { /* A plain status string is valid. */ } }
  const response = (data: unknown) => ({ data: structuredClone(data), status: 200, statusText: 'OK', headers: {}, config });
  const id = Number(action);
  if (method === 'get') {
    if (!action) return response(rows);
    if (action === 'me') return response(store.users[0]);
    if (action === 'my') return response(rows.filter(row => row.userId === 1));
    if (['badge', 'airport', 'user-id'].includes(action)) {
      const field = action === 'badge' ? 'badgeId' : action === 'airport' ? 'airportId' : 'userId';
      return response(rows.filter(row => row[field] === Number(extra)));
    }
    const row = rows.find(item => item.id === id);
    if (row) return response(row);
  }
  if (method === 'put' && resource === 'requests' && action === 'update-status') {
    const row = rows.find(item => item.id === Number(extra));
    if (row && ['PENDING', 'APPROVED', 'REJECTED'].includes(String(payload))) { row.reqStatus = payload; return response(row); }
  }
  if (method === 'post' && payload && typeof payload === 'object') {
    const row: DemoRow = { ...payload, id: Math.max(0, ...rows.map(item => item.id ?? 0)) + 1 };
    rows.push(row);
    if (resource === 'badges') store.users.find(user => user.id === row.userId)?.badgesIds.push(row.id!);
    return response(row);
  }
  if (method === 'put' && payload && typeof payload === 'object') {
    const row = rows.find(item => item.id === id);
    if (row) { Object.assign(row, payload); return response(row); }
  }
  if (method === 'delete') { collections[resource] = rows.filter(item => item.id !== id); return response('Supprimé dans la démo.'); }
  throw new AxiosError('Opération non incluse dans la démonstration.', 'DEMO_UNSUPPORTED', config);
};

export function installDemoTransport() { axios.defaults.adapter = demoAdapter; }
