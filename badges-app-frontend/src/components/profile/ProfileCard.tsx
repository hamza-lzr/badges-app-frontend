import React from "react";
import { Card, Button, Row, Col, Badge } from "react-bootstrap";
import type { UserDTO } from "../../types";

interface ProfileCardProps {
  profile: UserDTO;
  companyName: string;
  onEdit: () => void;
  onChangePassword: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  profile,
  companyName,
  onEdit,
  onChangePassword,
}) => {
  const { firstName, lastName, matricule, email, phone, role, status, badgesIds } = profile;

  return (
    <Card className="shadow-sm border-0 rounded-4">
      <Card.Body className="px-4 py-4">
        <div className="d-flex align-items-center mb-4">
          <div className="profile-avatar">
            {firstName.charAt(0)}
            {lastName.charAt(0)}
          </div>
          <div>
            <h5 className="mb-1 profile-name">
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
            <div className="fw-semibold profile-info-value">
              {email}
            </div>
          </Col>
          <Col md={6} className="mb-3">
            <div className="text-muted small mb-1">Phone</div>
            <div className="fw-semibold profile-info-value">
              {phone}
            </div>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col md={6} className="mb-3">
            <div className="text-muted small mb-1">Company</div>
            <div className="fw-semibold profile-info-value">
              {companyName}
            </div>
          </Col>
          <Col md={6} className="mb-3">
            <div className="text-muted small mb-1">Linked Badges</div>
            <div className="fw-semibold profile-info-value">
              {badgesIds?.length ?? 0} badge(s)
            </div>
          </Col>
        </Row>

        <div className="text-center mt-4">
          <Button
            variant="outline-primary"
            className="rounded-pill px-4 py-2 shadow-sm me-3"
            onClick={onEdit}
          >
            Update Profile
          </Button>
          <Button
            variant="outline-danger"
            className="rounded-pill px-4 py-2 shadow-sm"
            onClick={onChangePassword}
          >
            Change Password
          </Button>
        </div>
      </Card.Body>
    </Card>
  );
};

export default ProfileCard;
