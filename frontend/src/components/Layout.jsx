import { NavLink } from "react-router-dom";

const navItems = [
    { to: "/", icon: "📊", label: "Dashboard" },
    { to: "/employees", icon: "👥", label: "Employees" },
    { to: "/attendance", icon: "📅", label: "Attendance" },
];

export default function Layout({ children }) {
    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-logo">
                    <div className="sidebar-logo-icon">🏢</div>
                    <h1>HRMS Lite</h1>
                    <p>Admin Portal</p>
                </div>
                <nav className="sidebar-nav">
                    <div className="sidebar-section-label">Navigation</div>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.to === "/"}
                            className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </nav>
                <div className="sidebar-footer">
                    <p>By Saswat Kumar Pradhan</p>
                    <p style={{ marginTop: 2 }}>+91 8328841403</p>
                    <p style={{ marginTop: 2 }}><a href="https://saswatkumar.com" style={{ color: "grey" }}>&copy; saswatkumar.com | 2026</a></p>
                </div>
            </aside>
            <main className="main-content">{children}</main>
        </div>
    );
}
