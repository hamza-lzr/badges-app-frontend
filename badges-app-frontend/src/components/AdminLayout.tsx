import React from 'react';
import AdminSidebar from './AdminSideBar';

interface AdminLayoutProps {
    children: React.ReactNode;
}

const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
    return (
        <div className="d-flex">
            <AdminSidebar />
            <div className="flex-grow-1 p-4 bg-light">
                {children}
            </div>
        </div>
    );
};

export default AdminLayout;
