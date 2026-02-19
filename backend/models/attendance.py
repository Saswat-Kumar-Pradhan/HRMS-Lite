from typing import Optional, Literal
from pydantic import BaseModel, Field


class AttendanceCreate(BaseModel):
    employee_id: str = Field(..., min_length=1, description="Employee ID to mark attendance for")
    date: str = Field(..., pattern=r"^\d{4}-\d{2}-\d{2}$", description="Date in YYYY-MM-DD format")
    status: Literal["Present", "Absent"] = Field(..., description="Attendance status")


class AttendanceOut(AttendanceCreate):
    id: Optional[str] = Field(None, alias="_id")
    employee_name: Optional[str] = None

    model_config = {"populate_by_name": True}


class AttendanceSummary(BaseModel):
    employee_id: str
    employee_name: str
    total_present: int
