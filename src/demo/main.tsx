import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { installDemoTransport } from './transport';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './demo.css';

installDemoTransport();
import('./DemoApp').then(({ default: DemoApp }) => {
  createRoot(document.getElementById('root')!).render(<StrictMode><DemoApp /></StrictMode>);
});
