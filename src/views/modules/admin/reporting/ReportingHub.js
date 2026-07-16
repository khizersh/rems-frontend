/* eslint-disable */
import React from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { REPORT_GROUPS, REPORT_CATALOG, hint } from "./reportConfig";

/**
 * Reporting landing page: a themed directory of every admin report, grouped by
 * domain. Each tile deep-links into the param-driven ReportPage.
 */
export default function ReportingHub() {
  const history = useHistory();

  const open = (slug) => history.push(`/dashboard/reporting/${slug}`);

  return (
    <div className="container mx-auto p-4">
      <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-blueGray-700 text-2xl font-semibold mb-1">
            Admin Reports
          </h2>
          <p className="text-blueGray-400 text-sm mb-0">
            Financial, sales, inventory, procurement and workforce insights for
            your organization.
          </p>
        </div>
        <button
          onClick={() => history.push("/dashboard/reporting/downloads")}
          className="bg-emerald-500 text-white text-xs font-bold px-4 py-2 rounded shadow hover:bg-emerald-600 inline-flex items-center"
        >
          <i className="fas fa-download mr-2"></i>
          Download Financial Reports
        </button>
      </div>

      {REPORT_GROUPS.map((group) => {
        const theme = hint(group.hint);
        return (
          <div key={group.group} className="mb-8">
            <div className="flex items-center mb-4">
              <div
                className={`text-white w-10 h-10 inline-flex items-center justify-center rounded-full shadow ${theme.solid}`}
              >
                <i className={group.icon}></i>
              </div>
              <h3 className="text-blueGray-600 text-lg font-semibold ml-3 mb-0">
                {group.group}
              </h3>
            </div>

            <div className="flex flex-wrap -mx-2">
              {group.items.map((slug) => {
                const cfg = REPORT_CATALOG[slug];
                if (!cfg) return null;
                return (
                  <div
                    key={slug}
                    className="w-full sm:w-1/2 lg:w-1/3 xl:w-1/4 px-2 mb-4"
                  >
                    <button
                      onClick={() => open(slug)}
                      className={`text-left w-full h-full bg-white rounded-12 shadow-lg p-4 border-l-4 ${theme.ring} hover:shadow-xl transition-shadow duration-150`}
                    >
                      <h5 className="text-blueGray-700 font-semibold text-sm mb-1">
                        {cfg.title}
                      </h5>
                      <p className="text-blueGray-400 text-xs mb-3">
                        {cfg.subtitle}
                      </p>
                      <span
                        className={`inline-flex items-center text-xs font-bold ${theme.text}`}
                      >
                        View report
                        <i className="fas fa-arrow-right ml-2"></i>
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
