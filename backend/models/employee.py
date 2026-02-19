from typing import Optional, Annotated
from pydantic import BaseModel, Field, EmailStr


class EmployeeCreate(BaseModel):
    employee_id: str = Field(..., min_length=1, description="Unique employee identifier")
    full_name: str = Field(..., min_length=1, description="Full name of the employee")
    email: EmailStr = Field(..., description="Valid email address")
    department: str = Field(..., min_length=1, description="Department name")


class EmployeeOut(EmployeeCreate):
    id: Optional[str] = Field(None, alias="_id")

    model_config = {"populate_by_name": True}
