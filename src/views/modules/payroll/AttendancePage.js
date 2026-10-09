import React, { useState, useEffect, useContext } from "react";
import { MainContext } from "context/MainContext";
import {
  getDailyAttendance,
  markAttendance,
  markBulkAttendance,
  getAttendanceSummary,
  getOrgId,
  ATTENDANCE_STATUSES,
  ATTENDANCE_STATUS_BADGE,
} from "service/HrService";
import { FaCalendarCheck, FaSave, FaUsers, FaCheck, FaTimes, FaClock } from "react-icons/fa";

export default function AttendancePage() {
  const { setLoading, notifySuccess, notifyError } = useContext(MainContext);
  const orgId = getOrgId();

  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().slice(0, 10));
  const [attendanceList, setAttendanceList] = useState([]);
  const [editMap, setEditMap] = useState({});
  const [summary, setSummary] = useState(null);

  const fetchDailyAttendance = async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      const res = await getDailyAttendance(orgId, selectedDate);
      const list = res.data || [];
      setAttendanceList(list);
      // Initialize edit map with current statuses
      const map = {};
      list.forEach((a) => { map[a.employeeId] = a.status || ""; });
      setEditMap(map);
    } catch (err) {
      notifyError(err.message || "Failed to load attendance");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDailyAttendance(); }, [selectedDate]);

  const handleStatusChange = (employeeId, status) => {
    setEditMap((prev) => ({ ...prev, [employeeId]: status }));
  };

  const handleBulkSave = async () => {
    const records = attendanceList
      .filter((a) => editMap[a.employeeId])
      .map((a) => ({
        employeeId: a.employeeId,
        attendanceDate: selectedDate,
        status: editMap[a.employeeId],
        organizationId: orgId,
      }));

    if (records.length === 0) {
      notifyError("No attendance to save");
      return;
    }
    try {
      setLoading(true);
      await markBulkAttendance(records);
      notifySuccess("Attendance saved successfully");
      fetchDailyAttendance();
    } catch (err) {
      notifyError(err.message || "Failed to save attendance");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAll = (status) => {
    const map = {};
    attendanceList.forEach((a) => { map[a.employeeId] = status; });
    setEditMap(map);
  };

  // Calculate stats from current edit map
  const stats = {
    total: attendanceList.length,
    present: Object.values(editMap).filter((s) => s === "PRESENT").length,
    absent: Object.values(editMap).filter((s) => s === "ABSENT").length,
    late: Object.values(editMap).filter((s) => s === "LATE").length,
    halfDay: Object.values(editMap).filter((s) => s === "HALF_DAY").length,
    onLeave: Object.values(editMap).filter((s) => s === "ON_LEAVE").length,
  };

  return (
    <div className="pt-8 pb-4 px-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <div className="flex items-center gap-3">
          <FaCalendarCheck className="text-indigo-500 text-2xl" />
          <h2 className="text-xl font-bold text-blueGray-700">Daily Attendance</h2>
        </div>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-300"
          />
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {[
          { label: "Total", count: stats.total, color: "bg-blueGray-500", icon: FaUsers },
          { label: "Present", count: stats.present, color: "bg-emerald-500", icon: FaCheck },
          { label: "Absent", count: stats.absent, color: "bg-red-500", icon: FaTimes },
          { label: "Late", count: stats.late, color: "bg-orange-500", icon: FaClock },
          { label: "Half Day", count: stats.halfDay, color: "bg-amber-500", icon: FaClock },
          { label: "On Leave", count: stats.onLeave, color: "bg-blue-500", icon: FaCalendarCheck },
        ].map((s) => (
          <div key={s.label} className="bg-white rounded-lg shadow px-4 py-3 flex items-center gap-3">
            <div className={`${s.color} text-white rounded-full p-2`}>
              <s.icon className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs text-blueGray-400 font-semibold">{s.label}</p>
              <p className="text-lg font-bold text-blueGray-700">{s.count}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        <span className="text-sm text-blueGray-500 font-semibold mr-2 pt-1">Mark All:</span>
        {ATTENDANCE_STATUSES.filter((s) => s.value !== "ON_LEAVE").map((s) => (
          <button
            key={s.value}
            onClick={() => handleMarkAll(s.value)}
            className={`text-xs px-3 py-1 rounded font-bold text-white ${ATTENDANCE_STATUS_BADGE[s.value]}`}
          >
            {s.label}
          </button>
        ))}
        <div className="flex-1" />
        <button
          onClick={handleBulkSave}
          className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-lg transition-all"
        >
          <FaSave className="inline mr-1" style={{ paddingBottom: "2px" }} /> Save Attendance
        </button>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-blueGray-50 text-blueGray-500 text-xs uppercase font-bold">
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Employee Code</th>
                <th className="px-4 py-3 text-left">Employee Name</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {attendanceList.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-blueGray-400">
                    No employee attendance data for this date
                  </td>
                </tr>
              )}
              {attendanceList.map((a, i) => (
                <tr key={a.employeeId} className="border-t hover:bg-blueGray-50 transition-colors">
                  <td className="px-4 py-3 text-sm">{i + 1}</td>
                  <td className="px-4 py-3 text-sm font-semibold">{a.employeeCode || "—"}</td>
                  <td className="px-4 py-3 text-sm">{a.employeeName || "—"}</td>
                  <td className="px-4 py-3 text-sm">{a.departmentName || "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex justify-center gap-1 flex-wrap">
                      {ATTENDANCE_STATUSES.map((s) => (
                        <button
                          key={s.value}
                          onClick={() => handleStatusChange(a.employeeId, s.value)}
                          className={`text-xs px-2 py-1 rounded font-bold border transition-all ${
                            editMap[a.employeeId] === s.value
                              ? `${ATTENDANCE_STATUS_BADGE[s.value]} text-white border-transparent`
                              : "bg-white text-blueGray-500 border-blueGray-200 hover:border-blueGray-400"
                          }`}
                        >
                          {s.label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
