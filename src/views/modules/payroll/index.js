/**
 * HR & Payroll Module
 * 
 * Components:
 * - HrDashboard: Overview with stats, department salary, pending leaves
 * - DepartmentList: Department CRUD management
 * - EmployeeList: Employee listing with search/filter
 * - AddEmployee: Create or edit an employee (personal, job, bank, allowances, deductions)
 * - AttendancePage: Daily attendance marking with bulk save
 * - LeaveList: Leave management with apply/approve/reject
 * - SalaryAmendments: Monthly salary additions and deductions
 * - PayrollPage: Process payroll, view salary slips, payroll history
 * 
 * Routes (under /dashboard/hr):
 * - /dashboard/hr                    - HR Dashboard
 * - /dashboard/hr/departments        - Department List
 * - /dashboard/hr/employees          - Employee List
 * - /dashboard/hr/add-employee       - Add Employee
 * - /dashboard/hr/edit-employee/:id  - Edit Employee
 * - /dashboard/hr/attendance         - Attendance
 * - /dashboard/hr/leaves             - Leave Management
 * - /dashboard/hr/amendments         - Salary Amendments
 * - /dashboard/hr/payroll            - Payroll
 */

export { default as HrDashboard } from './HrDashboard';
export { default as DepartmentList } from './DepartmentList';
export { default as EmployeeList } from './EmployeeList';
export { default as AddEmployee } from './AddEmployee';
export { default as UpdateEmployee } from './UpdateEmployee';
export { default as ViewEmployee } from './ViewEmployee';
export { default as AttendancePage } from './AttendancePage';
export { default as LeaveList } from './LeaveList';
export { default as SalaryAmendments } from './SalaryAmendments';
export { default as PayrollPage } from './PayrollPage';
