/* eslint-disable */
import React from "react";
import ReportKpiCard from "./ReportKpiCard";
import ReportChart from "./ReportChart";
import ReportBreakdown from "./ReportBreakdown";
import ReportAlerts from "./ReportAlerts";
import ReportTable from "./ReportTable";

/**
 * Renders the uniform backend ReportingView envelope. Each section is optional;
 * only populated sections are shown, in a dashboard-friendly order:
 *   alerts -> KPI cards -> charts -> breakdowns -> tables
 */
export default function ReportView({ view }) {
  if (!view) return null;

  const cards = view.summaryCards || [];
  const charts = view.charts || [];
  const breakdowns = view.breakdowns || [];
  const tables = view.tables || [];
  const alerts = view.alerts || [];

  const singleChart = charts.length === 1;

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {alerts.length > 0 && (
        <div>
          <ReportAlerts alerts={alerts} />
        </div>
      )}

      {/* KPI cards — responsive grid that adds a 5th column on very wide screens */}
      {cards.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-blueGray-700 mb-4">Key Metrics</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
            {cards.map((card, idx) => (
              <div key={card.key || idx}>
                <ReportKpiCard card={card} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Charts */}
      {charts.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-blueGray-700 mb-4">Analytics</h3>
          <div className={`grid gap-6 ${singleChart ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"}`}>
            {charts.map((chart, idx) => (
              <div key={chart.key || idx} className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
                <ReportChart chart={chart} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Breakdowns — use up to 4 columns on xl when there are many panels */}
      {breakdowns.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-blueGray-700 mb-4">Breakdown Analysis</h3>
          <div
            className={`grid gap-6 grid-cols-1 md:grid-cols-2 ${
              breakdowns.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"
            }`}
          >
            {breakdowns.map((summary, idx) => (
              <div key={summary.key || idx}>
                <ReportBreakdown summary={summary} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tables */}
      {tables.length > 0 && (
        <div className="mb-8">
          <h3 className="text-lg font-semibold text-blueGray-700 mb-4">Data Tables</h3>
          <div className="space-y-6">
            {tables.map((table, idx) => (
              <div key={table.key || idx}>
                <ReportTable table={table} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {cards.length === 0 &&
        charts.length === 0 &&
        breakdowns.length === 0 &&
        tables.length === 0 &&
        alerts.length === 0 && (
          <div className="bg-white shadow-md rounded-lg p-16 text-center border border-blueGray-200">
            <i className="fas fa-folder-open text-5xl mb-4 text-blueGray-300"></i>
            <p className="text-blueGray-400 text-lg mb-0">No data available for this report yet.</p>
          </div>
        )}
    </div>
  );
}
