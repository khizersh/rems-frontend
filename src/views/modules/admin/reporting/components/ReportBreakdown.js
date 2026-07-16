/* eslint-disable */
import React from "react";
import { hint, formatValue } from "../reportConfig";

/**
 * Renders a backend GroupedSummary DTO:
 * { key, label, total, formattedTotal, items: [{ label, value, formattedValue, type, colorHint }] }
 */
export default function ReportBreakdown({ summary }) {
  if (!summary) return null;
  const items = summary.items || [];

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white w-full shadow-lg rounded-12 h-full">
      <div className="px-4 py-3 border-b border-blueGray-100 flex items-center justify-between">
        <h6 className="text-blueGray-700 text-sm font-semibold uppercase">
          {summary.label}
        </h6>
        {(summary.formattedTotal || summary.total != null) && (
          <span className="text-blueGray-700 font-bold text-sm">
            {summary.formattedTotal != null && summary.formattedTotal !== ""
              ? summary.formattedTotal
              : formatValue(summary.total, "CURRENCY")}
          </span>
        )}
      </div>
      <ul className="list-none p-0 m-0">
        {items.length === 0 ? (
          <li className="px-4 py-4 text-sm text-blueGray-400">No data.</li>
        ) : (
          items.map((it, idx) => {
            const theme = hint(it.colorHint);
            const display =
              it.formattedValue != null && it.formattedValue !== ""
                ? it.formattedValue
                : formatValue(it.value, it.type);
            return (
              <li
                key={it.key || idx}
                className="px-4 py-3 flex items-center justify-between border-b border-blueGray-50 last:border-0"
              >
                <span className="flex items-center text-sm text-blueGray-600">
                  <span
                    className={`inline-block w-2 h-2 rounded-full mr-3 ${theme.solid}`}
                  ></span>
                  {it.label}
                </span>
                <span className={`text-sm font-semibold ${theme.text}`}>
                  {display}
                </span>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
