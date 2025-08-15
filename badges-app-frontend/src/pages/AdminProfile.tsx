import React, { useEffect, useState } from "react";
import {
  Card,
  Spinner,
  Button,
  Row,
  Col,
  Badge,
  Container,
  Modal,
  Form,
} from "react-bootstrap";
import {
  fetchMyProfile,
  changeMyPassword,
  updateEmployee,
} from "../api/ApiEmployee";
import { fetchCompanyById, fetchCompanies } from "../api/apiCompany";
import { toast } from "react-toastify";
import type { UserDTO, CompanyDTO } from "../types";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const MyAdminProfilePage: React.FC = () => {
  const [profile, setProfile] = useState<UserDTO | null>(null);
  const [companyName, setCompanyName] = useState<string>("Loading...");
  const [loading, setLoading] = useState(true);

  // Password modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [changing, setChanging] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Edit modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editData, setEditData] = useState<Partial<UserDTO>>({});

  // Companies list for the select
  const [companies, setCompanies] = useState<CompanyDTO[]>([]);
  const [companiesLoading, setCompaniesLoading] = useState(false);
  const [companiesError, setCompaniesError] = useState<string>("");

  // ---- Initial load: profile + current company name
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await fetchMyProfile();
        setProfile(data);

        if (data.companyId && data.companyId > 0) {
          const company = await fetchCompanyById(data.companyId);
          setCompanyName(company.name);
        } else {
          setCompanyName("N/A");
        }
      } catch (err) {
        console.error("Failed to fetch profile", err);
        toast.error("Failed to load your profile.");
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, []);

  // ---- Open Edit modal, prefill from profile
  const openEditModal = () => {
    if (!profile) return;
    const { firstName, lastName, email, phone, companyId, matricule } = profile;
    setEditData({ firstName, lastName, email, phone, companyId, matricule });
    setShowEditModal(true);
  };

  // ---- Load companies when modal opens
  useEffect(() => {
    const loadCompanies = async () => {
      if (!showEditModal) return;
      setCompaniesError("");
      try {
        setCompaniesLoading(true);
        const list = await fetchCompanies();
        list.sort((a, b) => a.name.localeCompare(b.name));
        setCompanies(list);
      } catch (e) {
        setCompaniesError(
          e instanceof Error ? `Failed to load companies: ${e.message}` : "Failed to load companies."
        );
      } finally {
        setCompaniesLoading(false);
      }
    };

    loadCompanies();
  }, [showEditModal]);

  // ---- Change password
  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }
    setChanging(true);
    try {
      await changeMyPassword(newPassword);
      toast.success("Password changed successfully.");
      setShowPasswordModal(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || error.message || "Error");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setChanging(false);
    }
  };

  // ---- Submit profile edits
  const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      // Build a payload that overwrites only the fields the user changed.
      // We keep the rest from the current profile.
      const payload: UserDTO = {
        ...profile,
        firstName: editData.firstName?.trim() ?? profile.firstName,
        lastName: editData.lastName?.trim() ?? profile.lastName,
        email: editData.email?.trim() ?? profile.email,
        phone: editData.phone?.trim() ?? profile.phone,
        matricule: editData.matricule?.trim() ?? profile.matricule ?? "",
        // Only overwrite companyId if a selection exists; otherwise keep current profile value.
        companyId:
          editData.companyId != null ? Number(editData.companyId) : profile.companyId,
      };

      const updated = await updateEmployee(profile.id!, payload);
      setProfile(updated);

      // Refresh label for company name
      if (updated.companyId && updated.companyId > 0) {
        try {
          const c = await fetchCompanyById(updated.companyId);
          setCompanyName(c.name);
        } catch {
          setCompanyName("N/A");
        }
      } else {
        setCompanyName("N/A");
      }

      toast.success("Profile updated successfully.");
      setShowEditModal(false);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        toast.error(error.response?.data?.error || error.message || "Update failed");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setSaving(false);
    }
  };

  // ---- Loading / error states
  if (loading) {
    return (
      <div className="d-flex flex-column align-items-center mt-5">
        <Spinner animation="border" variant="secondary" />
        <p className="text-muted mt-3">Loading your profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container text-center mt-4">
        <p className="text-muted">Could not load your profile. Please try again later.</p>
      </div>
    );
  }

  const { firstName, lastName, matricule, email, phone, role, status, badgesIds } = profile;

  return (
    <Container className="py-5" style={{ maxWidth: "850px" }}>
      <div className="text-center mb-5">
        <h1 className="fw-bold" style={{ color: "#333333" }}>
          My Profile
        </h1>
        <p className="text-muted">Manage your personal information and credentials</p>
      </div>

      <Card className="shadow-sm border-0 rounded-4">
        <Card.Body className="px-4 py-4">
          <div className="d-flex align-items-center mb-4">
            <div
              className="rounded-circle d-flex align-items-center justify-content-center me-3"
              style={{
                width: 72,
                height: 72,
                backgroundColor: "#f8f9fa",
                fontSize: "1.4rem",
                fontWeight: 600,
                color: "#495057",
              }}
            >
              {firstName.charAt(0)}
              {lastName.charAt(0)}
            </div>
            <div>
              <h5 className="mb-1" style={{ color: "#333333" }}>
                {firstName} {lastName}
              </h5>
              <small className="text-muted">Matricule: {matricule}</small>
              <div className="mt-2">
                <Badge bg={role === "EMPLOYEE" ? "secondary" : "primary"} className="me-2">
                  {role}
                </Badge>
                <Badge bg={status === "ACTIVE" ? "success" : "danger"}>{status}</Badge>
              </div>
            </div>
          </div>

          <hr className="my-3" />

          <Row className="mb-3">
            <Col md={6} className="mb-3">
              <div className="text-muted small mb-1">Email</div>
              <div className="fw-semibold" style={{ color: "#333333" }}>
                {email}
              </div>
            </Col>
            <Col md={6} className="mb-3">
              <div className="text-muted small mb-1">Phone</div>
              <div className="fw-semibold" style={{ color: "#333333" }}>
                {phone}
              </div>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6} className="mb-3">
              <div className="text-muted small mb-1">Company</div>
              <div className="fw-semibold" style={{ color: "#333333" }}>
                {companyName}
              </div>
            </Col>
            <Col md={6} className="mb-3">
              <div className="text-muted small mb-1">Linked Badges</div>
              <div className="fw-semibold" style={{ color: "#333333" }}>
                {badgesIds?.length ?? 0} badge(s)
              </div>
            </Col>
          </Row>

          <div className="text-center mt-4">
            <Button
              variant="outline-primary"
              className="rounded-pill px-4 py-2 shadow-sm me-3"
              onClick={openEditModal}
            >
              Update Profile
            </Button>

            <Button
              variant="outline-danger"
              className="rounded-pill px-4 py-2 shadow-sm"
              onClick={() => setShowPasswordModal(true)}
            >
              Change Password
            </Button>
          </div>

          {/* Edit Profile Modal */}
          <Modal
            show={showEditModal}
            onHide={() => setShowEditModal(false)}
            centered
            backdrop="static"
            size="lg"
            className="rounded-4"
          >
            <Modal.Header closeButton className="border-0">
              <Modal.Title className="fw-bold" style={{ color: "#333333" }}>
                Edit Profile
              </Modal.Title>
            </Modal.Header>

            <Modal.Body className="pt-0">
              <Form onSubmit={handleEditSubmit}>
                {/* Identity */}
                <div className="pb-2 mb-3" style={{ borderBottom: "1px solid #f0f1f2" }}>
                  <small className="text-muted fw-semibold">Identity</small>
                </div>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold text-muted">First Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={editData.firstName ?? ""}
                        onChange={(e) => setEditData((d) => ({ ...d, firstName: e.target.value }))}
                        required
                        className="rounded-4 shadow-sm"
                        placeholder="Enter first name"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold text-muted">Last Name</Form.Label>
                      <Form.Control
                        type="text"
                        value={editData.lastName ?? ""}
                        onChange={(e) => setEditData((d) => ({ ...d, lastName: e.target.value }))}
                        required
                        className="rounded-4 shadow-sm"
                        placeholder="Enter last name"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Contact */}
                <div className="pb-2 mb-3" style={{ borderBottom: "1px solid #f0f1f2" }}>
                  <small className="text-muted fw-semibold">Contact</small>
                </div>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold text-muted">Email</Form.Label>
                      <Form.Control
                        type="email"
                        value={editData.email ?? ""}
                        onChange={(e) => setEditData((d) => ({ ...d, email: e.target.value }))}
                        required
                        className="rounded-4 shadow-sm"
                        placeholder="Enter email"
                      />
                    </Form.Group>
                  </Col>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold text-muted">Phone</Form.Label>
                      <Form.Control
                        type="tel"
                        value={editData.phone ?? ""}
                        onChange={(e) => setEditData((d) => ({ ...d, phone: e.target.value }))}
                        className="rounded-4 shadow-sm"
                        placeholder="Enter phone"
                      />
                    </Form.Group>
                  </Col>
                </Row>

                {/* Organization */}
                <div className="pb-2 mb-3" style={{ borderBottom: "1px solid #f0f1f2" }}>
                  <small className="text-muted fw-semibold">Organization</small>
                </div>

                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-semibold text-muted">Matricule</Form.Label>
                      <Form.Control
                        type="text"
                        value={editData.matricule ?? ""}
                        onChange={(e) => setEditData((d) => ({ ...d, matricule: e.target.value }))}
                        className="rounded-4 shadow-sm"
                        placeholder="Enter matricule"
                      />
                    </Form.Group>
                  </Col>

                  <Col md={6}>
                    <Form.Group className="mb-1">
                      <Form.Label className="fw-semibold text-muted">Company</Form.Label>
                      <Form.Select
                        value={editData.companyId ?? ""}
                        onChange={(e) =>
                          setEditData((d) => ({
                            ...d,
                            companyId: e.target.value === "" ? undefined : Number(e.target.value),
                          }))
                        }
                        className="rounded-4 shadow-sm"
                        disabled={companiesLoading}
                      >
                        <option value="">Select a company…</option>
                        {companies.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </Form.Select>
                    </Form.Group>

                    <div className="d-flex align-items-center" style={{ minHeight: 28 }}>
                      {companiesLoading && <small className="text-muted">Loading companies…</small>}
                      {!companiesLoading && companiesError && (
                        <small className="text-danger">{companiesError}</small>
                      )}
                      {!companiesLoading && !companiesError && editData.companyId && (
                        <small className="text-success">
                          Selected: {companies.find((c) => c.id === editData.companyId)?.name ?? "—"}
                        </small>
                      )}
                    </div>
                  </Col>
                </Row>

                <div className="text-end mt-3">
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowEditModal(false)}
                    className="rounded-pill shadow-sm me-2"
                    disabled={saving}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="primary"
                    className="rounded-pill shadow-sm"
                    disabled={saving}
                  >
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </Form>
            </Modal.Body>

            <style>
              {`
                .modal-content { border-radius: 1rem; }
                .form-control::placeholder { color: #adb5bd; }
                .form-label { margin-bottom: .35rem; }
              `}
            </style>
          </Modal>

          {/* Password Change Modal */}
          <Modal
            show={showPasswordModal}
            onHide={() => setShowPasswordModal(false)}
            centered
            backdrop="static"
            className="rounded-4 shadow-sm"
          >
            <Modal.Header closeButton className="border-0">
              <Modal.Title className="fw-bold" style={{ color: "#333333" }}>
                Change Password
              </Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form onSubmit={handleChangePassword}>
                <Form.Group className="mb-3" style={{ position: "relative" }}>
                  <Form.Label className="fw-bold" style={{ color: "#333333" }}>
                    New Password
                  </Form.Label>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter your new password"
                    required
                    className="shadow-sm rounded-4 pe-5"
                  />
                  <div
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: "absolute",
                      top: "38px",
                      right: "15px",
                      cursor: "pointer",
                      color: "#6c757d",
                    }}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </Form.Group>

                <Form.Group className="mb-3" style={{ position: "relative" }}>
                  <Form.Label className="fw-bold" style={{ color: "#333333" }}>
                    Confirm Password
                  </Form.Label>
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your new password"
                    required
                    className="shadow-sm rounded-4 pe-5"
                  />
                </Form.Group>

                <div className="text-end">
                  <Button
                    variant="outline-secondary"
                    onClick={() => setShowPasswordModal(false)}
                    className="rounded-pill shadow-sm me-2"
                    disabled={changing}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="danger"
                    className="rounded-pill shadow-sm"
                    disabled={changing}
                  >
                    {changing ? "Changing..." : "Change Password"}
                  </Button>
                </div>
              </Form>
            </Modal.Body>
          </Modal>
        </Card.Body>
      </Card>

      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;700&display=swap');
          body { font-family: 'Roboto', sans-serif; }
          h1, h5 { font-weight: 700; }
          p, .card-text { font-weight: 400; }
          .rounded-pill { border-radius: 50px; }
          .rounded-4 { border-radius: 1rem; }
          .hover-shadow:hover { box-shadow: 0px 4px 12px rgba(0,0,0,0.1); }
        `}
      </style>
    </Container>
  );
};

export default MyAdminProfilePage;
