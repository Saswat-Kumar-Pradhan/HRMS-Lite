const API_BASE = "http://localhost:8000/api/employees";

export async function getEmployees() {
    const res = await fetch(API_BASE);
    if (!res.ok) throw new Error("Failed to fetch employees");
    return res.json();
}

export async function createEmployee(data) {
    const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || "Failed to create employee");
    return json;
}

export async function deleteEmployee(employeeId) {
    const res = await fetch(`${API_BASE}/${employeeId}`, { method: "DELETE" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || "Failed to delete employee");
    return json;
}
