import React, { useState } from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";

interface ChangePasswordModalProps {
  show: boolean;
  onHide: () => void;
  changing: boolean;
  onSubmit: (password: string) => Promise<void>;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  show,
  onHide,
  changing,
  onSubmit,
}) => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    onSubmit(newPassword);
  };

  return (
    <Modal show={show} onHide={onHide} centered backdrop="static" className="rounded-4 shadow-sm">
      <Modal.Header closeButton className="border-0">
        <Modal.Title className="fw-bold modal-title-custom">Change Password</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3" style={{ position: "relative" }}>
            <Form.Label className="fw-bold label-custom">New Password</Form.Label>
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
              className="password-toggle-icon"
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </div>
          </Form.Group>

          <Form.Group className="mb-3" style={{ position: "relative" }}>
            <Form.Label className="fw-bold label-custom">Confirm Password</Form.Label>
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
              onClick={onHide}
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
  );
};

export default ChangePasswordModal;
