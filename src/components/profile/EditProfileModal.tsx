import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Row, Col } from "react-bootstrap";
import type { UserDTO, CompanyDTO } from "../../types";

interface EditProfileModalProps {
  show: boolean;
  onHide: () => void;
  profile: UserDTO;
  companies: CompanyDTO[];
  companiesLoading: boolean;
  companiesError: string;
  saving: boolean;
  onLoadCompanies: () => void;
  onSubmit: (editData: Partial<UserDTO>) => Promise<void>;
}

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  show,
  onHide,
  profile,
  companies,
  companiesLoading,
  companiesError,
  saving,
  onLoadCompanies,
  onSubmit,
}) => {
  const [editData, setEditData] = useState<Partial<UserDTO>>({});

  useEffect(() => {
    if (show) {
      onLoadCompanies();
      const { firstName, lastName, email, phone, companyId, matricule } = profile;
      setEditData({ firstName, lastName, email, phone, companyId, matricule });
    }
  }, [show, profile, onLoadCompanies]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(editData);
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" size="lg" className="rounded-4">
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold modal-title-custom">Edit Profile</Modal.Title>
      </Modal.Header>
      <Modal.Body className="pt-0">
        <Form onSubmit={handleSubmit}>
          <div className="pb-2 mb-3 form-section-divider">
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

          <div className="pb-2 mb-3 form-section-divider">
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

          <div className="pb-2 mb-3 form-section-divider">
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
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <div className="d-flex align-items-center" style={{ minHeight: 28 }}>
                {companiesLoading && <small className="text-muted">Loading companies…</small>}
                {!companiesLoading && companiesError && (
                  <small className="text-danger">{companiesError}</small>
                )}
              </div>
            </Col>
          </Row>

          <div className="text-end mt-3">
            <Button variant="outline-secondary" onClick={onHide} className="rounded-pill shadow-sm me-2" disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" className="rounded-pill shadow-sm" disabled={saving}>
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default EditProfileModal;
