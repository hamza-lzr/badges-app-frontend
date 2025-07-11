import React from 'react';
import '../styles/index.css'; // Ensure Tailwind CSS is imported
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
        <div className="min-h-screen bg-gray-50 p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

            {/* Statistics Cards */}
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mb-10">
                {stats.map((stat, idx) => (
                    <div key={idx} className="rounded-2xl bg-white p-6 shadow hover:shadow-md transition-all">
                        <h2 className="text-gray-500 text-sm">{stat.title}</h2>
                        <p className="text-3xl font-semibold text-blue-600 mt-2">{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Recent Requests */}
            <div className="bg-white rounded-2xl shadow p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Recent Requests</h2>
                <table className="min-w-full text-sm">
                    <thead>
                        <tr className="text-gray-600 text-left">
                            <th className="py-2">Employee</th>
                            <th className="py-2">Request Type</th>
                            <th className="py-2">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentRequests.map((req) => (
                            <tr key={req.id} className="border-t">
                                <td className="py-2">{req.employee}</td>
                                <td className="py-2">{req.type}</td>
                                <td className="py-2">
                                    <span
                                        className={`px-2 py-1 rounded text-xs font-medium ${
                                            req.status === 'Pending'
                                                ? 'bg-yellow-100 text-yellow-600'
                                                : req.status === 'Approved'
                                                ? 'bg-green-100 text-green-600'
                                                : 'bg-red-100 text-red-600'
                                        }`}
                                    >
                                        {req.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Dashboard;
