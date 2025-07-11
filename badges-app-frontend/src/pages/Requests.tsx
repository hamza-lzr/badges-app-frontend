import React, { useEffect, useState } from 'react';
import type { Request, ReqStatus } from '../types';
import { fetchRequests, updateRequestStatus, deleteRequest } from '../api/apiRequest';

const Requests: React.FC = () => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            setLoading(true);
            const data = await fetchRequests();
            setRequests(data);
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (requestId: number, status: ReqStatus) => {
        try {
            await updateRequestStatus(requestId, status);
            loadRequests(); // refresh the table after update
        } catch (error) {
            console.error(`Error updating status for request ${requestId}:`, error);
        }
    };

    const handleDelete = async (requestId: number) => {
        if (!window.confirm('Are you sure you want to delete this request?')) return;
        try {
            await deleteRequest(requestId);
            loadRequests();
        } catch (error) {
            console.error(`Error deleting request ${requestId}:`, error);
        }
    };

    return (
        <div>
            <h2 className="mb-4">Manage Requests</h2>

            {loading ? (
                <div className="text-center my-5">Loading requests...</div>
            ) : (
                <div className="table-responsive">
                    <table className="table table-bordered table-hover">
                        <thead className="table-light">
                            <tr>
                                <th>ID</th>
                                <th>Description</th>
                                <th>Type</th>
                                <th>Status</th>
                                <th>Employee ID</th>
                                <th>Created At</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map((req) => (
                                <tr key={req.id}>
                                    <td>{req.id}</td>
                                    <td>{req.description}</td>
                                    <td>{req.reqType}</td>
                                    <td>
                                        <span className={`badge ${getStatusClass(req.reqStatus)}`}>
                                            {req.reqStatus}
                                        </span>
                                    </td>
                                    <td>{req.employeeId}</td>
                                    <td>{new Date(req.createdAt).toLocaleString()}</td>
                                    <td>
                                        <div className="d-flex gap-2">
                                            <button
                                                className="btn btn-sm btn-success"
                                                onClick={() => handleStatusChange(req.id, 'APPROVED')}
                                                disabled={req.reqStatus === 'APPROVED'}
                                            >
                                                Approve
                                            </button>
                                            <button
                                                className="btn btn-sm btn-warning"
                                                onClick={() => handleStatusChange(req.id, 'REJECTED')}
                                                disabled={req.reqStatus === 'REJECTED'}
                                            >
                                                Reject
                                            </button>
                                            <button
                                                className="btn btn-sm btn-danger"
                                                onClick={() => handleDelete(req.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

// 🔍 Fonction utilitaire pour coloriser les statuts
const getStatusClass = (status: string) => {
    switch (status) {
        case 'PENDING':
            return 'bg-warning text-dark';
        case 'APPROVED':
            return 'bg-success';
        case 'REJECTED':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
};

export default Requests;
