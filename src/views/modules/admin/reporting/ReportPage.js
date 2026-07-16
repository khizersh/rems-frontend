/* eslint-disable */
import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { IoArrowBackOutline } from "react-icons/io5";
import httpService from "../../../../utility/httpService";
import { MainContext } from "context/MainContext";
import ReportView from "./components/ReportView";
import ReportFilterBar from "./components/ReportFilterBar";
import { REPORT_CATALOG, toBackendDate } from "./reportConfig";

/**
 * Generic, param-driven reporting page. The `:reportKey` route param is looked up
 * in REPORT_CATALOG to resolve the backend endpoint + display metadata, so every
 * admin report shares one route, one component and one consistent layout.
 */
export default function ReportPage() {
  const { reportKey } = useParams();
  const history = useHistory();
  const { notifyError } = useContext(MainContext);

  const config = REPORT_CATALOG[reportKey];

  const [view, setView] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);

  const fetchReport = useCallback(async () => {
    if (!config) return;
    setLoading(true);
    try {
      const [start, end] = dateRange;
      const params = new URLSearchParams();
      if (config.dateRange && start && end) {
        params.append("fromDate", toBackendDate(start));
        params.append("toDate", toBackendDate(end));
      }
      const qs = params.toString();
      const url = `${config.endpoint}${qs ? `?${qs}` : ""}`;
      const response = await httpService.get(url);
      setView(response.data || null);
    } catch (err) {
      notifyError(err.message || "Failed to load report", 4000);
      setView(null);
    } finally {
      setLoading(false);
    }
  }, [config, dateRange, notifyError]);

  useEffect(() => {
    fetchReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportKey, dateRange]);

  const handleDateChange = (update) => setDateRange(update);

  if (!config) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white shadow-lg rounded-12 p-10 text-center text-blueGray-400">
          <i className="fas fa-triangle-exclamation text-3xl mb-3"></i>
          <p className="mb-3">Unknown report: "{reportKey}".</p>
          <button
            onClick={() => history.push("/dashboard/reporting")}
            className="bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded"
          >
            Back to Reports
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={() => history.push("/dashboard/reporting")}
            className="back-button mr-2"
            title="Back to Reports"
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

      {config.dateRange && (
        <ReportFilterBar dateRange={dateRange} onChange={handleDateChange} />
      )}

      {loading ? (
        <div className="bg-white shadow-lg rounded-12 p-10 text-center text-blueGray-400">
          <i className="fas fa-circle-notch fa-spin text-2xl mb-3"></i>
          <p className="mb-0">Loading report…</p>
        </div>
      ) : (
        <ReportView view={view} />
      )}
    </div>
  );
}
