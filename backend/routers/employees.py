from fastapi import APIRouter, HTTPException, status
from bson import ObjectId
from database import get_db
from models.employee import EmployeeCreate, EmployeeOut

router = APIRouter(prefix="/api/employees", tags=["employees"])


def serialize_employee(doc) -> dict:
    doc["_id"] = str(doc["_id"])
    return doc


@router.get("/", response_model=list[EmployeeOut])
async def get_employees():
    db = get_db()
    employees = []
    async for doc in db.hrms_employees.find():
        employees.append(serialize_employee(doc))
    return employees


@router.post("/", response_model=EmployeeOut, status_code=status.HTTP_201_CREATED)
async def create_employee(employee: EmployeeCreate):
    db = get_db()

    # Check for duplicate employee_id
    existing_id = await db.hrms_employees.find_one({"employee_id": employee.employee_id})
    if existing_id:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Employee with ID '{employee.employee_id}' already exists."
        )

    # Check for duplicate email
    existing_email = await db.hrms_employees.find_one({"email": employee.email})
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An employee with email '{employee.email}' already exists."
        )

    data = employee.model_dump()
    result = await db.hrms_employees.insert_one(data)
    created = await db.hrms_employees.find_one({"_id": result.inserted_id})
    return serialize_employee(created)


@router.delete("/{employee_id}", status_code=status.HTTP_200_OK)
async def delete_employee(employee_id: str):
    db = get_db()

    employee = await db.hrms_employees.find_one({"employee_id": employee_id})
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee with ID '{employee_id}' not found."
        )

    # Cascade delete attendance records
    attendance_result = await db.hrms_attendance.delete_many({"employee_id": employee_id})
    await db.hrms_employees.delete_one({"employee_id": employee_id})

    return {
        "message": f"Employee '{employee['full_name']}' deleted successfully.",
        "attendance_records_removed": attendance_result.deleted_count
    }
