import React from "react";
import { Form, Card, Row, Col } from "react-bootstrap";

interface NotificationFiltersProps {
  filters: {
    user: string;
    company: string;
    status: "all" | "read" | "unread";
    from: string;
    to: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      user: string;
      company: string;
      status: "all" | "read" | "unread";
      from: string;
      to: string;
    }>
  >;
  setCurrentPage: (page: number) => void;
}

const NotificationFilters: React.FC<NotificationFiltersProps> = ({
  filters,
  setFilters,
  setCurrentPage,
}) => {
  return (
    <Card className="mb-4">
      <Card.Body>
        <Row className="g-2">
          {[
            { label: "From", type: "date", value: filters.from, key: "from" },
            { label: "To", type: "date", value: filters.to, key: "to" },
            {
              label: "Employee",
              type: "text",
              value: filters.user,
              key: "user",
              placeholder: "Name or matricule",
            },
            {
              label: "Company",
              type: "text",
              value: filters.company,
              key: "company",
            },
          ].map(({ label, type, value, key, placeholder }) => (
            <Col md key={key}>
              <Form.Label>{label}</Form.Label>
              <Form.Control
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => {
                  setFilters({ ...filters, [key]: e.target.value });
                  setCurrentPage(1);
                }}
              />
            </Col>
          ))}
          <Col md>
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={filters.status}
              onChange={(e) => {
                setFilters({
                  ...filters,
                  status: e.target.value as "all" | "read" | "unread",
                });
                setCurrentPage(1);
              }}
            >
              <option value="all">All</option>
              <option value="read">Read</option>
              <option value="unread">Unread</option>
            </Form.Select>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default NotificationFilters;