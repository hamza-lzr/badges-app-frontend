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
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import { fetchEmployees } from "../api/ApiEmployee";
import { createBadge, fetchBadgeById } from "../api/apiBadge";
import { fetchCompanies } from "../api/apiCompany";
import { fetchBadges } from "../api/apiBadge";

import type { UserDTO, BadgeDTO } from "../types";

const Badges: React.FC = () => {
  const [employees, setEmployees] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [openDialog, setOpenDialog] = useState(false);
  const [badgeData, setBadgeData] = useState<Partial<BadgeDTO>>({});

  const [badgeDialogOpen, setBadgeDialogOpen] = useState(false);
  const [badgeDetails, setBadgeDetails] = useState<BadgeDTO | null>(null);

  const [selectedBadgeId, setSelectedBadgeId] = useState<number | null>(null);

  const [companies, setCompanies] = useState<Record<number, string>>({});
  const [badges, setBadges] = useState<Record<number, string>>({});

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadEmployees();
    loadCompanies();
    loadBadges();
  }, []);

  const loadCompanies = async () => {
    try {
      const data = await fetchCompanies();
      const companyMap = Object.fromEntries(
        data.map((comp) => [comp.id, comp.name])
      );
      setCompanies(companyMap);
    } catch (err) {
      console.error("Error fetching companies:", err);
    }
  };

  const loadBadges = async () => {
    try {
      const data = await fetchBadges();
      const badgeMap = Object.fromEntries(
        data.map((badge) => [badge.id, badge.code])
      );
      setBadges(badgeMap);
    } catch (err) {
      console.error("Error fetching badges:", err);
    }
  };

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

  const openGenerateDialog = (user: UserDTO) => {
    const now = new Date();
    const expiry = new Date();
    expiry.setFullYear(now.getFullYear() + 1);

    setBadgeData({
      issuedDate: now.toISOString().split("T")[0],
      expiryDate: expiry.toISOString().split("T")[0],
      userId: user.id,
      companyId: user.companyId,
    });

    setOpenDialog(true);
  };

  const closeDialog = () => {
    setOpenDialog(false);
    setBadgeData({});
  };

  const handleBadgeSubmit = async () => {
    if (
      !badgeData.code ||
      !badgeData.issuedDate ||
      !badgeData.expiryDate ||
      !badgeData.companyId ||
      !badgeData.userId
    ) {
      console.error("Badge data incomplete");
      return;
    }

    try {
      await createBadge({
        code: badgeData.code,
        issuedDate: badgeData.issuedDate,
        expiryDate: badgeData.expiryDate,
        companyId: badgeData.companyId,
        userId: badgeData.userId,
        accessListIds: [],
      });
      await loadEmployees();
      closeDialog();
    } catch (error) {
      console.error("Error creating badge:", error);
    }
  };

  const openCheckBadgeDialog = async () => {
    if (!selectedBadgeId) return;
    try {
      const badge = await fetchBadgeById(selectedBadgeId);
      setBadgeDetails(badge);
      setBadgeDialogOpen(true);
    } catch (err) {
      console.error("Error fetching badge:", err);
    }
  };

  const closeCheckBadgeDialog = () => {
    setBadgeDialogOpen(false);
    setBadgeDetails(null);
    setSelectedBadgeId(null);
  };

  return (
    <div>
      <h2 className="mb-4">Badges Management</h2>

      {loading ? (
        <div className="text-center my-5">Loading employees...</div>
      ) : (
        <div className="table-responsive">
          <Box mb={3}>
            <TextField
              label="Search badges, employees, companies..."
              variant="outlined"
              size="small"
              fullWidth
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Box>

          <table className="table table-bordered table-hover">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Matricule</th>
                <th>Name</th>
                <th>Email</th>
                <th>Company</th>
                <th>Badges</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {employees
                .filter((emp) => {
                  const companyName =
                    companies[emp.companyId]?.toLowerCase() || "";
                  const fullName =
                    `${emp.firstName} ${emp.lastName}`.toLowerCase();
                  const matricule = emp.matricule?.toLowerCase() || "";
                  const badgeCodes = emp.badgesIds
                    .map((id) => badges[id]?.toLowerCase() || "")
                    .join(" ");

                  const query = searchQuery.toLowerCase();

                  return (
                    companyName.includes(query) ||
                    fullName.includes(query) ||
                    matricule.includes(query) ||
                    badgeCodes.includes(query)
                  );
                })
                .map((emp) => (
                  <tr key={emp.id}>
                    <td>{emp.id}</td>
                    <td>{emp.matricule}</td>
                    <td>
                      {emp.firstName} {emp.lastName}
                    </td>
                    <td>{emp.email}</td>
                    <td>{companies[emp.companyId] || emp.companyId}</td>

                    <td>{`${emp.badgesIds.length} badge${
                      emp.badgesIds.length !== 1 ? "s" : ""
                    }`}</td>
                    <td>
  <FormControl size="small">
    <InputLabel>Select Badge</InputLabel>
    <Select
      value={selectedBadgeId || ""}
      onChange={(e) => setSelectedBadgeId(Number(e.target.value))}
      displayEmpty
      sx={{ minWidth: 120, marginRight: 1 }}
    >
      {emp.badgesIds.map((id) => (
        <MenuItem key={id} value={id}>
          {badges[id] ? badges[id] : `Badge ${id}`}
        </MenuItem>
      ))}
    </Select>

    <Box mt={1} display="flex" gap={1}>
      <Button
        size="small"
        variant="outlined"
        onClick={openCheckBadgeDialog}
        disabled={!selectedBadgeId}
      >
        Check Badge
      </Button>

      <Button
        size="small"
        variant="contained"
        onClick={() => openGenerateDialog(emp)}
      >
        Add Badge
      </Button>
    </Box>
  </FormControl>
</td>

                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Generate Badge Dialog */}
      <Dialog open={openDialog} onClose={closeDialog}>
        <DialogTitle>Generate Badge</DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
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
              label="User ID"
              value={badgeData.userId ?? ""}
              InputProps={{ readOnly: true }}
            />
            <TextField
              label="Company ID"
              value={badgeData.companyId ?? ""}
              InputProps={{ readOnly: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog}>Cancel</Button>
          <Button onClick={handleBadgeSubmit} variant="contained">
            Generate
          </Button>
        </DialogActions>
      </Dialog>

      {/* Badge Details Dialog */}
      <Dialog open={badgeDialogOpen} onClose={closeCheckBadgeDialog}>
        <DialogTitle>Badge Details</DialogTitle>
        <DialogContent>
          {badgeDetails && (
            <Box
              sx={{
                border: "1px solid #ccc",
                borderRadius: 4,
                p: 2,
                bgcolor: "#f7f7f7",
                minWidth: 250,
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
                <strong>Company :</strong> {badgeDetails.companyId}
              </Typography>
              <Typography variant="body2">
                <strong>User ID:</strong> {badgeDetails.userId}
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
