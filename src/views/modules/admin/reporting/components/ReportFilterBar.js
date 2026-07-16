/* eslint-disable */
import React from "react";
import DateRangePicker from "../../../../../components/CustomerComponents/DateRangePicker";

/**
 * Compact filter bar for date-range driven reports.
 * `dateRange` is a [startDate, endDate] tuple of JS Date objects (or nulls).
 */
export default function ReportFilterBar({ dateRange, onChange }) {
  const [startDate, endDate] = dateRange || [null, null];

  return (
    <div className="bg-white shadow-lg rounded-12 px-4 py-3 mb-6 flex flex-wrap items-center justify-between g-2">
      <div className="flex items-center">
        <i className="fas fa-filter text-indigo-500 mr-2"></i>
        <span className="text-sm font-semibold text-blueGray-600">
          Filter by date range
        </span>
      </div>
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onChange={onChange}
      />
    </div>
  );
}
