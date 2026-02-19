const API_BASE = "http://localhost:8000/api/attendance";

export async function getAttendance({ employeeId, date } = {}) {
    const params = new URLSearchParams();
    if (employeeId) params.append("employee_id", employeeId);
    if (date) params.append("date", date);
    const url = `${API_BASE}?${params.toString()}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("Failed to fetch attendance");
    return res.json();
}

export async function markAttendance(data) {
    const res = await fetch(API_BASE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.detail || "Failed to mark attendance");
    return json;
}

export async function getAttendanceSummary() {
    const res = await fetch(`${API_BASE}/summary`);
    if (!res.ok) throw new Error("Failed to fetch summary");
    return res.json();
}

export async function getTodayStats(date) {
    const res = await fetch(`${API_BASE}/today?date=${date}`);
    if (!res.ok) throw new Error("Failed to fetch today stats");
    return res.json();
}
