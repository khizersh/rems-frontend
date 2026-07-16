/* eslint-disable */
import React from "react";
import DateRangePicker from "../../../../../components/CustomerComponents/DateRangePicker";

/**
 * Filters for downloadable accounting reports: date range, optional as-of date,
 * optional account code, and export actions.
 */
export default function DownloadReportFilterBar({
  config,
  dateRange,
  onDateChange,
  asOfDate,
  onAsOfDateChange,
  accountCode,
  onAccountCodeChange,
  onPreview,
  onDownload,
  loading,
  downloading,
}) {
  const [startDate, endDate] = dateRange || [null, null];

  return (
    <div className="bg-white shadow-lg rounded-12 px-4 py-4 mb-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-wrap items-end gap-4 flex-1">
          {config.dateRange && (
            <div>
              <label className="block text-xs font-semibold text-blueGray-500 mb-1">
                Date range
              </label>
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onChange={onDateChange}
              />
            </div>
          )}

          {config.asOfDate && (
            <div>
              <label className="block text-xs font-semibold text-blueGray-500 mb-1">
                As-of date (optional)
              </label>
              <input
                type="date"
                className="border border-blueGray-200 rounded px-3 py-2 text-sm text-blueGray-600"
                value={asOfDate || ""}
                onChange={(e) => onAsOfDateChange(e.target.value)}
              />
            </div>
          )}

          {config.accountCode && (
            <div className="min-w-[200px]">
              <label className="block text-xs font-semibold text-blueGray-500 mb-1">
                Account code{config.accountCodeOptional ? " (optional)" : ""}
              </label>
              <input
                type="text"
                placeholder="e.g. INC-BOOKING-001"
                className="border border-blueGray-200 rounded px-3 py-2 text-sm text-blueGray-600 w-full"
                value={accountCode || ""}
                onChange={(e) => onAccountCodeChange(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onPreview}
            disabled={loading || downloading}
            className="bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded shadow hover:bg-indigo-600 disabled:opacity-50"
          >
            {loading ? (
              <>
                <i className="fas fa-circle-notch fa-spin mr-2"></i>
                Loading…
              </>
            ) : (
              <>
                <i className="fas fa-eye mr-2"></i>
                Preview
              </>
            )}
          </button>
          <button
            onClick={onDownload}
            disabled={loading || downloading}
            className="bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded shadow hover:bg-emerald-600 disabled:opacity-50"
          >
            {downloading ? (
              <>
                <i className="fas fa-circle-notch fa-spin mr-2"></i>
                Exporting…
              </>
            ) : (
              <>
                <i className="fas fa-download mr-2"></i>
                Download CSV
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
