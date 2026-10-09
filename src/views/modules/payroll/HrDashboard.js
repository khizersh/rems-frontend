import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import { MainContext } from "context/MainContext";
import {
  getHRDashboard,
  getDeptSalarySummary,
  getPendingLeaves,
  getOrgId,
  formatCurrency,
  LEAVE_STATUS_BADGE,
  LEAVE_TYPES,
} from "service/HrService";
import { FaUsers, FaUserCheck, FaBuilding, FaMoneyBillWave, FaClock, FaUserTimes, FaFileInvoiceDollar, FaCalendarCheck } from "react-icons/fa";

export default function HrDashboard() {
  const { setLoading, notifyError } = useContext(MainContext);
  const history = useHistory();
  const orgId = getOrgId();

  const [dashboard, setDashboard] = useState(null);
  const [deptSummary, setDeptSummary] = useState([]);
  const [pendingLeaves, setPendingLeaves] = useState([]);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const res = await getHRDashboard(orgId);
      setDashboard(res.data);
    } catch (err) {
      notifyError(err.message || "Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  const fetchDeptSummary = async () => {
    try {
      const res = await getDeptSalarySummary(orgId);
      setDeptSummary(res.data || []);
    } catch {
      // silent
    }
  };

  const fetchPendingLeaves = async () => {
    try {
      const res = await getPendingLeaves(orgId, 0, 5);
      setPendingLeaves(res.data?.content || []);
    } catch {
      // silent
    }
  };

  useEffect(() => {
    if (orgId) {
      fetchDashboard();
      fetchDeptSummary();
      fetchPendingLeaves();
    }
  }, []);

  const cards = dashboard
    ? [
        { title: "Total Employees", value: dashboard.totalEmployees, icon: FaUsers, color: "bg-blue-500", link: "/dashboard/hr/employees" },
        { title: "Active Employees", value: dashboard.activeEmployees, icon: FaUserCheck, color: "bg-emerald-500", link: "/dashboard/hr/employees" },
        { title: "Departments", value: dashboard.totalDepartments, icon: FaBuilding, color: "bg-indigo-500", link: "/dashboard/hr/departments" },
        { title: "Monthly Payroll", value: `Rs ${formatCurrency(dashboard.totalMonthlyPayroll)}`, icon: FaMoneyBillWave, color: "bg-teal-500", link: "/dashboard/hr/payroll" },
        { title: "Pending Leaves", value: dashboard.pendingLeaveRequests, icon: FaClock, color: "bg-amber-500", link: "/dashboard/hr/leaves" },
        { title: "Present Today", value: dashboard.presentToday, icon: FaCalendarCheck, color: "bg-green-500", link: "/dashboard/hr/attendance" },
        { title: "Absent Today", value: dashboard.absentToday, icon: FaUserTimes, color: "bg-red-500", link: "/dashboard/hr/attendance" },
        { title: "Payslips This Month", value: dashboard.payslipsGeneratedThisMonth, icon: FaFileInvoiceDollar, color: "bg-cyan-500", link: "/dashboard/hr/payroll" },
      ]
    : [];

  const maxBudget = Math.max(...deptSummary.map((d) => d.budgetAllocated || 0), 1);

  return (
    <div className="pt-8 pb-4">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8 px-4">
        {cards.map((card, idx) => (
          <div
            key={idx}
            onClick={() => history.push(card.link)}
            className="bg-white rounded-lg shadow-md p-5 flex items-center gap-4 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className={`${card.color} text-white rounded-full p-3`}>
              <card.icon className="text-xl" />
            </div>
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold tracking-wide">{card.title}</p>
              <p className="text-xl font-bold text-gray-800">{card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 px-4">
        {/* Department Salary Summary */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-5">
          <h3 className="font-semibold text-base text-gray-700 mb-4 flex items-center gap-2">
            <FaBuilding className="text-indigo-500" /> Department Salary Overview
          </h3>
          {deptSummary.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No data available</p>
          ) : (
            <div className="space-y-3">
              {deptSummary.map((dept) => {
                const pct = dept.budgetAllocated > 0 ? Math.min((dept.totalNetSalary / dept.budgetAllocated) * 100, 100) : 0;
                return (
                  <div key={dept.departmentId}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-gray-700">{dept.departmentName}</span>
                      <span className="text-gray-500">
                        Rs {formatCurrency(dept.totalNetSalary)}
                        {dept.budgetAllocated > 0 && (
                          <span className="text-xs text-gray-400"> / {formatCurrency(dept.budgetAllocated)}</span>
                        )}
                      </span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5">
                      <div
                        className={`h-2.5 rounded-full transition-all ${pct > 90 ? "bg-red-500" : pct > 70 ? "bg-amber-500" : "bg-emerald-500"}`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>{dept.employeeCount} employees</span>
                      <span>{pct.toFixed(0)}% of budget</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Pending Leaves */}
        <div className="bg-white rounded-lg shadow-md p-5">
          <h3 className="font-semibold text-base text-gray-700 mb-4 flex items-center gap-2">
            <FaClock className="text-amber-500" /> Pending Leave Requests
          </h3>
          {pendingLeaves.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">No pending requests</p>
          ) : (
            <div className="space-y-3">
              {pendingLeaves.map((leave) => (
                <div
                  key={leave.id}
                  onClick={() => history.push("/dashboard/hr/leaves")}
                  className="p-3 bg-gray-50 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-gray-700">Employee #{leave.employeeId}</p>
                      <p className="text-xs text-gray-500">
                        {LEAVE_TYPES.find((t) => t.value === leave.leaveType)?.label || leave.leaveType}
                      </p>
                    </div>
                    <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-medium">
                      {leave.totalDays} days
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {leave.startDate} → {leave.endDate}
                  </p>
                </div>
              ))}
              <button
                onClick={() => history.push("/dashboard/hr/leaves")}
                className="w-full text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium py-2"
              >
                View All Leaves →
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 px-4">
        <div className="bg-white rounded-lg shadow-md p-5">
          <h3 className="font-semibold text-base text-gray-700 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Mark Attendance", path: "/dashboard/hr/attendance", icon: "📅", bg: "bg-blue-50 text-blue-700 hover:bg-blue-100" },
              { label: "Add Employee", path: "/dashboard/hr/add-employee", icon: "👤", bg: "bg-emerald-50 text-emerald-700 hover:bg-emerald-100" },
              { label: "Process Payroll", path: "/dashboard/hr/payroll", icon: "💰", bg: "bg-teal-50 text-teal-700 hover:bg-teal-100" },
              { label: "Leave Requests", path: "/dashboard/hr/leaves", icon: "🌴", bg: "bg-amber-50 text-amber-700 hover:bg-amber-100" },
              { label: "Departments", path: "/dashboard/hr/departments", icon: "🏛️", bg: "bg-indigo-50 text-indigo-700 hover:bg-indigo-100" },
              { label: "Payroll History", path: "/dashboard/hr/payroll-history", icon: "📊", bg: "bg-cyan-50 text-cyan-700 hover:bg-cyan-100" },
            ].map((action, i) => (
              <button
                key={i}
                onClick={() => history.push(action.path)}
                className={`${action.bg} px-4 py-2.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2`}
              >
                <span>{action.icon}</span> {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
