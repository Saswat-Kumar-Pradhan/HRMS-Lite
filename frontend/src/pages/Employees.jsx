import { useState, useEffect } from "react";
import { getEmployees, deleteEmployee } from "../api/employees";
import AddEmployeeModal from "../components/AddEmployeeModal";
import { Button, LoadingSpinner, EmptyState, ErrorState, Modal } from "../components/ui";

export default function EmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showAdd, setShowAdd] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [deleting, setDeleting] = useState(false);

    const fetchEmployees = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await getEmployees();
            setEmployees(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmployees(); }, []);

    const handleDelete = async () => {
        if (!deleteTarget) return;
        setDeleting(true);
        try {
            await deleteEmployee(deleteTarget.employee_id);
            setDeleteTarget(null);
            fetchEmployees();
        } catch (err) {
            alert(err.message);
        } finally {
            setDeleting(false);
        }
    };

    return (
        <div className="fade-in-up">
            <div className="page-header">
                <div className="page-header-row">
                    <div>
                        <h2>Employees</h2>
                        <p>Manage your organization's employee records</p>
                    </div>
                    <Button variant="primary" onClick={() => setShowAdd(true)}>
                        + Add Employee
                    </Button>
                </div>
            </div>

            <div className="table-container">
                <div className="table-header">
                    <h3>
                        All Employees{" "}
                        {!loading && (
                            <span className="badge-count">{employees.length}</span>
                        )}
                    </h3>
                </div>

                {loading && <LoadingSpinner message="Loading employees..." />}
                {error && <ErrorState message={error} onRetry={fetchEmployees} />}
                {!loading && !error && employees.length === 0 && (
                    <EmptyState
                        icon="👥"
                        title="No employees yet"
                        description="Add your first employee to get started."
                        action={
                            <Button variant="primary" size="sm" onClick={() => setShowAdd(true)}>
                                + Add Employee
                            </Button>
                        }
                    />
                )}
                {!loading && !error && employees.length > 0 && (
                    <table>
                        <thead>
                            <tr>
                                <th>Employee ID</th>
                                <th>Full Name</th>
                                <th>Email</th>
                                <th>Department</th>
                                <th style={{ textAlign: "right" }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map((emp) => (
                                <tr key={emp._id}>
                                    <td>
                                        <span style={{ fontFamily: "monospace", fontSize: 13, color: "var(--accent)" }}>
                                            {emp.employee_id}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{emp.full_name}</td>
                                    <td style={{ color: "var(--text-secondary)" }}>{emp.email}</td>
                                    <td>
                                        <span
                                            style={{
                                                background: "var(--accent-soft)",
                                                color: "var(--accent)",
                                                padding: "3px 10px",
                                                borderRadius: 20,
                                                fontSize: 12,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {emp.department}
                                        </span>
                                    </td>
                                    <td style={{ textAlign: "right" }}>
                                        <button
                                            className="btn btn-icon btn-sm"
                                            onClick={() => setDeleteTarget(emp)}
                                            title="Delete employee"
                                        >
                                            🗑️
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showAdd && (
                <AddEmployeeModal
                    onClose={() => setShowAdd(false)}
                    onSuccess={fetchEmployees}
                />
            )}

            {deleteTarget && (
                <Modal title="Delete Employee" onClose={() => setDeleteTarget(null)}>
                    <p className="confirm-text">
                        Are you sure you want to delete{" "}
                        <strong>{deleteTarget.full_name}</strong> ({deleteTarget.employee_id})?
                        <br />
                        <br />
                        This will also remove all their attendance records and cannot be undone.
                    </p>
                    <div className="form-actions">
                        <Button variant="secondary" onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </Button>
                        <Button variant="danger" onClick={handleDelete} disabled={deleting}>
                            {deleting ? "Deleting..." : "Delete Employee"}
                        </Button>
                    </div>
                </Modal>
            )}
        </div>
    );
}
