import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import EmployeeSideBar from "./EmployeeSideBar";

const EmployeeLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="d-flex">
      {/* ✅ Sidebar */}
      <EmployeeSideBar collapsed={collapsed} setCollapsed={setCollapsed} />

      {/* ✅ Main content moves based on sidebar width */}
      <div
        style={{
          marginLeft: collapsed ? 70 : 220, // ✅ Adjust dynamically
          transition: "margin-left 0.25s ease",
          width: "100%",
          background: "#f8f9fa",
          minHeight: "100vh",
          padding: "20px",
        }}
      >
        <Outlet />
      </div>
    </div>
  );
};

export default EmployeeLayout;
