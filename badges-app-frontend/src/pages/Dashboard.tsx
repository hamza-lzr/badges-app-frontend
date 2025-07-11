import React from 'react';

const stats = [
    { title: 'Employees (All Companies)', value: 1240 },
    { title: 'Badges Registered', value: 1175 },
    { title: 'Expired Badges', value: 42 },
    { title: 'Airports Registered', value: 18 },
    { title: 'Companies Registered', value: 5 },
    { title: 'Active Users', value: 1024 },
];

const recentRequests = [
    { id: 1, employee: 'John Doe', type: 'New Badge', status: 'Pending' },
    { id: 2, employee: 'Jane Smith', type: 'Renewal', status: 'Approved' },
    { id: 3, employee: 'Ali Ben', type: 'Lost Badge', status: 'Rejected' },
];

const Dashboard: React.FC = () => {
    return (
        <div className="container py-4">
            <h1 className="mb-4">Admin Dashboard</h1>

            {/* Statistics */}
            <div className="row g-4 mb-5">
                {stats.map((stat, idx) => (
                    <div key={idx} className="col-sm-6 col-lg-4">
                        <div className="card shadow-sm">
                            <div className="card-body">
                                <h6 className="text-muted">{stat.title}</h6>
                                <h3 className="fw-bold text-primary">{stat.value}</h3>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Recent Requests */}
            <div className="card shadow-sm">
                <div className="card-body">
                    <h5 className="card-title mb-4">Recent Requests</h5>
                    <div className="table-responsive">
                        <table className="table table-bordered table-hover">
                            <thead className="table-light">
                                <tr>
                                    <th>Employee</th>
                                    <th>Request Type</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentRequests.map((req) => (
                                    <tr key={req.id}>
                                        <td>{req.employee}</td>
                                        <td>{req.type}</td>
                                        <td>
                                            <span className={`badge ${getStatusClass(req.status)}`}>
                                                {req.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Bootstrap badge color logic
const getStatusClass = (status: string) => {
    switch (status) {
        case 'Pending':
            return 'bg-warning text-dark';
        case 'Approved':
            return 'bg-success';
        case 'Rejected':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
};

export default Dashboard;

