/* eslint-disable */
import React, { useMemo, useState } from "react";
import ReportAlerts from "./ReportAlerts";
import DynamicTableComponent from "../../../../../components/table/DynamicTableComponent";
import { formatCurrency } from "../downloadReportsConfig";

const fmt = (v) => formatCurrency(v);

/**
 * Renders a FinancialStatementReport (download API JSON preview).
 */
export default function FinancialStatementView({ report, reportKey }) {
  if (!report) return null;

  const totals = report.totals || {};
  const sections = report.sections || [];
  const alerts = report.validationAlerts || [];

  const totalsCards = useMemo(() => {
    switch (reportKey) {
      case "trial-balance":
        return [
          { label: "Total Opening", value: totals.totalOpening },
          { label: "Total Debit", value: totals.totalDebit },
          { label: "Total Credit", value: totals.totalCredit },
          { label: "Total Closing", value: totals.totalClosing },
        ];
      case "profit-loss":
        return [
          { label: "Total Income", value: totals.totalIncome },
          { label: "Total Expense", value: totals.totalExpense },
          { label: "Net Profit", value: totals.netProfit },
        ];
      case "balance-sheet":
        return [
          { label: "Total Assets", value: totals.totalAssets },
          { label: "Total Liabilities", value: totals.totalLiabilities },
          { label: "Total Equity", value: totals.totalEquity },
        ];
      case "journal-register":
        return [
          { label: "Total Debit", value: totals.totalDebit },
          { label: "Total Credit", value: totals.totalCredit },
        ];
      default:
        return [];
    }
  }, [reportKey, totals]);

  const isLedger =
    reportKey === "general-ledger" ||
    reportKey === "account-statement" ||
    reportKey === "journal-register";

  return (
    <div className="space-y-6">
      {report.organizationName && (
        <div className="text-sm text-blueGray-500">
          <span className="font-semibold text-blueGray-600">Organization:</span>{" "}
          {report.organizationName}
          {report.subtitle && (
            <>
              {" "}
              · <span className="italic">{report.subtitle}</span>
            </>
          )}
        </div>
      )}

      {alerts.length > 0 && <ReportAlerts alerts={alerts} />}

      {totalsCards.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {totalsCards.map((card) => (
            <div
              key={card.label}
              className="bg-white rounded-12 shadow-lg p-4 border-l-4 border-indigo-500"
            >
              <p className="text-blueGray-400 text-xs font-semibold uppercase mb-1">
                {card.label}
              </p>
              <p className="text-blueGray-700 text-xl font-bold mb-0">
                {fmt(card.value)}
              </p>
            </div>
          ))}
        </div>
      )}

      {reportKey === "profit-loss" && totals.netProfit != null && (
        <div className="bg-white rounded-12 shadow-lg p-4 flex items-center justify-between border-t-4 border-emerald-500">
          <span className="text-blueGray-600 font-semibold">Net Profit / (Loss)</span>
          <span
            className={`text-xl font-bold ${
              totals.netProfit >= 0 ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {fmt(totals.netProfit)}
          </span>
        </div>
      )}

      {sections.map((section, idx) => (
        <StatementSection
          key={section.key || idx}
          section={section}
          reportKey={reportKey}
          isLedger={isLedger}
        />
      ))}

      {sections.length === 0 && (
        <div className="bg-white shadow-md rounded-lg p-16 text-center border border-blueGray-200">
          <i className="fas fa-folder-open text-5xl mb-4 text-blueGray-300"></i>
          <p className="text-blueGray-400 text-lg mb-0">
            No data available for this report in the selected period.
          </p>
        </div>
      )}
    </div>
  );
}

function StatementSection({ section, reportKey, isLedger }) {
  const lines = section.lines || [];
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(25);

  const totalElements = lines.length;
  const totalPages = Math.ceil(totalElements / pageSize) || 0;
  const pageData = lines.slice(page * pageSize, page * pageSize + pageSize);

  const columns = useMemo(() => {
    if (reportKey === "trial-balance") {
      return [
        { header: "Code", field: "accountCode" },
        { header: "Account", field: "accountName" },
        { header: "Type", field: "accountType" },
        { header: "Opening", field: "openingBalance", render: fmt },
        { header: "Debit", field: "debit", render: fmt },
        { header: "Credit", field: "credit", render: fmt },
        { header: "Closing", field: "closingBalance", render: fmt },
      ];
    }
    if (reportKey === "profit-loss" || reportKey === "balance-sheet") {
      return [
        { header: "Category", field: "accountCategory" },
        { header: "Code", field: "accountCode" },
        { header: "Account", field: "accountName" },
        { header: "Amount", field: "amount", render: fmt },
      ];
    }
    if (reportKey === "journal-register") {
      return [
        {
          header: "Date",
          field: "transactionDate",
          render: (v) => (v ? String(v).replace("T", " ").slice(0, 16) : "—"),
        },
        { header: "Journal", field: "journalEntryId" },
        { header: "Reference", field: "referenceType" },
        { header: "Account", field: "accountCode" },
        { header: "Description", field: "description" },
        { header: "Debit", field: "debit", render: fmt },
        { header: "Credit", field: "credit", render: fmt },
      ];
    }
    if (isLedger) {
      return [
        {
          header: "Date",
          field: "transactionDate",
          render: (v) => (v ? String(v).replace("T", " ").slice(0, 16) : "—"),
        },
        { header: "Journal", field: "journalEntryId" },
        { header: "Reference", field: "referenceType" },
        { header: "Description", field: "description" },
        { header: "Debit", field: "debit", render: fmt },
        { header: "Credit", field: "credit", render: fmt },
        { header: "Balance", field: "runningBalance", render: fmt },
      ];
    }
    return [
      { header: "Code", field: "accountCode" },
      { header: "Account", field: "accountName" },
      { header: "Amount", field: "amount", render: fmt },
    ];
  }, [reportKey, isLedger]);

  return (
    <DynamicTableComponent
      title={
        section.sectionTotal != null
          ? `${section.label} — Total: ${fmt(section.sectionTotal)}`
          : section.label
      }
      data={pageData}
      columns={columns}
      actions={[]}
      loading={false}
      page={page}
      setPage={setPage}
      pageSize={pageSize}
      setPageSize={(size) => {
        setPageSize(size);
        setPage(0);
      }}
      totalPages={totalPages}
      totalElements={totalElements}
      fetchDataFunction={() => setPage(0)}
    />
  );
}
