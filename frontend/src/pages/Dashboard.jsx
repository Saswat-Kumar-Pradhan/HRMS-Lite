import { useState, useEffect } from "react";
import { getEmployees } from "../api/employees";
import { getAttendance, getTodayStats, getAttendanceSummary } from "../api/attendance";
import { LoadingSpinner, ErrorState } from "../components/ui";
import { Link } from "react-router-dom";

const TODAY = new Date().toISOString().split("T")[0];

function StatCard({ icon, label, value, colorClass, linkTo }) {
    const card = (
        <div className="stat-card">
            <div className={`stat-icon ${colorClass}`}>{icon}</div>
            <div>
                <div className="stat-value">{value}</div>
                <div className="stat-label">{label}</div>
            </div>
        </div>
    );
    return linkTo ? <Link to={linkTo} style={{ textDecoration: "none" }}>{card}</Link> : card;
}

export default function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const fetchAll = async () => {
        setLoading(true);
        setError(null);
        try {
            const [employees, allAttendance, todayStats, summary] = await Promise.all([
                getEmployees(),
                getAttendance({}),
                getTodayStats(TODAY),
                getAttendanceSummary(),
            ]);
            setData({ employees, allAttendance, todayStats, summary });
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchAll(); }, []);

    if (loading) return <LoadingSpinner message="Loading dashboard..." />;
    if (error) return <ErrorState message={error} onRetry={fetchAll} />;

    const { employees, allAttendance, todayStats, summary } = data;
    const recent = allAttendance.slice(0, 10);

    const todayLabel = new Date().toLocaleDateString("en-IN", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
    });

    return (
        <div className="fade-in-up">
            <div className="page-header">
                <h2>Dashboard</h2>
                <p>{todayLabel}</p>
            </div>

            <div className="stats-grid">
                <StatCard icon="👥" label="Total Employees" value={employees.length} colorClass="indigo" linkTo="/employees" />
                <StatCard icon="✅" label="Present Today" value={todayStats.present} colorClass="green" linkTo="/attendance" />
                <StatCard icon="❌" label="Absent Today" value={todayStats.absent} colorClass="red" linkTo="/attendance" />
                <StatCard icon="📋" label="Total Records" value={allAttendance.length} colorClass="blue" linkTo="/attendance" />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                {/* Recent Attendance */}
                <div className="table-container">
                    <div className="table-header">
                        <h3>Recent Attendance</h3>
                        <Link to="/attendance" style={{ fontSize: 13, color: "var(--accent)", textDecoration: "none", fontWeight: 600 }}>
                            View all →
                        </Link>
                    </div>
                    {recent.length === 0 ? (
                        <div className="state-container" style={{ padding: "32px 20px" }}>
                            <p className="state-title" style={{ fontSize: 13 }}>No attendance records yet</p>
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>Name</th>
                                    <th>Date</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.map((rec) => (
                                    <tr key={rec._id}>
                                        <td style={{ fontWeight: 600, fontSize: 13 }}>{rec.employee_name}</td>
                                        <td style={{ color: "var(--text-secondary)", fontSize: 13 }}>
                                            {new Date(rec.date + "T00:00:00").toLocaleDateString("en-IN", {
                                                day: "2-digit", month: "short",
                                            })}
                                        </td>
                                        <td>
                                            <span
                                                style={{
                                                    fontSize: 12,
                                                    fontWeight: 600,
                                                    color: rec.status === "Present" ? "var(--green)" : "var(--red)",
                                                }}
                                            >
                                                {rec.status === "Present" ? "✅" : "❌"} {rec.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {/* Attendance Summary */}
                <div className="table-container">
                    <div className="table-header">
                        <h3>Top Attendance</h3>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>By present days</span>
                    </div>
                    {summary.length === 0 ? (
                        <div className="state-container" style={{ padding: "32px 20px" }}>
                            <p className="state-title" style={{ fontSize: 13 }}>No data available yet</p>
                        </div>
                    ) : (
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Present Days</th>
                                </tr>
                            </thead>
                            <tbody>
                                {summary.slice(0, 8).map((s, i) => (
                                    <tr key={s.employee_id}>
                                        <td style={{ color: "var(--text-muted)", fontSize: 13, width: 40 }}>{i + 1}</td>
                                        <td style={{ fontWeight: 600, fontSize: 13 }}>{s.employee_name}</td>
                                        <td>
                                            <span className="badge-count">{s.total_present} days</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
}
