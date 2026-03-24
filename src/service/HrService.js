import httpService from "../utility/httpService";

/**
 * HR & Payroll Module Service
 * Handles all Department, Employee, Attendance, Leave, Salary Amendment, 
 * Payroll, and Dashboard API calls.
 * Base: /hr
 */

// ─── HELPERS ────────────────────────────────────────────

export const getOrgId = () => {
  const org = JSON.parse(localStorage.getItem("organization") || "{}");
  return org.organizationId;
};

export const formatCurrency = (amount) => {
  if (amount == null) return "—";
  return Number(amount).toLocaleString("en-PK", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

export const EMPLOYEE_STATUS_BADGE = {
  ACTIVE: "bg-emerald-500",
  INACTIVE: "bg-amber-500",
  TERMINATED: "bg-red-500",
  ON_LEAVE: "bg-blue-500",
};

export const ATTENDANCE_STATUS_BADGE = {
  PRESENT: "bg-emerald-500",
  ABSENT: "bg-red-500",
  HALF_DAY: "bg-amber-500",
  LATE: "bg-orange-500",
  ON_LEAVE: "bg-blue-500",
};

export const LEAVE_STATUS_BADGE = {
  PENDING: "bg-amber-500",
  APPROVED: "bg-emerald-500",
  REJECTED: "bg-red-500",
  CANCELLED: "bg-gray-500",
};

export const SALARY_SLIP_STATUS_BADGE = {
  GENERATED: "bg-amber-500",
  PAID: "bg-emerald-500",
  CANCELLED: "bg-red-500",
};

export const PAYROLL_STATUS_BADGE = {
  DRAFT: "bg-gray-500",
  PROCESSING: "bg-amber-500",
  COMPLETED: "bg-emerald-500",
  CANCELLED: "bg-red-500",
};

export const EMPLOYMENT_TYPES = [
  { value: "FULL_TIME", label: "Full Time" },
  { value: "PART_TIME", label: "Part Time" },
  { value: "CONTRACT", label: "Contract" },
  { value: "INTERN", label: "Intern" },
];

export const GENDERS = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

export const ATTENDANCE_STATUSES = [
  { value: "PRESENT", label: "Present" },
  { value: "ABSENT", label: "Absent" },
  { value: "HALF_DAY", label: "Half Day" },
  { value: "LATE", label: "Late" },
  { value: "ON_LEAVE", label: "On Leave" },
];

export const LEAVE_TYPES = [
  { value: "ANNUAL", label: "Annual" },
  { value: "SICK", label: "Sick" },
  { value: "CASUAL", label: "Casual" },
  { value: "MATERNITY", label: "Maternity" },
  { value: "PATERNITY", label: "Paternity" },
  { value: "UNPAID", label: "Unpaid" },
];

export const AMENDMENT_TYPES = [
  { value: "ADDITION", label: "Addition" },
  { value: "DEDUCTION", label: "Deduction" },
];

export const MONTHS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

// ─── DEPARTMENT APIs ────────────────────────────────────

export const createDepartment = async (data) => {
  return httpService.post("/hr/department/create", data);
};

export const updateDepartment = async (id, data) => {
  return httpService.put(`/hr/department/update/${id}`, data);
};

export const getDepartmentById = async (id) => {
  return httpService.get(`/hr/department/${id}`);
};

export const getDepartmentsByOrg = async (orgId, page = 0, size = 10, sortBy = "createdDate", sortDir = "desc") => {
  return httpService.get(`/hr/department/organization/${orgId}?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
};

export const getActiveDepartments = async (orgId) => {
  return httpService.get(`/hr/department/active/${orgId}`);
};

export const searchDepartments = async (orgId, name, page = 0, size = 10) => {
  return httpService.get(`/hr/department/search/${orgId}?name=${encodeURIComponent(name)}&page=${page}&size=${size}`);
};

export const deleteDepartment = async (id) => {
  return httpService.delete(`/hr/department/delete/${id}`);
};

// ─── EMPLOYEE APIs ──────────────────────────────────────

export const createEmployee = async (data) => {
  return httpService.post("/hr/employee/create", data);
};

export const updateEmployee = async (id, data) => {
  return httpService.put(`/hr/employee/update/${id}`, data);
};

export const getEmployeeById = async (id) => {
  return httpService.get(`/hr/employee/${id}`);
};

export const getEmployeesByOrg = async (orgId, page = 0, size = 10, sortBy = "fullName", sortDir = "asc") => {
  return httpService.get(`/hr/employee/organization/${orgId}?page=${page}&size=${size}&sortBy=${sortBy}&sortDir=${sortDir}`);
};

export const getEmployeesByDept = async (orgId, deptId, page = 0, size = 10) => {
  return httpService.get(`/hr/employee/department/${orgId}/${deptId}?page=${page}&size=${size}`);
};

export const searchEmployees = async (orgId, keyword, page = 0, size = 10) => {
  return httpService.get(`/hr/employee/search/${orgId}?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);
};

export const terminateEmployee = async (id) => {
  return httpService.put(`/hr/employee/terminate/${id}`, {});
};

export const deleteEmployee = async (id) => {
  return httpService.delete(`/hr/employee/delete/${id}`);
};

// ─── ATTENDANCE APIs ────────────────────────────────────

export const markAttendance = async (data) => {
  return httpService.post("/hr/attendance/mark", data);
};

export const markBulkAttendance = async (data) => {
  return httpService.post("/hr/attendance/mark-bulk", data);
};

export const updateAttendance = async (id, data) => {
  return httpService.put(`/hr/attendance/update/${id}`, data);
};

export const getEmployeeAttendance = async (empId, page = 0, size = 30) => {
  return httpService.get(`/hr/attendance/employee/${empId}?page=${page}&size=${size}&sortBy=attendanceDate&sortDir=desc`);
};

export const getAttendanceRange = async (empId, startDate, endDate) => {
  return httpService.get(`/hr/attendance/employee/${empId}/range?startDate=${startDate}&endDate=${endDate}`);
};

export const getDailyAttendance = async (orgId, date) => {
  return httpService.get(`/hr/attendance/daily/${orgId}?date=${date}`);
};

export const getAttendanceSummary = async (empId, startDate, endDate) => {
  return httpService.get(`/hr/attendance/summary/${empId}?startDate=${startDate}&endDate=${endDate}`);
};

export const deleteAttendance = async (id) => {
  return httpService.delete(`/hr/attendance/delete/${id}`);
};

// ─── LEAVE APIs ─────────────────────────────────────────

export const applyLeave = async (data) => {
  return httpService.post("/hr/leave/apply", data);
};

export const approveLeave = async (id, approvedBy) => {
  return httpService.put(`/hr/leave/approve/${id}?approvedBy=${encodeURIComponent(approvedBy)}`, {});
};

export const rejectLeave = async (id, rejectedBy) => {
  return httpService.put(`/hr/leave/reject/${id}?rejectedBy=${encodeURIComponent(rejectedBy)}`, {});
};

export const cancelLeave = async (id) => {
  return httpService.put(`/hr/leave/cancel/${id}`, {});
};

export const getLeaveById = async (id) => {
  return httpService.get(`/hr/leave/${id}`);
};

export const getLeavesByEmployee = async (empId, page = 0, size = 10) => {
  return httpService.get(`/hr/leave/employee/${empId}?page=${page}&size=${size}&sortBy=createdDate&sortDir=desc`);
};

export const getLeavesByOrg = async (orgId, page = 0, size = 10) => {
  return httpService.get(`/hr/leave/organization/${orgId}?page=${page}&size=${size}&sortBy=createdDate&sortDir=desc`);
};

export const getPendingLeaves = async (orgId, page = 0, size = 10) => {
  return httpService.get(`/hr/leave/pending/${orgId}?page=${page}&size=${size}&sortBy=createdDate&sortDir=desc`);
};

export const deleteLeave = async (id) => {
  return httpService.delete(`/hr/leave/delete/${id}`);
};

// ─── SALARY AMENDMENT APIs ──────────────────────────────

export const createAmendment = async (data) => {
  return httpService.post("/hr/salary-amendment/create", data);
};

export const updateAmendment = async (id, data) => {
  return httpService.put(`/hr/salary-amendment/update/${id}`, data);
};

export const getAmendmentsByEmployee = async (empId) => {
  return httpService.get(`/hr/salary-amendment/employee/${empId}`);
};

export const getAmendmentsByOrg = async (orgId, month, year) => {
  return httpService.get(`/hr/salary-amendment/organization/${orgId}?month=${month}&year=${year}`);
};

export const deleteAmendment = async (id) => {
  return httpService.delete(`/hr/salary-amendment/delete/${id}`);
};

// ─── PAYROLL & SALARY SLIP APIs ─────────────────────────

export const processPayroll = async (data) => {
  return httpService.post("/hr/payroll/process", data);
};

export const generateSlip = async (empId, month, year) => {
  return httpService.post(`/hr/payroll/generate-slip/${empId}?month=${month}&year=${year}`, {});
};

export const getSalarySlipById = async (id) => {
  return httpService.get(`/hr/payroll/salary-slip/${id}`);
};

export const getSlipsByEmployee = async (empId, page = 0, size = 12) => {
  return httpService.get(`/hr/payroll/salary-slips/employee/${empId}?page=${page}&size=${size}&sortBy=salaryYear&sortDir=desc`);
};

export const getSlipsByOrgMonth = async (orgId, month, year) => {
  return httpService.get(`/hr/payroll/salary-slips/organization/${orgId}?month=${month}&year=${year}`);
};

export const markSlipPaid = async (id) => {
  return httpService.put(`/hr/payroll/salary-slip/mark-paid/${id}`, {});
};

export const markAllSlipsPaid = async (orgId, month, year) => {
  return httpService.put(`/hr/payroll/salary-slips/mark-all-paid/${orgId}?month=${month}&year=${year}`, {});
};

export const getPayrollHistory = async (orgId, page = 0, size = 12) => {
  return httpService.get(`/hr/payroll/history/${orgId}?page=${page}&size=${size}&sortBy=createdDate&sortDir=desc`);
};

export const cancelPayroll = async (payrollId) => {
  return httpService.put(`/hr/payroll/cancel/${payrollId}`, {});
};

// ─── DASHBOARD & ANALYTICS APIs ─────────────────────────

export const getHRDashboard = async (orgId) => {
  return httpService.get(`/hr/payroll/dashboard/${orgId}`);
};

export const getDeptSalarySummary = async (orgId) => {
  return httpService.get(`/hr/payroll/department-salary-summary/${orgId}`);
};
