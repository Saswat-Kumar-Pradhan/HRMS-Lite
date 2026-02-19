from fastapi import APIRouter, HTTPException, status, Query
from typing import Optional
from database import get_db
from models.attendance import AttendanceCreate, AttendanceOut, AttendanceSummary

router = APIRouter(prefix="/api/attendance", tags=["attendance"])


def serialize_attendance(doc) -> dict:
    doc["_id"] = str(doc["_id"])
    return doc


@router.get("/", response_model=list[AttendanceOut])
async def get_attendance(
    employee_id: Optional[str] = Query(None, description="Filter by employee ID"),
    date: Optional[str] = Query(None, description="Filter by date (YYYY-MM-DD)")
):
    db = get_db()
    query = {}
    if employee_id:
        query["employee_id"] = employee_id
    if date:
        query["date"] = date

    records = []
    async for doc in db.hrms_attendance.find(query).sort("date", -1):
        # Enrich with employee name
        employee = await db.hrms_employees.find_one({"employee_id": doc["employee_id"]})
        doc["employee_name"] = employee["full_name"] if employee else "Unknown"
        records.append(serialize_attendance(doc))
    return records


@router.post("/", response_model=AttendanceOut, status_code=status.HTTP_201_CREATED)
async def mark_attendance(attendance: AttendanceCreate):
    db = get_db()

    # Verify employee exists
    employee = await db.hrms_employees.find_one({"employee_id": attendance.employee_id})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{attendance.employee_id}' not found."
        )

    # Prevent duplicate attendance for same employee + date
    existing = await db.hrms_attendance.find_one({
        "employee_id": attendance.employee_id,
        "date": attendance.date
    })
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Attendance for employee '{attendance.employee_id}' on {attendance.date} already marked."
        )

    data = attendance.model_dump()
    result = await db.hrms_attendance.insert_one(data)
    created = await db.hrms_attendance.find_one({"_id": result.inserted_id})
    created["employee_name"] = employee["full_name"]
    return serialize_attendance(created)


@router.get("/summary", response_model=list[AttendanceSummary])
async def get_attendance_summary():
    db = get_db()
    pipeline = [
        {"$match": {"status": "Present"}},
        {"$group": {"_id": "$employee_id", "total_present": {"$sum": 1}}},
        {"$sort": {"total_present": -1}}
    ]
    summaries = []
    async for doc in db.hrms_attendance.aggregate(pipeline):
        employee = await db.hrms_employees.find_one({"employee_id": doc["_id"]})
        if employee:
            summaries.append(AttendanceSummary(
                employee_id=doc["_id"],
                employee_name=employee["full_name"],
                total_present=doc["total_present"]
            ))
    return summaries


@router.get("/today", response_model=dict)
async def get_today_stats(date: str = Query(..., description="Today's date in YYYY-MM-DD")):
    db = get_db()
    present = await db.hrms_attendance.count_documents({"date": date, "status": "Present"})
    absent = await db.hrms_attendance.count_documents({"date": date, "status": "Absent"})
    return {"present": present, "absent": absent, "date": date}
