import React, { useCallback, useContext, useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { MainContext } from "context/MainContext";
import httpService from "utility/httpService";
import ReportView from "../admin/reporting/components/ReportView";
import ReportFilterBar from "../admin/reporting/components/ReportFilterBar";
import { toBackendDate } from "../admin/reporting/reportConfig";
import { HR_REPORT_BASE } from "../accountant/reporting/hrReportConfig";

export default function HRHomepage() {
  const history = useHistory();
  const { notifyError } = useContext(MainContext);
  const [view, setView] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [start, end] = dateRange;
      const params = new URLSearchParams();
      if (start && end) {
        params.set("fromDate", toBackendDate(start));
        params.set("toDate", toBackendDate(end));
      }
      const query = params.toString();
      const response = await httpService.get(
        `/reporting/hr/dashboard${query ? `?${query}` : ""}`
      );
      setView(response.data || null);
    } catch (error) {
      setView(null);
      notifyError(
        error.message || "Failed to load HR dashboard",
        error.data,
        4000
      );
    } finally {
      setLoading(false);
    }
  }, [dateRange, notifyError]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return (
    <div className="min-h-screen bg-blueGray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <h1 className="text-blueGray-800 text-3xl font-bold mb-1">
              {view?.title || "HR Dashboard"}
            </h1>
            <p className="text-blueGray-500 text-sm">
              {view?.subtitle || "Workforce, attendance, leave and payroll overview"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchDashboard}
              disabled={loading}
              className="bg-white border border-blueGray-200 hover:bg-blueGray-50 text-blueGray-600 text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
            >
              <i className={`fas fa-sync-alt mr-2 ${loading ? "fa-spin" : ""}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => history.push(HR_REPORT_BASE)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors"
            >
              <i className="fas fa-chart-pie mr-2" />
              All HR Reports
            </button>
          </div>
        </div>

        <ReportFilterBar dateRange={dateRange} onChange={setDateRange} />

        {loading ? (
          <div className="bg-white shadow-lg rounded-lg p-16 text-center text-blueGray-400">
            <i className="fas fa-circle-notch fa-spin text-4xl mb-4" />
            <p className="mb-0 text-base">Loading HR dashboard...</p>
          </div>
        ) : (
          <ReportView view={view} />
        )}
      </div>
    </div>
  );
}
