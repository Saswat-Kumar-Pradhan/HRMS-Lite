import { useState } from "react";
import { createEmployee } from "../api/employees";
import { Modal, Button } from "./ui";

const DEPARTMENTS = [
    "Engineering",
    "Product",
    "Design",
    "Marketing",
    "Sales",
    "Human Resources",
    "Finance",
    "Operations",
    "Customer Support",
    "Legal",
];

const INITIAL_FORM = {
    employee_id: "",
    full_name: "",
    email: "",
    department: "",
};

export default function AddEmployeeModal({ onClose, onSuccess }) {
    const [form, setForm] = useState(INITIAL_FORM);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
        setError("");
    };

    const validate = () => {
        if (!form.employee_id.trim()) return "Employee ID is required.";
        if (!form.full_name.trim()) return "Full Name is required.";
        if (!form.email.trim()) return "Email is required.";
        const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRe.test(form.email)) return "Please enter a valid email address.";
        if (!form.department) return "Department is required.";
        return null;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const err = validate();
        if (err) { setError(err); return; }
        setLoading(true);
        try {
            await createEmployee(form);
            onSuccess();
            onClose();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal title="Add New Employee" onClose={onClose}>
            <form onSubmit={handleSubmit} noValidate>
                {error && <div className="error-message">{error}</div>}
                <div className="form-grid">
                    <div className="form-group">
                        <label>Employee ID</label>
                        <input
                            className="form-input"
                            type="text"
                            name="employee_id"
                            placeholder="e.g. EMP001"
                            value={form.employee_id}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            className="form-input"
                            type="text"
                            name="full_name"
                            placeholder="John Doe"
                            value={form.full_name}
                            onChange={handleChange}
                            required
                        />
                    </div>
                </div>
                <div className="form-group">
                    <label>Email Address</label>
                    <input
                        className="form-input"
                        type="email"
                        name="email"
                        placeholder="john@company.com"
                        value={form.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label>Department</label>
                    <select
                        className="form-select"
                        name="department"
                        value={form.department}
                        onChange={handleChange}
                        required
                    >
                        <option value="">Select department...</option>
                        {DEPARTMENTS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                        ))}
                    </select>
                </div>
                <div className="form-actions">
                    <Button variant="secondary" onClick={onClose} type="button">Cancel</Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? "Adding..." : "Add Employee"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
