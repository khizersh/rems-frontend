/* eslint-disable */
import React from "react";

/**
 * Renders backend ExceptionItem DTOs as severity-coded alert banners.
 * { key, severity, title, description, value, formattedValue, colorHint }
 */
const SEVERITY_STYLE = {
  CRITICAL: {
    wrap: "bg-red-50 border-red-400",
    icon: "fas fa-exclamation-circle text-red-500",
    title: "text-red-700",
  },
  WARNING: {
    wrap: "bg-orange-50 border-orange-400",
    icon: "fas fa-exclamation-triangle text-orange-500",
    title: "text-orange-700",
  },
  INFO: {
    wrap: "bg-lightBlue-50 border-lightBlue-400",
    icon: "fas fa-info-circle text-lightBlue-500",
    title: "text-lightBlue-700",
  },
};

export default function ReportAlerts({ alerts }) {
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="flex flex-wrap">
      {alerts.map((a, idx) => {
        const style = SEVERITY_STYLE[a.severity] || SEVERITY_STYLE.INFO;
        return (
          <div key={a.key || idx} className="w-full lg:w-1/2 px-2 mb-4">
            <div
              className={`flex items-start p-4 border-l-4 rounded-12 shadow-sm ${style.wrap}`}
            >
              <i className={`${style.icon} text-lg mt-1 mr-3`}></i>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h6 className={`text-sm font-bold ${style.title}`}>
                    {a.title}
                  </h6>
                  {a.formattedValue && (
                    <span className={`text-sm font-bold ${style.title}`}>
                      {a.formattedValue}
                    </span>
                  )}
                </div>
                {a.description && (
                  <p className="text-xs text-blueGray-500 mt-1 mb-0">
                    {a.description}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
