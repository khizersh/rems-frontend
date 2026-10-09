import React, { useState, useEffect, useContext } from "react";
import { MainContext } from "context/MainContext";
import {
  processPayroll,
  getSlipsByOrgMonth,
  markSlipPaid,
  markAllSlipsPaid,
  getPayrollHistory,
  cancelPayroll,
  getOrgId,
  formatCurrency,
  SALARY_SLIP_STATUS_BADGE,
  PAYROLL_STATUS_BADGE,
  MONTHS,
} from "service/HrService";
import { FaPlay, FaMoneyCheckAlt, FaCheckDouble, FaHistory, FaEye, FaBan } from "react-icons/fa";

export default function PayrollPage() {
  const { setLoading, notifySuccess, notifyError } = useContext(MainContext);
  const orgId = getOrgId();
  const now = new Date();

  const [tab, setTab] = useState("PROCESS"); // PROCESS | SLIPS | HISTORY
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());

  // Salary Slips
  const [slips, setSlips] = useState([]);
  const [slipLoading, setSlipLoading] = useState(false);

  // Payroll History
  const [history, setHistory] = useState([]);
  const [histPage, setHistPage] = useState(0);
  const [histTotal, setHistTotal] = useState(0);

  // Selected slip detail
  const [selectedSlip, setSelectedSlip] = useState(null);

  const fetchSlips = async () => {
    if (!orgId) return;
    try {
      setSlipLoading(true);
      setLoading(true);
      const res = await getSlipsByOrgMonth(orgId, month, year);
      setSlips(res.data || []);
    } catch (err) {
      notifyError(err.message || "Failed to load salary slips");
    } finally {
      setSlipLoading(false);
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    if (!orgId) return;
    try {
      setLoading(true);
      const res = await getPayrollHistory(orgId, histPage, 10);
      const pg = res.data;
      setHistory(pg?.content || (Array.isArray(pg) ? pg : []));
      setHistTotal(pg?.totalElements || 0);
    } catch (err) {
      notifyError(err.message || "Failed to load payroll history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tab === "SLIPS") fetchSlips();
    if (tab === "HISTORY") fetchHistory();
  }, [tab, month, year, histPage]);

  const handleProcessPayroll = async () => {
    if (!window.confirm(`Process payroll for ${MONTHS.find((m) => m.value === month)?.label} ${year}?`)) return;
    try {
      setLoading(true);
      await processPayroll({ organizationId: orgId, month, year });
      notifySuccess("Payroll processed successfully");
      setTab("SLIPS");
    } catch (err) {
      notifyError(err.message || "Payroll processing failed");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkPaid = async (slip) => {
    try {
      setLoading(true);
      await markSlipPaid(slip.id);
      notifySuccess("Slip marked as paid");
      fetchSlips();
    } catch (err) {
      notifyError(err.message || "Failed to mark paid");
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAllPaid = async () => {
    if (!window.confirm("Mark all generated slips as paid?")) return;
    try {
      setLoading(true);
      await markAllSlipsPaid(orgId, month, year);
      notifySuccess("All slips marked as paid");
      fetchSlips();
    } catch (err) {
      notifyError(err.message || "Failed");
    } finally {
      setLoading(false);
    }
  };

  const handleCancelPayroll = async (payroll) => {
    if (!window.confirm("Cancel this payroll run? All generated slips will be cancelled.")) return;
    try {
      setLoading(true);
      await cancelPayroll(payroll.id);
      notifySuccess("Payroll cancelled");
      fetchHistory();
    } catch (err) {
      notifyError(err.message || "Cancel failed");
    } finally {
      setLoading(false);
    }
  };

  // Statistics from slips
  const slipStats = {
    total: slips.length,
    generated: slips.filter((s) => s.status === "GENERATED").length,
    paid: slips.filter((s) => s.status === "PAID").length,
    totalNet: slips.reduce((sum, s) => sum + (s.netSalary || 0), 0),
  };

  const inputClass = "border rounded px-3 py-2 text-sm focus:outline-none focus:ring focus:border-blue-300";

  return (
    <div className="pt-8 pb-4 px-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6 gap-4">
        <h2 className="text-xl font-bold text-blueGray-700">
          <FaMoneyCheckAlt className="inline text-indigo-500 mr-2" /> Payroll Management
        </h2>
        <div className="flex gap-3 items-end">
          <div>
            <label className="block text-xs text-gray-500 font-semibold mb-1">Month</label>
            <select value={month} onChange={(e) => setMonth(Number(e.target.value))} className={inputClass}>
              {MONTHS.map((m) => <option key={m.value} value={m.value}>{m.label}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs text-gray-500 font-semibold mb-1">Year</label>
            <select value={year} onChange={(e) => setYear(Number(e.target.value))} className={inputClass}>
              {Array.from({ length: 5 }, (_, i) => now.getFullYear() - 1 + i).map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b">
        {[
          { key: "PROCESS", label: "Process Payroll", icon: FaPlay },
          { key: "SLIPS", label: "Salary Slips", icon: FaMoneyCheckAlt },
          { key: "HISTORY", label: "Payroll History", icon: FaHistory },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 text-sm font-bold transition-all border-b-2 ${
              tab === t.key ? "border-indigo-500 text-indigo-500" : "border-transparent text-blueGray-400 hover:text-blueGray-600"
            }`}
          >
            <t.icon /> {t.label}
          </button>
        ))}
      </div>

      {/* PROCESS TAB */}
      {tab === "PROCESS" && (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FaPlay className="text-5xl text-indigo-400 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-blueGray-700 mb-2">Process Payroll</h3>
          <p className="text-sm text-blueGray-400 mb-6">
            Generate salary slips for all active employees for{" "}
            <span className="font-bold">{MONTHS.find((m) => m.value === month)?.label} {year}</span>.
            This will calculate basic salary, allowances, deductions, and amendments.
          </p>
          <button
            onClick={handleProcessPayroll}
            className="bg-indigo-500 text-white font-bold uppercase text-sm px-8 py-3 rounded shadow hover:shadow-lg transition-all"
          >
            <FaPlay className="inline mr-2" /> Process Payroll Now
          </button>
        </div>
      )}

      {/* SLIPS TAB */}
      {tab === "SLIPS" && (
        <>
          {/* Slip Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: "Total Slips", val: slipStats.total, color: "bg-blueGray-500" },
              { label: "Generated", val: slipStats.generated, color: "bg-amber-500" },
              { label: "Paid", val: slipStats.paid, color: "bg-emerald-500" },
              { label: "Total Net Salary", val: `Rs ${formatCurrency(slipStats.totalNet)}`, color: "bg-indigo-500" },
            ].map((s) => (
              <div key={s.label} className="bg-white rounded-lg shadow px-4 py-3">
                <p className="text-xs text-blueGray-400 font-semibold">{s.label}</p>
                <p className="text-lg font-bold text-blueGray-700">{s.val}</p>
              </div>
            ))}
          </div>

          {/* Mark All Paid */}
          {slipStats.generated > 0 && (
            <div className="mb-4 flex justify-end">
              <button onClick={handleMarkAllPaid} className="bg-emerald-500 text-white font-bold text-xs px-4 py-2 rounded shadow">
                <FaCheckDouble className="inline mr-1" /> Mark All as Paid
              </button>
            </div>
          )}

          {/* Slips Table */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-blueGray-50 text-blueGray-500 text-xs uppercase font-bold">
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Employee</th>
                    <th className="px-4 py-3 text-right">Basic</th>
                    <th className="px-4 py-3 text-right">Allowances</th>
                    <th className="px-4 py-3 text-right">Deductions</th>
                    <th className="px-4 py-3 text-right">Net Salary</th>
                    <th className="px-4 py-3 text-center">Status</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {slips.length === 0 && (
                    <tr>
                      <td colSpan="8" className="text-center py-8 text-blueGray-400">
                        No salary slips for this period. Process payroll first.
                      </td>
                    </tr>
                  )}
                  {slips.map((s, i) => (
                    <tr key={s.id} className="border-t hover:bg-blueGray-50 transition-colors">
                      <td className="px-4 py-3 text-sm">{i + 1}</td>
                      <td className="px-4 py-3 text-sm font-semibold">{s.employeeName || "—"}</td>
                      <td className="px-4 py-3 text-sm text-right">Rs {formatCurrency(s.basicSalary)}</td>
                      <td className="px-4 py-3 text-sm text-right text-emerald-600">+ Rs {formatCurrency(s.totalAllowances)}</td>
                      <td className="px-4 py-3 text-sm text-right text-red-500">- Rs {formatCurrency(s.totalDeductions)}</td>
                      <td className="px-4 py-3 text-sm text-right font-bold">Rs {formatCurrency(s.netSalary)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full text-white ${SALARY_SLIP_STATUS_BADGE[s.status] || "bg-gray-500"}`}>
                          {s.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button onClick={() => setSelectedSlip(s)} className="text-blue-500 hover:text-blue-700" title="View">
                            <FaEye />
                          </button>
                          {s.status === "GENERATED" && (
                            <button onClick={() => handleMarkPaid(s)} className="text-emerald-500 hover:text-emerald-700" title="Mark Paid">
                              <FaMoneyCheckAlt />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Slip Detail Modal */}
          {selectedSlip && (
            <>
              <div className="fixed inset-0 bg-black bg-opacity-30 z-40" onClick={() => setSelectedSlip(null)} />
              <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-blueGray-700">Salary Slip Details</h3>
                    <button onClick={() => setSelectedSlip(null)} className="text-red-500 font-bold text-lg">&times;</button>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between"><span className="text-blueGray-400">Employee</span><span className="font-bold">{selectedSlip.employeeName}</span></div>
                    <div className="flex justify-between"><span className="text-blueGray-400">Period</span><span className="font-bold">{MONTHS.find((m) => m.value === selectedSlip.salaryMonth)?.label} {selectedSlip.salaryYear}</span></div>
                    <hr />
                    <div className="flex justify-between"><span className="text-blueGray-400">Basic Salary</span><span>Rs {formatCurrency(selectedSlip.basicSalary)}</span></div>
                    <div className="flex justify-between text-emerald-600"><span>Total Allowances</span><span>+ Rs {formatCurrency(selectedSlip.totalAllowances)}</span></div>
                    <div className="flex justify-between text-red-500"><span>Total Deductions</span><span>- Rs {formatCurrency(selectedSlip.totalDeductions)}</span></div>
                    <hr />
                    <div className="flex justify-between text-lg font-bold"><span>Net Salary</span><span>Rs {formatCurrency(selectedSlip.netSalary)}</span></div>
                    <div className="flex justify-between"><span className="text-blueGray-400">Status</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full text-white ${SALARY_SLIP_STATUS_BADGE[selectedSlip.status] || "bg-gray-500"}`}>
                        {selectedSlip.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* HISTORY TAB */}
      {tab === "HISTORY" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-blueGray-50 text-blueGray-500 text-xs uppercase font-bold">
                  <th className="px-4 py-3 text-left">#</th>
                  <th className="px-4 py-3 text-left">Period</th>
                  <th className="px-4 py-3 text-right">Total Employees</th>
                  <th className="px-4 py-3 text-right">Total Amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                  <th className="px-4 py-3 text-left">Processed Date</th>
                  <th className="px-4 py-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody>
                {history.length === 0 && (
                  <tr>
                    <td colSpan="7" className="text-center py-8 text-blueGray-400">No payroll history found</td>
                  </tr>
                )}
                {history.map((h, i) => (
                  <tr key={h.id} className="border-t hover:bg-blueGray-50 transition-colors">
                    <td className="px-4 py-3 text-sm">{histPage * 10 + i + 1}</td>
                    <td className="px-4 py-3 text-sm font-semibold">
                      {MONTHS.find((m) => m.value === h.month)?.label} {h.year}
                    </td>
                    <td className="px-4 py-3 text-sm text-right">{h.totalEmployees || "—"}</td>
                    <td className="px-4 py-3 text-sm text-right font-bold">Rs {formatCurrency(h.totalAmount)}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-bold px-2 py-1 rounded-full text-white ${PAYROLL_STATUS_BADGE[h.status] || "bg-gray-500"}`}>
                        {h.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">{h.createdDate ? new Date(h.createdDate).toLocaleDateString() : "—"}</td>
                    <td className="px-4 py-3 text-center">
                      {(h.status === "COMPLETED" || h.status === "PROCESSING") && (
                        <button onClick={() => handleCancelPayroll(h)} className="text-red-500 hover:text-red-700" title="Cancel">
                          <FaBan />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Simple pagination */}
          {histTotal > 10 && (
            <div className="flex justify-center gap-2 py-3">
              <button disabled={histPage === 0} onClick={() => setHistPage((p) => p - 1)} className="px-3 py-1 rounded text-sm border disabled:opacity-50">Prev</button>
              <span className="px-3 py-1 text-sm text-blueGray-500">Page {histPage + 1}</span>
              <button disabled={(histPage + 1) * 10 >= histTotal} onClick={() => setHistPage((p) => p + 1)} className="px-3 py-1 rounded text-sm border disabled:opacity-50">Next</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
