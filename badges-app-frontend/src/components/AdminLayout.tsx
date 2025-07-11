import React from 'react';
import AdminSidebar from './AdminSideBar';
import { Outlet } from 'react-router-dom';



const AdminLayout: React.FC = () => {
    return (
        <div className="d-flex">
            <AdminSidebar />
            <div className="flex-grow-1 p-4 bg-light">
                <Outlet />
            </div>
        </div>
    );
};

export default AdminLayout;
