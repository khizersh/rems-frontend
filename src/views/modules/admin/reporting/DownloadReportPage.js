/* eslint-disable */
import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { IoArrowBackOutline } from "react-icons/io5";
import httpService from "../../../../utility/httpService";
import { MainContext } from "context/MainContext";
import FinancialStatementView from "./components/FinancialStatementView";
import DownloadReportFilterBar from "./components/DownloadReportFilterBar";
import {
  DOWNLOAD_REPORT_CATALOG,
  buildDownloadQuery,
} from "./downloadReportsConfig";

/**
 * Param-driven page for downloadable accounting statements.
 * Supports JSON preview and CSV file export.
 */
export default function DownloadReportPage() {
  const { reportKey } = useParams();
  const history = useHistory();
  const { notifyError, notifySuccess } = useContext(MainContext);

  const config = DOWNLOAD_REPORT_CATALOG[reportKey];

  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);
  const [asOfDate, setAsOfDate] = useState("");
  const [accountCode, setAccountCode] = useState("");

  const filterState = { dateRange, asOfDate, accountCode };

  const validateFilters = useCallback(() => {
    if (!config) return false;
    if (config.dateRange) {
      const [start, end] = dateRange || [];
      if (!start || !end) {
        notifyError("Please select a date range", 4000);
        return false;
      }
    }
    if (config.accountCode && !config.accountCodeOptional) {
      if (!accountCode || !accountCode.trim()) {
        notifyError("Account code is required for this report", 4000);
        return false;
      }
    }
    return true;
  }, [config, dateRange, accountCode, notifyError]);

  const fetchPreview = useCallback(async () => {
    if (!config || !validateFilters()) return;
    setLoading(true);
    try {
      const qs = buildDownloadQuery(config, { ...filterState, format: "json" });
      const response = await httpService.get(`${config.endpoint}?${qs}`);
      setReport(response.data || null);
    } catch (err) {
      notifyError(err.message || "Failed to load report", 4000);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [config, filterState, validateFilters, notifyError]);

  const handleDownload = useCallback(async () => {
    if (!config || !validateFilters()) return;
    setDownloading(true);
    try {
      const qs = buildDownloadQuery(config, { ...filterState, format: "csv" });
      await httpService.download(`${config.endpoint}?${qs}`);
      notifySuccess("Report downloaded successfully", 3000);
    } catch (err) {
      notifyError(err.message || "Failed to download report", 4000);
    } finally {
      setDownloading(false);
    }
  }, [config, filterState, validateFilters, notifyError, notifySuccess]);

  useEffect(() => {
    setReport(null);
  }, [reportKey]);

  if (!config) {
    return (
      <div className="container mx-auto p-4">
        <div className="bg-white shadow-lg rounded-12 p-10 text-center text-blueGray-400">
          <i className="fas fa-triangle-exclamation text-3xl mb-3"></i>
          <p className="mb-3">Unknown download report: "{reportKey}".</p>
          <button
            onClick={() => history.push("/dashboard/reporting/downloads")}
            className="bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded"
          >
            Back to Downloads
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
            onClick={() => history.push("/dashboard/reporting/downloads")}
            className="back-button mr-2"
            title="Back to Downloads"
          >
            <IoArrowBackOutline className="back-button-icon inline-block" />
          </button>
          <div>
            <h2 className="text-blueGray-700 text-2xl font-semibold mb-0">
              {report?.title || config.title}
            </h2>
            <p className="text-blueGray-400 text-sm mb-0">
              {report?.subtitle || config.subtitle}
            </p>
          </div>
        </div>
      </div>

      <DownloadReportFilterBar
        config={config}
        dateRange={dateRange}
        onDateChange={setDateRange}
        asOfDate={asOfDate}
        onAsOfDateChange={setAsOfDate}
        accountCode={accountCode}
        onAccountCodeChange={setAccountCode}
        onPreview={fetchPreview}
        onDownload={handleDownload}
        loading={loading}
        downloading={downloading}
      />

      {loading ? (
        <div className="bg-white shadow-lg rounded-12 p-10 text-center text-blueGray-400">
          <i className="fas fa-circle-notch fa-spin text-2xl mb-3"></i>
          <p className="mb-0">Loading report…</p>
        </div>
      ) : report ? (
        <FinancialStatementView report={report} reportKey={reportKey} />
      ) : (
        <div className="bg-white shadow-lg rounded-12 p-10 text-center text-blueGray-400">
          <i className="fas fa-file-csv text-3xl mb-3"></i>
          <p className="mb-0">
            Select filters and click <strong>Preview</strong> or{" "}
            <strong>Download CSV</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
