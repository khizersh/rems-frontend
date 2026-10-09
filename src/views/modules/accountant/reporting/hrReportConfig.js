import {
  COLOR_HINTS,
  formatValue,
  hint,
  toBackendDate,
} from "../../admin/reporting/reportConfig";

export { COLOR_HINTS, formatValue, hint, toBackendDate };

export const HR_REPORT_BASE = "/dashboard/hr/reporting";

export const HR_REPORT_CATALOG = {
  "employee-overview": {
    endpoint: "/reporting/hr/employee-overview",
    title: "Employee Overview",
    subtitle: "Workforce composition, hiring and attrition",
    filter: "range",
  },
  "department-overview": {
    endpoint: "/reporting/hr/department-overview",
    title: "Department Overview",
    subtitle: "Department headcount, allocated budget and payroll cost",
    filter: "month",
  },
  "attendance-overview": {
    endpoint: "/reporting/hr/attendance-overview",
    title: "Attendance Overview",
    subtitle: "Today's attendance and attendance-rate trends",
    filter: "range",
  },
  "leave-overview": {
    endpoint: "/reporting/hr/leave-overview",
    title: "Leave Overview",
    subtitle: "Leave requests, approved days and pending requests",
    filter: "range",
  },
  "payroll-overview": {
    endpoint: "/reporting/hr/payroll-overview",
    title: "Payroll Overview",
    subtitle: "Monthly payroll cost, composition and top earners",
    filter: "month",
  },
  "compensation-breakdown": {
    endpoint: "/reporting/hr/compensation-breakdown",
    title: "Compensation Breakdown",
    subtitle: "Current recurring employee allowances and deductions",
    filter: "none",
  },
};

export const HR_REPORT_GROUPS = [
  {
    group: "Workforce & Attendance",
    icon: "fas fa-users",
    hint: "PRIMARY",
    items: ["employee-overview", "department-overview", "attendance-overview"],
  },
  {
    group: "Leave Management",
    icon: "fas fa-calendar-check",
    hint: "WARNING",
    items: ["leave-overview"],
  },
  {
    group: "Payroll & Compensation",
    icon: "fas fa-file-invoice-dollar",
    hint: "SUCCESS",
    items: ["payroll-overview", "compensation-breakdown"],
  },
];