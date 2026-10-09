import React, { useCallback, useContext, useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { IoArrowBackOutline } from "react-icons/io5";
import { MainContext } from "context/MainContext";
import httpService from "utility/httpService";
import ReportView from "../../admin/reporting/components/ReportView";
import ReportFilterBar from "../../admin/reporting/components/ReportFilterBar";
import {
  HR_REPORT_BASE,
  HR_REPORT_CATALOG,
  toBackendDate,
} from "./hrReportConfig";

const currentMonthValue = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

export default function HRReportPage() {
  const { reportKey } = useParams();
  const history = useHistory();
  const { notifyError } = useContext(MainContext);
  const config = HR_REPORT_CATALOG[reportKey];
  const [view, setView] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [selectedMonth, setSelectedMonth] = useState(currentMonthValue);

  const fetchReport = useCallback(async () => {
    if (!config) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (config.filter === "range") {
        const [start, end] = dateRange;
        if (start && end) {
          params.set("fromDate", toBackendDate(start));
          params.set("toDate", toBackendDate(end));
        }
      } else if (config.filter === "month" && selectedMonth) {
        const [year, month] = selectedMonth.split("-");
        params.set("year", year);
        params.set("month", String(Number(month)));
      }

      const query = params.toString();
      const response = await httpService.get(
        `${config.endpoint}${query ? `?${query}` : ""}`
      );
      setView(response.data || null);
    } catch (error) {
      setView(null);
      notifyError(
        error.message || "Failed to load HR report",
        error.data,
        4000
      );
    } finally {
      setLoading(false);
    }
  }, [config, dateRange, notifyError, selectedMonth]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  if (!config) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white shadow-lg rounded-lg p-10 text-center text-blueGray-400">
          <i className="fas fa-triangle-exclamation text-3xl mb-3" />
          <p className="mb-3">Unknown HR report: {reportKey}.</p>
          <button
            type="button"
            onClick={() => history.push(HR_REPORT_BASE)}
            className="bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded"
          >
            Back to HR Reports
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => history.push(HR_REPORT_BASE)}
            className="back-button mr-2"
            title="Back to HR Reports"
          >
            <IoArrowBackOutline className="back-button-icon inline-block" />
          </button>
          <div>
            <h2 className="text-blueGray-700 text-2xl font-semibold mb-0">
              {view?.title || config.title}
            </h2>
            <p className="text-blueGray-400 text-sm mb-0">
              {view?.subtitle || config.subtitle}
            </p>
          </div>
        </div>
      </div>

      {config.filter === "range" && (
        <ReportFilterBar dateRange={dateRange} onChange={setDateRange} />
      )}
      {config.filter === "month" && (
        <div className="bg-white shadow-lg rounded-lg px-4 py-3 mb-6 flex flex-wrap items-center justify-between gap-3">
          <label
            htmlFor="hr-report-month"
            className="text-sm font-semibold text-blueGray-600"
          >
            <i className="fas fa-calendar-alt text-indigo-500 mr-2" />
            Payroll month
          </label>
          <input
            id="hr-report-month"
            type="month"
            value={selectedMonth}
            onChange={(event) => setSelectedMonth(event.target.value)}
            className="border border-blueGray-300 rounded px-3 py-2 text-sm text-blueGray-700"
          />
        </div>
      )}

      {loading ? (
        <div className="bg-white shadow-lg rounded-lg p-10 text-center text-blueGray-400">
          <i className="fas fa-circle-notch fa-spin text-2xl mb-3" />
          <p className="mb-0">Loading HR report...</p>
        </div>
      ) : (
        <ReportView view={view} />
      )}
    </div>
  );
}