import { useState, useEffect, useCallback } from "react";
import { getAttendance, getAttendanceSummary } from "../api/attendance";
import { getEmployees } from "../api/employees";
import { markAttendance } from "../api/attendance";
import { Badge, LoadingSpinner, EmptyState, ErrorState, Button } from "../components/ui";

const TODAY = new Date().toISOString().split("T")[0];

export default function AttendancePage() {
    const [employees, setEmployees] = useState([]);
    const [records, setRecords] = useState([]);
    const [summary, setSummary] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters
    const [filterEmployee, setFilterEmployee] = useState("");
    const [filterDate, setFilterDate] = useState("");

    // Mark form
    const [form, setForm] = useState({ employee_id: "", date: TODAY, status: "Present" });
    const [marking, setMarking] = useState(false);
    const [markError, setMarkError] = useState("");
    const [markSuccess, setMarkSuccess] = useState("");

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const [emps, recs, sum] = await Promise.all([
                getEmployees(),
                getAttendance({ employeeId: filterEmployee, date: filterDate }),
                getAttendanceSummary(),
            ]);
            setEmployees(emps);
            setRecords(recs);
            setSummary(sum);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, [filterEmployee, filterDate]);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleMarkSubmit = async (e) => {
        e.preventDefault();
        if (!form.employee_id) { setMarkError("Please select an employee."); return; }
        setMarking(true);
        setMarkError("");
        setMarkSuccess("");
        try {
            await markAttendance(form);
            setMarkSuccess(`Attendance marked successfully for ${form.date}.`);
            fetchData();
        } catch (err) {
            setMarkError(err.message);
        } finally {
            setMarking(false);
        }
    };

    const getSummaryCount = (empId) => {
        const found = summary.find((s) => s.employee_id === empId);
        return found ? found.total_present : 0;
    };

    return (
        <div className="fade-in-up">
            <div className="page-header">
                <h2>Attendance</h2>
                <p>Mark and track daily employee attendance</p>
            </div>

            {/* Mark Attendance Form */}
            <div className="card" style={{ marginBottom: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, color: "var(--text-primary)" }}>
                    📝 Mark Attendance
                </h3>
                <form onSubmit={handleMarkSubmit}>
                    {markError && <div className="error-message" style={{ marginBottom: 16 }}>{markError}</div>}
                    {markSuccess && (
                        <div
                            style={{
                                background: "var(--green-soft)",
                                border: "1px solid rgba(34,197,94,0.25)",
                                borderRadius: "var(--radius-sm)",
                                padding: "10px 14px",
                                color: "var(--green)",
                                fontSize: 13,
                                fontWeight: 500,
                                marginBottom: 16,
                            }}
                        >
                            ✅ {markSuccess}
                        </div>
                    )}
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr auto", gap: 12, alignItems: "flex-end" }}>
                        <div className="form-group">
                            <label>Employee</label>
                            <select
                                className="form-select"
                                value={form.employee_id}
                                onChange={(e) => { setForm((p) => ({ ...p, employee_id: e.target.value })); setMarkError(""); setMarkSuccess(""); }}
                            >
                                <option value="">Select employee...</option>
                                {employees.map((emp) => (
                                    <option key={emp.employee_id} value={emp.employee_id}>
                                        {emp.full_name} ({emp.employee_id})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Date</label>
                            <input
                                className="form-input"
                                type="date"
                                value={form.date}
                                onChange={(e) => { setForm((p) => ({ ...p, date: e.target.value })); setMarkSuccess(""); }}
                            />
                        </div>
                        <div className="form-group">
                            <label>Status</label>
                            <select
                                className="form-select"
                                value={form.status}
                                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                            >
                                <option value="Present">Present</option>
                                <option value="Absent">Absent</option>
                            </select>
                        </div>
                        <Button variant="primary" type="submit" disabled={marking}>
                            {marking ? "Saving..." : "Mark"}
                        </Button>
                    </div>
                </form>
            </div>

            {/* Filters */}
            <div className="table-container">
                <div className="table-header">
                    <h3>
                        Attendance Records{" "}
                        {!loading && <span className="badge-count">{records.length}</span>}
                    </h3>
                    <div className="filter-row">
                        <select
                            className="form-select"
                            value={filterEmployee}
                            onChange={(e) => setFilterEmployee(e.target.value)}
                            style={{ minWidth: 180 }}
                        >
                            <option value="">All employees</option>
                            {employees.map((emp) => (
                                <option key={emp.employee_id} value={emp.employee_id}>
                                    {emp.full_name}
                                </option>
                            ))}
                        </select>
                        <input
                            className="form-input"
                            type="date"
                            value={filterDate}
                            onChange={(e) => setFilterDate(e.target.value)}
                            style={{ width: "auto" }}
                        />
                        {(filterEmployee || filterDate) && (
                            <Button variant="secondary" size="sm" onClick={() => { setFilterEmployee(""); setFilterDate(""); }}>
                                Clear
                            </Button>
                        )}
                    </div>
                </div>

                {loading && <LoadingSpinner message="Loading attendance records..." />}
                {error && <ErrorState message={error} onRetry={fetchData} />}
                {!loading && !error && records.length === 0 && (
                    <EmptyState
                        icon="📅"
                        title="No attendance records"
                        description={filterEmployee || filterDate ? "No records match your filters." : "Start by marking attendance above."}
                    />
                )}
                {!loading && !error && records.length > 0 && (
                    <table>
                        <thead>
                            <tr>
                                <th>Employee ID</th>
                                <th>Name</th>
                                <th>Date</th>
                                <th>Status</th>
                                <th>Present Days</th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.map((rec) => (
                                <tr key={rec._id}>
                                    <td>
                                        <span style={{ fontFamily: "monospace", fontSize: 13, color: "var(--accent)" }}>
                                            {rec.employee_id}
                                        </span>
                                    </td>
                                    <td style={{ fontWeight: 600 }}>{rec.employee_name || "—"}</td>
                                    <td style={{ color: "var(--text-secondary)" }}>
                                        {new Date(rec.date + "T00:00:00").toLocaleDateString("en-IN", {
                                            day: "2-digit", month: "short", year: "numeric",
                                        })}
                                    </td>
                                    <td><Badge status={rec.status} /></td>
                                    <td>
                                        <span className="badge-count">
                                            {getSummaryCount(rec.employee_id)} days
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
