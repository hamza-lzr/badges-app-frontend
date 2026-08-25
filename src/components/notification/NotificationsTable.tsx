import React from "react";
import { Table, Badge, Button, Spinner, Pagination } from "react-bootstrap";
import { OverlayTrigger, Tooltip } from "react-bootstrap";
import { formatDistanceToNow } from "date-fns";
import type { NotificationDTO, UserDTO, CompanyDTO } from "../../types";

interface NotificationsTableProps {
  loading: boolean;
  paginated: NotificationDTO[];
  employees: UserDTO[];
  companies: CompanyDTO[]; // Re-added companies prop
  handleDelete: (id?: number) => void;
  handleMarkAsRead: (id?: number) => void;
  openView: (n: NotificationDTO) => void;
  currentPage: number;
  totalPages: number;
  setCurrentPage: (page: number) => void;
}

const NotificationsTable: React.FC<NotificationsTableProps> = ({
  loading,
  paginated,
  employees,
  companies, // Destructure companies here
  handleDelete,
  handleMarkAsRead,
  openView,
  currentPage,
  totalPages,
  setCurrentPage,
}) => {
  return (
    <>
      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          <Table
            hover
            responsive
            className="shadow-sm rounded custom-table"
            style={{ tableLayout: "fixed" }}
          >
            {/* Stable widths */}
            <colgroup>
              <col style={{ width: "20%" }} /> {/* Message (narrower) */}
              <col style={{ width: "20%" }} /> {/* User */}
              <col style={{ width: "12%" }} /> {/* Status */}
              <col style={{ width: "14%" }} /> {/* Created */}
              <col style={{ width: "20%" }} /> {/* Actions */}
            </colgroup>

            <thead className="table-dark">
              <tr>
                <th className="py-2">Message</th>
                <th className="py-2">User</th>
                <th className="py-2">Status</th>
                <th className="py-2">Created</th>
                <th className="py-2 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>
              {paginated.map((n) => {
                const emp = employees.find((e) => e.id === n.userId);
                const company = emp ? companies.find((c) => c.id === emp.companyId)?.name ?? "" : ""; // Find company name
                const userLabel = emp
                  ? `${emp.firstName} ${emp.lastName} (${emp.matricule})${
                      company ? " • " + company : ""
                    }`
                  : "—";
                const createdDate = new Date(n.createdAt);

                return (
                  <tr key={n.id}>
                    {/* Message (truncated) */}
                    <td>
                      <OverlayTrigger
                        placement="top"
                        overlay={
                          <Tooltip id={`t-${n.id}`}>{n.message}</Tooltip>
                        }
                      >
                        <div className="msg-truncate" title={n.message}>
                          {n.message}
                        </div>
                      </OverlayTrigger>
                    </td>

                    {/* User */}
                    <td className="text-muted">{userLabel}</td>

                    {/* Status */}
                    <td>
                      <Badge
                        bg={n.read ? "success" : "warning"}
                        text={n.read ? undefined : "dark"}
                      >
                        {n.read ? "Read" : "Unread"}
                      </Badge>
                    </td>

                    {/* Created (clean, with relative time tooltip) */}
                    <td title={createdDate.toLocaleString()}>
                      {formatDistanceToNow(createdDate, { addSuffix: true })}
                    </td>

                    {/* Actions (fixed widths, symmetric) */}
                    <td className="text-end">
                      <div className="d-inline-grid actions-grid">
                        <Button
                          size="sm"
                          variant="outline-primary"
                          className="action-btn"
                          onClick={() => openView(n)}
                        >
                          View
                        </Button>

                        <Button
                          size="sm"
                          variant="outline-success"
                          className="action-btn"
                          onClick={() => handleMarkAsRead(n.id)}
                          disabled={!!n.read}
                        >
                          Mark as Read
                        </Button>

                        <Button
                          size="sm"
                          variant="outline-danger"
                          className="action-btn"
                          onClick={() => handleDelete(n.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center text-muted">
                    No notifications match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          {/* Pagination */}
          {totalPages > 1 && (
            <Pagination className="justify-content-center">
              <Pagination.Prev
                onClick={() => setCurrentPage(currentPage - 1)}
                disabled={currentPage === 1}
              />
              {[...Array(totalPages)].map((_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                >
                  {i + 1}
                </Pagination.Item>
              ))}
              <Pagination.Next
                onClick={() => setCurrentPage(currentPage + 1)}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          )}
        </>
      )}
    </>
  );
};

export default NotificationsTable;
