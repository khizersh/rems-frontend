import React from "react";
import { useHistory } from "react-router-dom";
import {
  HR_REPORT_BASE,
  HR_REPORT_CATALOG,
  HR_REPORT_GROUPS,
  hint,
} from "./hrReportConfig";

export default function HRReportingHub() {
  const history = useHistory();

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-blueGray-700 text-2xl font-semibold mb-1">
            HR Reports
          </h2>
          <p className="text-blueGray-400 text-sm mb-0">
            Workforce, attendance, leave and payroll insights.
          </p>
        </div>
        <button
          onClick={() => history.push("/dashboard/hr-dashboard")}
          className="bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded shadow hover:bg-indigo-600 inline-flex items-center"
        >
          <i className="fas fa-chart-bar mr-2" />
          HR Dashboard
        </button>
      </div>

      {HR_REPORT_GROUPS.map((group) => {
        const theme = hint(group.hint);
        return (
          <section key={group.group} className="mb-8">
            <div className="flex items-center mb-4">
              <div
                className={`text-white w-10 h-10 inline-flex items-center justify-center rounded-full shadow ${theme.solid}`}
              >
                <i className={group.icon} />
              </div>
              <h3 className="text-blueGray-600 text-lg font-semibold ml-3 mb-0">
                {group.group}
              </h3>
            </div>
            <div className="flex flex-wrap -mx-2">
              {group.items.map((slug) => {
                const report = HR_REPORT_CATALOG[slug];
                if (!report) return null;
                return (
                  <div
                    key={slug}
                    className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 px-2 mb-4"
                  >
                    <button
                      type="button"
                      onClick={() => history.push(`${HR_REPORT_BASE}/${slug}`)}
                      className={`text-left w-full h-full bg-white rounded-lg shadow-lg p-4 border-l-4 ${theme.ring} hover:shadow-xl transition-shadow duration-150`}
                    >
                      <h4 className="text-blueGray-700 font-semibold text-sm mb-1">
                        {report.title}
                      </h4>
                      <p className="text-blueGray-400 text-xs mb-3">
                        {report.subtitle}
                      </p>
                      <span className={`inline-flex items-center text-xs font-bold ${theme.text}`}>
                        View report <i className="fas fa-arrow-right ml-2" />
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}