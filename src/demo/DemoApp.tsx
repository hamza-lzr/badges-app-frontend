import { HashRouter, Link, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import Dashboard from '../pages/Dashboard';
import Badges from '../pages/Badges';
import Requests from '../pages/Requests';
import Accesses from '../pages/Accesses';
import { resetDemo } from './transport';

const links = [
  { to: '/admin/dashboard', icon: 'bi-grid-1x2', label: 'Tableau de bord' },
  { to: '/admin/badges', icon: 'bi-person-badge', label: 'Badges' },
  { to: '/admin/requests', icon: 'bi-list-check', label: 'Demandes' },
  { to: '/admin/accesses', icon: 'bi-shield-check', label: 'Accès aéroportuaires' },
];

export default function DemoApp() {
  return <HashRouter>
    <div className="demo-notice"><span><strong>Démo portfolio</strong> · Données fictives · Modifications limitées à cette session</span><button onClick={() => { resetDemo(); window.location.reload(); }}>Réinitialiser</button></div>
    <aside className="demo-sidebar"><Link className="demo-brand" to="/admin/dashboard"><i className="bi bi-shield-lock" aria-hidden="true" />E-badges</Link><p className="demo-sidebar-label">ESPACE ADMINISTRATEUR</p><nav aria-label="Navigation de la démonstration">{links.map(link => <NavLink key={link.to} to={link.to}><i className={`bi ${link.icon}`} aria-hidden="true" />{link.label}</NavLink>)}</nav><div className="demo-author">Projet de stage · 2025<br /><strong>Hamza Lazaar</strong><a href="https://github.com/hamza-lzr/badges-app-frontend" target="_blank" rel="noreferrer">Voir le code <i className="bi bi-arrow-up-right" aria-hidden="true" /></a></div></aside>
    <div className="demo-workspace"><header className="demo-topbar"><span>Gestion des badges et accès aéroportuaires</span><span className="demo-account"><i className="bi bi-person-circle" aria-hidden="true" />Administrateur démo</span></header><main><Routes>
      <Route path="/admin/dashboard" element={<Dashboard availablePaths={links.map(link => link.to)} />} />
      <Route path="/admin/badges" element={<Badges />} />
      <Route path="/admin/requests" element={<Requests />} />
      <Route path="/admin/accesses" element={<Accesses />} />
      <Route path="/" element={<Navigate to="/admin/badges" replace />} />
      <Route path="*" element={<div className="demo-unavailable"><h1>Explorez les écrans de démonstration</h1><p>Badges, demandes, accès et tableau de bord sont disponibles dans cette démo.</p><Link className="btn btn-dark" to="/admin/badges">Voir les badges</Link></div>} />
    </Routes></main></div>
  </HashRouter>;
}
