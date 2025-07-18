import React from "react";
import { Outlet } from "react-router-dom";
import EmployeeSideBar from "./EmployeeSideBar";

const EmployeeLayout: React.FC = () => (
  <div style={{ display: "flex" }}>
    <EmployeeSideBar />
    <div style={{ marginLeft: 210, width: "100%" }}>
      <Outlet />
    </div>
  </div>
);

export default EmployeeLayout;