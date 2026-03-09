import React from "react";

export default function CustomerAccountsList({ accounts, isLoading }) {
  const formatCurrency = (amount) => {
    return `Rs. ${parseFloat(amount || 0).toLocaleString()}`;
  };

  const getStatusBadgeStyle = (status) => {
    switch (status?.toUpperCase()) {
      case "ACTIVE":
        return { background: "#d1fae5", color: "#065f46" , height : '24px' };
      case "CLOSED":
        return { background: "#f0f9ff", color: "#0c4a6e" , height : '24px' };
      case "OVERDUE":
        return { background: "#fee2e2", color: "#991b1b", height : '24px' };
      default:
        return { background: "#f1f5f9", color: "#475569", height : '24px' };
    }
  };

  const getProgressPercentage = (paid, total) => {
    if (!total || total === 0) return 0;
    return Math.min(100, Math.round((paid / total) * 100));
  };

  if (isLoading) {
    return (
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-12">
        <div className="rounded-t mb-0 px-4 py-3 border-0">
          <h3 className="font-semibold text-lg text-blueGray-700">
            My Properties
          </h3>
        </div>
        <div className="p-4">
          <div className="text-center text-blueGray-400 py-8">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-12">
      <div className="rounded-t mb-0 px-4 py-3 border-0">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full max-w-full flex-grow flex-1">
            <h3 className="font-semibold text-lg text-blueGray-700">
              My Properties
            </h3>
          </div>
        </div>
      </div>
      <div className="p-4">
        {!accounts || accounts.length === 0 ? (
          <div className="text-center text-blueGray-400 py-8">
            No properties found
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {accounts.map((account) => (
              <div
                key={account.accountId}
                className="bg-blueGray-50 border border-blueGray-100 rounded-lg p-4 hover:shadow-lg transition-shadow mt-3"
              >
                {/* Header */}
                <div className="flex justify-between items-start mb-3 pb-3 border-b border-blueGray-200">
                  <div>
                    <h4 className="font-semibold text-blueGray-700 text-lg">
                      {account.projectName}
                    </h4>
                    <p className="text-sm text-blueGray-500">
                      Unit: {account.unitSerial}
                    </p>
                  </div>
                  <span
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium"
                    style={getStatusBadgeStyle(account.status)}
                  >
                    {account.status}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-blueGray-500">Type:</span>
                    <span className="text-blueGray-700 font-medium">
                      {account.unitType}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blueGray-500">Duration:</span>
                    <span className="text-blueGray-700 font-medium">
                      {account.durationInMonths} months
                    </span>
                  </div>
                </div>

                {/* Financials */}
                <div className="bg-white rounded p-3 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-blueGray-500">Total Amount:</span>
                    <span className="text-blueGray-700 font-semibold">
                      {formatCurrency(account.totalAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-emerald-500">Paid:</span>
                    <span className="text-emerald-600 font-semibold">
                      {formatCurrency(account.totalPaidAmount)}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-blueGray-100 pt-2 mt-2">
                    <span className="text-orange-500">Remaining:</span>
                    <span className="text-orange-600 font-bold">
                      {formatCurrency(account.totalBalanceAmount)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                {account.totalAmount > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-blueGray-500 mb-1">
                      <span>Payment Progress</span>
                      <span>
                        {getProgressPercentage(
                          account.totalPaidAmount,
                          account.totalAmount,
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-blueGray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${getProgressPercentage(
                            account.totalPaidAmount,
                            account.totalAmount,
                          )}%`,
                          background: "linear-gradient(90deg, #10b981, #3b82f6)",
                          minWidth: getProgressPercentage(account.totalPaidAmount, account.totalAmount) > 0 ? "3px" : "0px"
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
