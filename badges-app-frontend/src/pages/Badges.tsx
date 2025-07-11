import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Typography,
  Box,
} from "@mui/material";
import { fetchEmployees } from "../api/ApiEmployee";
import { createBadge, fetchBadgeById } from "../api/apiBadge";
import type { EmployeeDTO, BadgeDTO } from "../types";

const Badges: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [badgeData, setBadgeData] = useState<Partial<BadgeDTO>>({});
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeDTO | null>(
    null
  );

  useEffect(() => {
    loadEmployees();
  }, []);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const data = await fetchEmployees();
      setEmployees(data);
    } catch (error) {
      console.error("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  };

  const openGenerateDialog = (employee: EmployeeDTO) => {
    const now = new Date();
    const expiry = new Date();
    expiry.setFullYear(now.getFullYear() + 1);

    setSelectedEmployee(employee);
    setBadgeData({
      issuedDate: now.toISOString().split("T")[0],
      expiryDate: expiry.toISOString().split("T")[0],
      employeeId: employee.id,
      companyId: employee.companyId,
    });

    setOpenDialog(true);
  };

  const handleBadgeSubmit = async () => {
    if (!badgeData.code || !selectedEmployee) return;

    try {
      await createBadge({
        ...badgeData,
        code: badgeData.code,
        issuedDate: badgeData.issuedDate!,
        expiryDate: badgeData.expiryDate!,
        companyId: badgeData.companyId!,
        employeeId: badgeData.employeeId!,
        accessListIds: [],
      });
      loadEmployees();
      closeDialog();
    } catch (error) {
      console.error("Error creating badge:", error);
    }
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setBadgeData({});
    setSelectedEmployee(null);
  };

  const [badgeDialogOpen, setBadgeDialogOpen] = useState(false);
  const [badgeDetails, setBadgeDetails] = useState<BadgeDTO | null>(null);

  const openCheckBadgeDialog = (badge: BadgeDTO) => {
    setBadgeDetails(badge);
    setBadgeDialogOpen(true);
  };

  const closeCheckBadgeDialog = () => {
    setBadgeDialogOpen(false);
    setBadgeDetails(null);
  };

  return (
    <div>
      <h2 className="mb-4">Badges Management</h2>

      {loading ? (
        <div className="text-center my-5">Loading employees...</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Matricule</th>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Badge</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id}>
                  <td>{emp.id}</td>
                  <td>{emp.matricule}</td>
                  <td>
                    {emp.firstName} {emp.lastName}
                  </td>
                  <td>{emp.email}</td>
                  <td>{emp.companyId}</td>
                  <td>{emp.badgeId ? emp.badgeId : "No badge"}</td>
                  <td>
                    {emp.badgeId ? (
                      <button
                        className="btn btn-sm btn-info"
                        onClick={async () => {
                          try {
                            const badge = await fetchBadgeById(emp.badgeId!);
                            openCheckBadgeDialog(badge);
                          } catch (err) {
                            console.error("Error fetching badge:", err);
                          }
                        }}
                      >
                        Check Badge
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-primary"
                        onClick={() => openGenerateDialog(emp)}
                      >
                        Generate Badge
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={openDialog} onClose={closeDialog}>
        <DialogTitle>Generate Badge</DialogTitle>
        <DialogContent>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              marginTop: "8px",
            }}
          >
            <TextField
              label="Badge Code"
              value={badgeData.code || ""}
              onChange={(e) =>
                setBadgeData({ ...badgeData, code: e.target.value })
              }
              required
            />
            <TextField
              label="Issued Date"
              value={badgeData.issuedDate ?? ""}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Expiry Date"
              value={badgeData.expiryDate ?? ""}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Employee ID"
              value={badgeData.employeeId ?? ""}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Company ID"
              value={badgeData.companyId ?? ""}
              InputProps={{ readOnly: true }}
            />
          </div>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={handleBadgeSubmit} variant="contained">
            Generate
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog open={badgeDialogOpen} onClose={closeCheckBadgeDialog}>
  <DialogTitle>Badge Details</DialogTitle>
  <DialogContent>
    {badgeDetails && (
      <Box
        sx={{
          border: "1px solid #ccc",
          borderRadius: 4,
          padding: 2,
          backgroundColor: "#f7f7f7",
          minWidth: 250,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Typography variant="h5" gutterBottom>
          {badgeDetails.code}
        </Typography>
        <Typography variant="body2">
          <strong>Issued Date:</strong> {badgeDetails.issuedDate}
        </Typography>
        <Typography variant="body2">
          <strong>Expiry Date:</strong> {badgeDetails.expiryDate}
        </Typography>
        <Typography variant="body2">
          <strong>Company ID:</strong> {badgeDetails.companyId}
        </Typography>
        <Typography variant="body2">
          <strong>Employee ID:</strong> {badgeDetails.employeeId}
        </Typography>
      </Box>
    )}
  </DialogContent>
  <DialogActions>
    <Button onClick={closeCheckBadgeDialog}>Close</Button>
  </DialogActions>
</Dialog>

    </div>
  );
};

export default Badges;
