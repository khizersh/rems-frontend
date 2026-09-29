/* eslint-disable */
import React, { useState, useEffect, useContext, useCallback } from "react";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import httpService from "../../../../utility/httpService";
import { MainContext } from "context/MainContext";
import ReportFilterBar from "../../admin/reporting/components/ReportFilterBar";
import ReportAlerts from "../../admin/reporting/components/ReportAlerts";
import ReportChart from "../../admin/reporting/components/ReportChart";
import ReportBreakdown from "../../admin/reporting/components/ReportBreakdown";
import { toBackendDate, hint, formatValue, ACCOUNTANT_BASE } from "./accountantReportConfig";
import "../../../../assets/styles/home/home.css";

const HINT_ICON = {
  PRIMARY: "fas fa-chart-line",
  SUCCESS: "fas fa-hand-holding-usd",
  WARNING: "fas fa-clock",
  DANGER: "fas fa-file-invoice-dollar",
  INFO: "fas fa-info-circle",
  NEUTRAL: "fas fa-layer-group",
};
const hintIcon = (h) => HINT_ICON[h] || HINT_ICON.NEUTRAL;

function HighlightCard({ card }) {
  if (!card) return null;
  const theme = hint(card.colorHint);
  const display =
    card.formattedValue != null && card.formattedValue !== ""
      ? card.formattedValue
      : formatValue(card.value, card.type);

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white rounded-lg shadow-lg overflow-hidden">
      <div className={`h-1 ${theme.solid}`} />
      <div className="flex-auto p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blueGray-400 uppercase font-bold text-xs mb-1">
              {card.label}
            </p>
            <span className="font-bold text-xl text-blueGray-800">{display}</span>
          </div>
          <div
            className={`text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full ${theme.solid} flex-shrink-0`}
          >
            <i className={card.iconClass || hintIcon(card.colorHint)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeading({ icon, label }) {
  return (
    <div className="flex items-center mb-4">
      <i className={`${icon} text-indigo-500 mr-2`} />
      <h3 className="text-blueGray-700 text-base font-semibold mb-0">{label}</h3>
    </div>
  );
}

/**
 * Accountant dashboard — a finance-first overview (income, expense, net profit, receivables,
 * payables, assets, equity) built from the accountant reporting API.
 */
export default function AccountantDashboard() {
  const history = useHistory();
  const { notifyError } = useContext(MainContext);

  const [view, setView] = useState(null);
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState([null, null]);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [start, end] = dateRange;
      const params = new URLSearchParams();
      if (start && end) {
        params.append("fromDate", toBackendDate(start));
        params.append("toDate", toBackendDate(end));
      }
      const qs = params.toString();
      const url = `/reporting/accountant/dashboard${qs ? `?${qs}` : ""}`;
      const response = await httpService.get(url);
      setView(response.data || null);
    } catch (err) {
      notifyError(err.message || "Failed to load dashboard", 4000);
      setView(null);
    } finally {
      setLoading(false);
    }
  }, [dateRange, notifyError]);

  useEffect(() => {
    fetchDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateRange]);

  const cards = view?.summaryCards || [];
  const charts = view?.charts || [];
  const breakdowns = view?.breakdowns || [];
  const alerts = view?.alerts || [];
  const singleChart = charts.length === 1;

  return (
    <div className="min-h-screen bg-blueGray-50 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between mb-6">
          <div>
            <h2 className="text-blueGray-800 text-3xl font-bold mb-1">
              {view?.title || "Accountant Dashboard"}
            </h2>
            <p className="text-blueGray-500 text-sm">
              {view?.subtitle || "Finance overview at a glance"}
            </p>
          </div>
          <div className="flex items-center gap-3 mt-2">
            <button
              onClick={fetchDashboard}
              disabled={loading}
              className="bg-white border border-blueGray-200 hover:bg-blueGray-50 text-blueGray-600 text-xs font-semibold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <i className={`fas fa-sync-alt ${loading ? "fa-spin" : ""}`} />
              Refresh
            </button>
            <button
              onClick={() => history.push(ACCOUNTANT_BASE)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <i className="fas fa-chart-pie" />
              All Reports
            </button>
            <button
              onClick={() => history.push(`${ACCOUNTANT_BASE}/downloads`)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <i className="fas fa-download" />
              Download Statements
            </button>
          </div>
        </div>

        {/* Date filter */}
        <ReportFilterBar dateRange={dateRange} onChange={setDateRange} />

        {loading ? (
          <div className="bg-white shadow-lg rounded-lg p-16 text-center text-blueGray-400 border border-blueGray-100 mt-6">
            <i className="fas fa-circle-notch fa-spin text-4xl mb-4" />
            <p className="mb-0 text-base">Loading dashboard…</p>
          </div>
        ) : !view ? null : (
          <div className="mt-6 space-y-8">
            {alerts.length > 0 && (
              <div>
                <ReportAlerts alerts={alerts} />
              </div>
            )}

            {cards.length > 0 && (
              <section className="mt-4">
                <SectionHeading icon="fas fa-coins" label="Financial Highlights" />
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {cards.map((card, idx) => (
                    <HighlightCard key={card.key || idx} card={card} />
                  ))}
                </div>
              </section>
            )}

            {charts.length > 0 && (
              <section className="mt-4">
                <SectionHeading icon="fas fa-chart-bar" label="Trends" />
                <div
                  className={`grid gap-6 ${
                    singleChart ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"
                  }`}
                >
                  {charts.map((chart, idx) => (
                    <div
                      key={chart.key || idx}
                      className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow"
                    >
                      <ReportChart chart={chart} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {breakdowns.length > 0 && (
              <section>
                <SectionHeading icon="fas fa-table-cells" label="Summary Breakdown" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {breakdowns.map((summary, idx) => (
                    <ReportBreakdown key={summary.key || idx} summary={summary} />
                  ))}
                </div>
              </section>
            )}

            <section>
              <SectionHeading icon="fas fa-arrow-up-right-from-square" label="Quick Access" />
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {[
                  { label: "Financial Overview", slug: "financial-overview", icon: "fas fa-scale-balanced", hint: "PRIMARY" },
                  { label: "Revenue Summary",    slug: "revenue-summary",    icon: "fas fa-arrow-trend-up",     hint: "SUCCESS" },
                  { label: "Expense Summary",    slug: "expense-summary",    icon: "fas fa-receipt",             hint: "DANGER"  },
                  { label: "Payable Summary",    slug: "payable-summary",    icon: "fas fa-file-invoice-dollar", hint: "WARNING" },
                  { label: "Trial Summary",      slug: "trial-summary",      icon: "fas fa-scale-unbalanced",    hint: "INFO"    },
                ].map((link) => {
                  const theme = hint(link.hint);
                  return (
                    <button
                      key={link.slug}
                      onClick={() => history.push(`${ACCOUNTANT_BASE}/${link.slug}`)}
                      className={`bg-white rounded-lg shadow p-4 text-left border-t-4 ${theme.ring} hover:shadow-md transition-shadow`}
                    >
                      <i className={`${link.icon} ${theme.text} mb-2 block text-lg`} />
                      <span className="text-blueGray-700 font-semibold text-xs block">
                        {link.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
