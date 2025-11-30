import React from "react";
import { Modal, Button, Form } from "react-bootstrap";
import { Typeahead } from "react-bootstrap-typeahead";
import type { NotificationDTO } from "../../types";

type EmployeeOption = { id: number; label: string };

interface CreateNotificationModalProps {
  show: boolean;
  onHide: () => void;
  newNotification: Partial<NotificationDTO>;
  setNewNotification: React.Dispatch<React.SetStateAction<Partial<NotificationDTO>>>;
  handleCreate: (e: React.FormEvent) => void;
  employeeOptions: EmployeeOption[];
}

const CreateNotificationModal: React.FC<CreateNotificationModalProps> = ({
  show,
  onHide,
  newNotification,
  setNewNotification,
  handleCreate,
  employeeOptions,
}) => {
  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Envoyer une notification</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={handleCreate}>
          <Form.Group className="mb-3">
            <Form.Label>Message</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={newNotification.message}
              onChange={(e) =>
                setNewNotification({
                  ...newNotification,
                  message: e.target.value,
                })
              }
              style={{ resize: "vertical" }}
              required
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Collaborateur</Form.Label>

            <Typeahead
              id="employee-typeahead"
              labelKey="label"
              options={employeeOptions}
              placeholder="Rechercher par nom, matricule, société…"
              clearButton
              highlightOnlyResult
              onChange={(sel) => {
                const picked = (sel[0] as EmployeeOption | undefined)?.id ?? 0;
                setNewNotification({ ...newNotification, userId: picked });
              }}
              selected={
                newNotification.userId
                  ? employeeOptions.filter(
                      (o) => o.id === newNotification.userId
                    )
                  : []
              }
            />
            <Form.Text className="text-muted">
              Tapez pour filtrer, puis sélectionnez.
            </Form.Text>
          </Form.Group>

          <div className="text-end">
            <Button
              variant="secondary"
              onClick={onHide}
              className="me-2"
            >
              Annuler
            </Button>
            <Button type="submit" variant="primary">
              Envoyer
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default CreateNotificationModal;
