import React from "react";
import AdminSidebar from "./AdminSideBar";
import { Outlet } from "react-router-dom";

const AdminLayout: React.FC = () => {
  return (
    <>
      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <div
        className="p-4 bg-light"
        style={{
          marginLeft: "var(--sidebar-width, 250px)", // fallback = 250px
          minHeight: "100vh",
          transition: "margin-left 0.3s ease",
        }}
      >
        <Outlet />
      </div>
    </>
  );
};

export default AdminLayout;
