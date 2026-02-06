import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function DateRangePicker({ startDate, endDate, onChange }) {

  return (
    <>
      <DatePicker
        selectsRange
        startDate={startDate}
        endDate={endDate}
        onChange={onChange}
        isClearable
        placeholderText="Select date range"
        className="px-3 py-2 border border-gray-300 rounded datepicker-size max-sm-w-full max-sm-text-center"
      />
    </>
  );
}
