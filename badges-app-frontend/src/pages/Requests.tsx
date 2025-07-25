import React, { useEffect, useState, useMemo } from 'react';
import {
  Container,
  Row,
  Col,
  Table,
  Form,
  InputGroup,
  Button,
  Badge,
  Spinner,
  Pagination,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import type { Request, ReqStatus, UserDTO } from '../types';
import { fetchRequests, updateRequestStatus, deleteRequest } from '../api/apiRequest';
import { fetchEmployees } from '../api/ApiEmployee';

const STATUS_OPTIONS: Array<ReqStatus | 'ALL'> = ['ALL', 'PENDING', 'APPROVED', 'REJECTED'];

const RequestsPage: React.FC = () => {
  const [requests, setRequests] = useState<Request[]>([]);
  const [employees, setEmployees] = useState<UserDTO[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ReqStatus | 'ALL'>('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [reqs, emps] = await Promise.all([fetchRequests(), fetchEmployees()]);
        setRequests(reqs);
        setEmployees(emps);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getEmployeeName = (userId: number) => {
    const emp = employees.find(e => e.id === userId);
    return emp ? `${emp.firstName} ${emp.lastName}` : `#${userId}`;
  };

  const handleStatusChange = async (req: Request, status: ReqStatus) => {
    await updateRequestStatus(req.id, status);
    if (status === 'APPROVED' && req.reqType !== 'OTHER') {
      const emp = employees.find(e => e.id === req.userId)!;
      const matricule = emp.matricule;
      switch (req.reqType) {
        case 'PROFILE':
          navigate('/admin/employees', { state: { openEditModalForUser: req.userId } });
          break;
        case 'NEW_BADGE':
          navigate('/admin/badges', { state: { openGenerateModalForUser: req.userId } });
          break;
        case 'COMPANY':
          navigate('/admin/companies', { state: { highlightCompanyModal: true } });
          break;
        case 'AIRPORT_ACCESS':
          navigate('/admin/accesses', {
            state: { matriculeFilter: matricule, openAddModal: false },
          });
          break;
        default:
          break;
      }
    } else {
      setLoading(true);
      const reqs = await fetchRequests();
      setRequests(reqs);
      setLoading(false);
    }
  };
  const handleDelete = async (id: number) => {
    if (!window.confirm('Confirm deletion?')) return;
    await deleteRequest(id);
    setRequests(await fetchRequests());
  };

  const filteredRequests = useMemo(() => {
    return requests.filter(r => {
      // search
      const matchesSearch =
        r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        getEmployeeName(r.userId).toLowerCase().includes(searchQuery.toLowerCase());
      // status
      const matchesStatus = statusFilter === 'ALL' || r.reqStatus === statusFilter;
      // date range
      const created = new Date(r.createdAt);
      const fromOK = dateFrom ? created >= new Date(dateFrom) : true;
      const toOK = dateTo ? created <= new Date(dateTo) : true;
      return matchesSearch && matchesStatus && fromOK && toOK;
    });
  }, [requests, searchQuery, statusFilter, dateFrom, dateTo]);

  // pagination calculations
  const totalPages = Math.ceil(filteredRequests.length / itemsPerPage);
  const pageRequests = filteredRequests.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const badgeVariant = (status: ReqStatus) => {
    switch (status) {
      case 'PENDING': return 'warning';
      case 'APPROVED': return 'success';
      case 'REJECTED': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <Container className="py-4">
      <h2 className="mb-4">Manage Requests</h2>

      <Row className="align-items-center mb-3 g-2">
        <Col md={4} lg={3}>
          <Form.Control
            placeholder="Search description or employee…"
            value={searchQuery}
            onChange={e => { setSearchQuery(e.target.value); setCurrentPage(1); }}
          />
        </Col>
        <Col md={3} lg={2}>
          <Form.Select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value as ReqStatus | 'ALL'); setCurrentPage(1); }}
          >
            {STATUS_OPTIONS.map(s => (
              <option key={s} value={s}>
                {s === 'ALL' ? 'All' : s.charAt(0) + s.slice(1).toLowerCase()}
              </option>
            ))}
          </Form.Select>
        </Col>
        <Col md={5} lg={4}>
          <InputGroup>
            <Form.Control
              type="date"
              placeholder="From"
              value={dateFrom}
              onChange={e => { setDateFrom(e.target.value); setCurrentPage(1); }}
            />
            <Form.Control
              type="date"
              placeholder="To"
              value={dateTo}
              onChange={e => { setDateTo(e.target.value); setCurrentPage(1); }}
            />
          </InputGroup>
        </Col>
      </Row>

      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" />
        </div>
      ) : (
        <>
          <Table hover responsive size="sm" className="shadow-sm">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Description</th>
                <th>Type</th>
                <th>Status</th>
                <th>Employee</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pageRequests.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-muted py-4">
                    No requests found.
                  </td>
                </tr>
              )}
              {pageRequests.map((r, idx) => (
                <tr key={r.id}>
                  <td>{(currentPage - 1) * itemsPerPage + idx + 1}</td>
                  <td>{r.description}</td>
                  <td>{r.reqType.replace('_', ' ')}</td>
                  <td>
                    <Badge bg={badgeVariant(r.reqStatus)} pill>
                      {r.reqStatus}
                    </Badge>
                  </td>
                  <td>{getEmployeeName(r.userId)}</td>
                  <td>{r.createdAt ? new Date(r.createdAt).toLocaleString() : 'N/A'}</td>
                  <td>
                    <Button
                      size="sm"
                      variant="outline-success"
                      disabled={r.reqStatus === 'APPROVED'}
                      onClick={() => handleStatusChange(r, 'APPROVED')}
                      className="me-2"
                    >Approve</Button>
                    <Button
                      size="sm"
                      variant="outline-warning"
                      disabled={r.reqStatus === 'REJECTED'}
                      onClick={() => handleStatusChange(r, 'REJECTED')}
                      className="me-2"
                    >Reject</Button>
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => handleDelete(r.id)}
                    >Delete</Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>

          {totalPages > 1 && (
            <Pagination className="justify-content-center">
              <Pagination.Prev
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
              />
              {[...Array(totalPages)].map((_, i) => (
                <Pagination.Item
                  key={i + 1}
                  active={currentPage === i + 1}
                  onClick={() => setCurrentPage(i + 1)}
                >{i + 1}</Pagination.Item>
              ))}
              <Pagination.Next
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage === totalPages}
              />
            </Pagination>
          )}
        </>
      )}
    </Container>
  );
};

export default RequestsPage;


