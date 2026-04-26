import React, { useEffect, useState, useContext } from "react";
import httpService from "../../../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../../../components/table/DynamicTableComponent.js";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min.js";
import { v4 as uuidv4 } from "uuid";
import {
  FaEye,
  FaPen,
  FaTrashAlt,
  FaDownload,
  FaCreditCard,
  FaCalendarAlt,
  FaMoneyBillAlt,
  FaChartLine,
} from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { IoArrowBackOutline } from "react-icons/io5";
import DynamicDetailsModal from "components/CustomerComponents/DynamicModal.js";
import { BsFillSave2Fill } from "react-icons/bs";
import { MdPrint } from "react-icons/md";
import { paymentTypes } from "utility/Utility.js";

export default function VendorPaymentHistory() {
  const {
    loading,
    setLoading,
    notifyError,
    notifySuccess,
    backdrop,
    setBackdrop,
  } = useContext(MainContext);
  const [vendorName, setVendorName] = useState("");
  const { accountId } = useParams();

  const [accountDetailList, setAccountDetailList] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentItem, setSelectedPaymentItem] = useState(null);
  const [accountList, setAccountList] = useState([]);
  const [isUpdateMode, setIsUpdateMode] = useState(false);
  const [totalPaid, setTotalPaid] = useState(0);
  const [totalCredit, setTotalCredit] = useState(0);
  const [totalAmount, setTotalAmount] = useState(0);
  const [expenseDetail, setExpenseDetail] = useState({
    vendorAccountId: 0,
    amountPaid: 0,
    organizationId: 0,
    organizationAccountId: 0,
    paymentMethodType: "",
    paymentDocNo: 0,
    paymentDocDate: new Date().toISOString().slice(0, 16),
    createdDate: new Date().toISOString().slice(0, 16),
    comments: "",
  });
  const organizationLocal =
    JSON.parse(localStorage.getItem("organization")) || {};
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    generateIdempotencyKey(),
  );

  function generateIdempotencyKey(forceNew = false) {
    let key = sessionStorage.getItem("vendor_payment_key");
    if (!key || forceNew) {
      key = `VP-${crypto.randomUUID()}`;
      sessionStorage.setItem("vendor_payment_key", key);
    }
    return key;
  }

  const fetchAccountList = async () => {
    setLoading(true);
    try {
      const requestBody = {
        id: accountId,
        page,
        size: pageSize,
        sortBy: "createdDate",
        sortDir: "desc",
      };

      const response = await httpService.post(
        `/vendorAccount/getHistoryByAccountId`,
        requestBody,
      );

      if (response?.data?.content.length > 0) {
        setVendorName(response?.data?.content[0].vendorAccount);
      }

      setAccountDetailList(response?.data?.content || []);
      // try to extract totals from possible response shapes but don't overwrite with 0
      const respData = response?.data || {};
      const mainData = respData.data || respData;
      const maybeTotalPaid = mainData.totalPaid ?? respData.totalPaid ?? null;
      const maybeTotalCredit =
        mainData.totalCredit ?? respData.totalCredit ?? null;
      const maybeTotalAmount =
        mainData.totalAmount ?? respData.totalAmount ?? null;
      if (maybeTotalPaid !== null && maybeTotalPaid !== undefined)
        setTotalPaid(Number(maybeTotalPaid) || 0);
      if (maybeTotalCredit !== null && maybeTotalCredit !== undefined)
        setTotalCredit(Number(maybeTotalCredit) || 0);
      if (maybeTotalAmount !== null && maybeTotalAmount !== undefined)
        setTotalAmount(Number(maybeTotalAmount) || 0);
      setTotalPages(response?.data?.totalPages || 0);
      setTotalElements(response?.data?.totalElements || 0);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountDetail = async () => {
    setLoading(true);
    try {
      const response = await httpService.get(
        `/vendorAccount/getById/${accountId}`,
      );

      const data = response?.data || {};

      // populate totals if available on this single-account response
      const tp =
        Number(
          data.totalAmountPaid ?? data.totalPaid ?? data.totalPaidAmount ?? 0,
        ) || 0;
      const tc =
        Number(
          data.totalCreditAmount ??
            data.totalCredit ??
            data.totalCreditAmount ??
            0,
        ) || 0;
      const ta = Number(data.totalAmount ?? 0) || 0;

      setTotalPaid(tp);
      setTotalCredit(tc);
      setTotalAmount(ta);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountList();
  }, [page, pageSize]);

  const fetchOrgAccountList = async () => {
    try {
      if (!organizationLocal?.organizationId) return;
      const resp = await httpService.get(
        `/organizationAccount/getAccountByOrgId/${organizationLocal.organizationId}`,
      );
      setAccountList(resp?.data || []);
    } catch (err) {
      // ignore
    }
  };

  useEffect(() => {
    fetchOrgAccountList();
    fetchAccountDetail();
  }, []);

  const tableColumns = [
    { header: "From Account", field: "organizationAccount" },
    { header: "Payment Method", field: "paymentMethodType" },
    // {
    //   header: "Type",
    //   field: "transactionType",
    //   render: (value) => {
    //     const baseClass = "font-semibold uppercase";
    //     if (value === "CREDIT")
    //       return (
    //         <span className="text-red-600">
    //           <i className="fas fa-arrow-up text-red-500 mr-4"></i>
    //           {value}
    //         </span>
    //       );
    //     if (value === "DEBIT")
    //       return (
    //         <span className="text-green-600">
    //           <i className="fas fa-arrow-down text-emerald-500 mr-4"></i>
    //           {value}
    //         </span>
    //       );
    //     else
    //       return (
    //         <span>
    //           <i className="fas fa-arrow-up text-emerald-500"></i>
    //           <i className="fas fa-arrow-down text-red-500 mr-2"></i>
    //           {value}
    //         </span>
    //       );
    //   },
    // },
    {
      header: "Payment Type",
      field: "vendorPaymentType",
      render: (value) => {
        const baseClass = "font-semibold uppercase";
        if (value === "DIRECT_PURCHASE")
          return (
            <span className="text-red-600">
              <i className="fas fa-arrow-up text-red-500 d-inline mr-1"></i>
              {value}
            </span>
          );
        if (value === "DUE_CLEARANCE")
          return (
            <span className="text-green-600">
              <i className="fas fa-arrow-down text-emerald-500 d-inline mr-1"></i>
              {value}{" "}
            </span>
          );
        if (value === "PDC_CLEARANCE")
          return (
            <span className="text-lightBlue-600 font-semibold">
              <i className="fas fa-arrow-down  text-lightBlue-600  d-inline mr-1"></i>
              {value}{" "}
            </span>
          );
        else return <span>-</span>;
      },
    },
    { header: "Paid Amount", field: "amountPaid" },
    { header: "Credit Amount", field: "creditAmount" },
    { header: "Balance Amount", field: "balanceAmount" },
    { header: "Comments", field: "comments" },
    { header: "Date", field: "createdDate" },
  ];

  const changeExpenseDetail = (e) => {
    const { name, value } = e.target;
    setExpenseDetail((prev) => ({ ...prev, [name]: value }));
  };

  const togglePaymentModal = () => {
    const newState = !isPaymentModalOpen;
    setBackdrop(!backdrop);
    setIsPaymentModalOpen(newState);
    if (!newState) setIsUpdateMode(false);
  };

  const handleSubmitPayback = async () => {
    setLoading(true);
    try {
      if (isUpdateMode && selectedPaymentItem && selectedPaymentItem.id) {
        // update existing payback for Due Clearance
        const requestBody = {
          amountPaid: Number(expenseDetail.amountPaid) || 0,
          organizationAccountId:
            Number(expenseDetail.organizationAccountId) || null,
          organizationId:
            organizationLocal?.organizationId || expenseDetail.organizationId,
          comments: expenseDetail.comments || "",
          paymentMethodType: expenseDetail.paymentMethodType || "",
          paymentDocNo: expenseDetail.paymentDocNo || "",
          paymentDocDate: expenseDetail.paymentDocDate || null,
        };

        const resp = await httpService.put(
          `/vendorAccount/updatePayback/${selectedPaymentItem.id}`,
          requestBody,
        );

        notifySuccess &&
          notifySuccess(resp?.responseMessage || "Update successful", 3000);
      } else {
        // create new payback
        if (expenseDetail.paymentMethodType === "CHEQUE") {
          if (
            !expenseDetail.paymentDocNo ||
            expenseDetail.paymentDocNo.toString().trim() === ""
          ) {
            notifyError("Cheque number is required", 4000);
            setLoading(false);
            return;
          }
          if (!expenseDetail.paymentDocDate) {
            notifyError("Cheque date is required", 4000);
            setLoading(false);
            return;
          }
        }

        const requestBody = {
          ...expenseDetail,
          organizationId:
            organizationLocal?.organizationId || expenseDetail.organizationId,
          vendorAccountId: vendorName
            ? Number(accountId)
            : expenseDetail.vendorAccountId,
          organizationAccountId:
            Number(expenseDetail.organizationAccountId) || null,
          amountPaid: Number(expenseDetail.amountPaid) || 0,
          idempotencyKey: idempotencyKey,
          paymentMethodType: expenseDetail.paymentMethodType || "",
          paymentDocNo: expenseDetail.paymentDocNo || "",
          paymentDocDate: expenseDetail.paymentDocDate
            ? new Date(expenseDetail.paymentDocDate).toISOString()
            : null,
          comments: expenseDetail.comments || "",
        };

        const resp = await httpService.post(
          "/vendorAccount/paybackCredit",
          requestBody,
        );

        if (resp?.data?.pdcRecord) {
          const pdc = resp.data.pdcRecord;
          notifySuccess &&
            notifySuccess(
              `PDC created successfully! Cheque #${pdc.chequeNumber} will be processed on ${pdc.chequeDate}`,
              5000,
            );
        } else {
          notifySuccess &&
            notifySuccess(resp?.responseMessage || "Payback successful", 3000);
        }
      }

      // common cleanup
      setIsPaymentModalOpen(false);
      setBackdrop(!backdrop);
      await fetchAccountList();
      await fetchAccountDetail();

      setExpenseDetail({
        vendorAccountId: 0,
        amountPaid: 0,
        organizationId: organizationLocal?.organizationId || 0,
        organizationAccountId: 0,
        paymentType: "",
        paymentDocNo: 0,
        paymentDocDate: new Date().toISOString().slice(0, 16),
        createdDate: new Date().toISOString().slice(0, 16),
        comments: "",
      });
      setSelectedPaymentItem(null);
      setIsUpdateMode(false);
      sessionStorage.removeItem("vendor_payment_key");
      setIdempotencyKey(generateIdempotencyKey(true));
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (floor) => {
    console.log("Edit Floor:", floor);
    // Implement edit functionality
  };

  const handleDelete = (floor) => {
    console.log("Delete Floor:", floor);
    // Implement delete logic
  };

  const actions = [];

  const handleOpenUpdate = (row) => {
    if (!row) return notifyError("Invalid transaction", 4000);
    if (row.vendorPaymentType !== "DUE_CLEARANCE") {
      return notifyError(
        "Only Due Clearance transactions can be updated",
        4000,
      );
    }
    setSelectedPaymentItem(row);
    setExpenseDetail((prev) => {
      let createdDateVal = prev.createdDate;
      try {
        if (row.createdDate) {
          // normalize to datetime-local `YYYY-MM-DDTHH:mm`
          const d = new Date(row.createdDate);
          if (!isNaN(d.getTime()))
            createdDateVal = d.toISOString().slice(0, 16);
          else if (
            typeof row.createdDate === "string" &&
            row.createdDate.includes("T")
          )
            createdDateVal = row.createdDate.slice(0, 16);
        }
      } catch (e) {
        // fallback to previous value
      }
      return {
        ...prev,
        vendorAccountId: Number(accountId) || prev.vendorAccountId,
        amountPaid: row.amountPaid || 0,
        organizationAccountId:
          row.organizationAccountId || prev.organizationAccountId,
        comments: row.comments || prev.comments,
        paymentMethodType: row.paymentMethodType || prev.paymentMethodType,
        createdDate: createdDateVal,
      };
    });
    setIsUpdateMode(true);
    setIsPaymentModalOpen(true);
    setBackdrop(!backdrop);
  };

  // Add update action (will validate inside handler)
  actions.push({
    icon: FaPen,
    onClick: handleOpenUpdate,
    title: "Update Payback",
    className: "yellow",
  });

  const handlePrint = async () => {
    setLoading(true);

    try {
      const response = await httpService.get(
        `/vendorAccount/getHistoryByAccountIdPrint/${accountId}`,
      );

      response.organizationTitle = "VISION BUILDERS & MARKETING";
      response.address = "SHOP # 4, B-81 Mustafabad, Malir City, Karachi";
      response.numbers =
        "0336-2590911, 03132107640, 0313-2510343, 0347-2494998";

      const html = generateVendorLedgerHTML(response);

      const win = window.open("", "_blank");
      win.document.write(html);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 500); // slight delay to render
      setLoading(false);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
      setLoading(false);
    }
  };

  const generateVendorLedgerHTML = (input) => {
    let data = input.data?.list;
    let mainData = input.data;
    const formattedDate = new Date().toLocaleString();
    return `
  <html>
    <head>
      <title>Vendor Ledger</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 14px; margin: 20px; }
        .ledger-container { width: 800px; margin: auto; }
        .header { text-align: center; }
        .header h2 { margin: 0; font-size: 20px; }
        .header p { margin: 0; font-size: 12px; }
        .ledger-title { font-weight: bold; font-size: 16px; background: #000; color: #fff; padding: 5px; display: inline-block; margin: 10px 0; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid black; padding: 8px; text-align: left; font-size: 13px; }
        .footer { margin-top: 30px; border-top: 1px solid black; }
        .signature { text-align: right; margin-top: 50px; }
      </style>
    </head>
    <body>
      <div class="ledger-container">
        <div class="header">
          <h2>${input?.organizationTitle}</h2>
          <p>${input?.address}</p>
          <p>${input?.numbers}</p>
          <div class="ledger-title">VENDOR LEDGER</div>
        </div>

        <div>
          <p><strong>Vendor Name:</strong> ${data[0]?.vendorAccount}</p>
          <p><strong>Total Paid:</strong> ${parseFloat(
            mainData?.totalPaid,
          ).toLocaleString()}</p>
          <p><strong>Total Credit:</strong> ${parseFloat(
            mainData?.totalCredit,
          ).toLocaleString()}</p>
          <p><strong>Total Amount:</strong> ${parseFloat(
            mainData?.totalAmount,
          ).toLocaleString()}</p>
          <p><strong>Ledger Date:</strong> ${formattedDate}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Sr#</th>
              <th>Date</th>
              <th>Transaction Type</th>
              <th>Payment Type</th>
              <th>Debit (Paid)</th>
              <th>Credit (Borrow)</th>
              <th>Total</th>
              <th>Balance Amount</th>
            </tr>
          </thead>
          <tbody>
            ${data
              .map((detail, ind) => {
                return `
                  <tr>
                    <td>${ind + 1}</td>
                    <td>${detail.createdDate.split("T")[0]}</td>
                    <td>${detail.transactionType}</td>
                    <td>${detail.vendorPaymentType}</td>
                    <td>${parseFloat(detail.amountPaid).toLocaleString()}</td>
                    <td>${parseFloat(detail.creditAmount).toLocaleString()}</td>
                    <td>${parseFloat(
                      detail.amountPaid + detail.creditAmount,
                    ).toLocaleString()}</td>
                    <td>${parseFloat(
                      detail.balanceAmount,
                    ).toLocaleString()}</td>
                  </tr>
                `;
              })
              .join("")}
          </tbody>
        </table>


        <div class="footer">
          <p><strong>Print Date:</strong> ${formattedDate}</p>
        
        </div>
      </div>
    </body>
  </html>
  `;
  };

  const history = useHistory();

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 border-0">
      {/* Page Header */}
      <div className="mb-4 py-4 px-4">
        <h6 className="text-blueGray-700 text-lg font-bold uppercase flex items-center">
          <button onClick={() => history.goBack()} className="mr-3">
            <IoArrowBackOutline
              className="text-xl"
              style={{ color: "#64748b" }}
            />
          </button>
          <FaChartLine className="mr-2" style={{ color: "#10b981" }} />
          Vendor Payment History
        </h6>
      </div>

      {/* Modal */}
      {isPaymentModalOpen ? (
        <div className="payback-modal-position">
          <div
            className="bg-white rounded-xl shadow-xl border border-gray-200 w-full overflow-y-auto"
            style={{ maxHeight: "80vh" }}
          >
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200">
              <h2 className="text-base font-bold text-gray-700 uppercase flex items-center">
                <FaDownload className="mr-2" style={{ color: "#10b981" }} />
                {isUpdateMode ? "Update Payback" : "Pay Back"}
              </h2>
              <button
                onClick={togglePaymentModal}
                className="text-gray-400 hover:text-red-500 transition-colors"
              >
                <RxCross2 className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-6">
              <div className="space-y-4 payback-form">
                {/* Payment Details Section */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
                    <FaCreditCard
                      className="mr-2"
                      style={{ fontSize: "14px", color: "#10b981" }}
                    />
                    Payment Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Amount
                      </label>
                      <input
                        name="amountPaid"
                        type="number"
                        value={expenseDetail.amountPaid}
                        onChange={changeExpenseDetail}
                        className="w-full p-2 border rounded-lg text-sm"
                        placeholder="Enter amount"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Select Account
                      </label>
                      <select
                        name="organizationAccountId"
                        value={expenseDetail.organizationAccountId}
                        onChange={changeExpenseDetail}
                        className="w-full p-2 border rounded-lg text-sm"
                      >
                        <option value="">Select Account</option>
                        {accountList.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Payment Type
                      </label>
                      <select
                        id="paymentMethodType"
                        name="paymentMethodType"
                        value={expenseDetail.paymentMethodType}
                        onChange={changeExpenseDetail}
                        className="w-full p-2 border rounded-lg text-sm"
                      >
                        <option value="">Select Payment Type</option>
                        {[
                          { id: "CASH", name: "Cash Payment" },
                          { id: "ONLINE", name: "Online Payment" },
                          { id: "PAY_ORDER", name: "Pay Order" },
                          { id: "CHEQUE", name: "Post-Dated Cheque (PDC)" },
                        ].map((type, index) => (
                          <option key={index} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Cheque / Pay Order Details Section */}
                {(expenseDetail.paymentMethodType === "CHEQUE" ||
                  expenseDetail.paymentMethodType === "PAY_ORDER") && (
                  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
                      <FaCalendarAlt
                        className="mr-2"
                        style={{ fontSize: "14px", color: "#6366f1" }}
                      />
                      {expenseDetail.paymentMethodType === "CHEQUE"
                        ? "Cheque"
                        : "Pay Order"}{" "}
                      Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          {expenseDetail.paymentMethodType === "CHEQUE"
                            ? "Cheque"
                            : "Pay Order"}{" "}
                          No
                        </label>
                        <input
                          name="paymentDocNo"
                          type="text"
                          value={expenseDetail.paymentDocNo}
                          onChange={changeExpenseDetail}
                          className="w-full p-2 border rounded-lg text-sm"
                          placeholder="Enter number"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          {expenseDetail.paymentMethodType === "CHEQUE"
                            ? "Cheque"
                            : "Pay Order"}{" "}
                          Date
                        </label>
                        <input
                          type="datetime-local"
                          name="paymentDocDate"
                          value={expenseDetail.paymentDocDate}
                          onChange={changeExpenseDetail}
                          className="w-full p-2 border rounded-lg text-sm"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Additional Info Section */}
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
                    <FaDownload
                      className="mr-2"
                      style={{ fontSize: "14px", color: "#f59e0b" }}
                    />
                    Additional Info
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Created Date
                      </label>
                      <input
                        type="datetime-local"
                        name="createdDate"
                        value={expenseDetail.createdDate}
                        onChange={changeExpenseDetail}
                        className="w-full p-2 border rounded-lg text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        {expenseDetail.paymentMethodType === "CHEQUE"
                          ? "Bank Name (Optional)"
                          : "Comments"}
                      </label>
                      {expenseDetail.paymentMethodType === "CHEQUE" ? (
                        <input
                          type="text"
                          name="comments"
                          value={expenseDetail.comments}
                          onChange={changeExpenseDetail}
                          className="w-full p-2 border rounded-lg text-sm"
                          placeholder="Enter bank name (optional)"
                        />
                      ) : (
                        <textarea
                          name="comments"
                          value={expenseDetail.comments}
                          onChange={changeExpenseDetail}
                          className="w-full p-2 border rounded-lg text-sm"
                          placeholder="Enter comments"
                          rows={2}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={togglePaymentModal}
                  className="bg-gray-100 text-gray-700 font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-md hover:bg-gray-200 transition-all mr-3 inline-flex items-center"
                >
                  <RxCross2 className="mr-1" />
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmitPayback}
                  className="bg-emerald-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 inline-flex items-center"
                >
                  <FaDownload className="mr-2" style={{ color: "white" }} />
                  {isUpdateMode ? "Update" : "Pay Back"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {/* Summary Cards */}
      <div className="px-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5 flex items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center mr-4 flex-shrink-0">
              <FaMoneyBillAlt style={{ color: "#10b981", fontSize: "20px" }} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                Total Paid
              </p>
              <p className="text-xl font-bold text-emerald-600">
                {parseFloat(totalPaid || 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5 flex items-center">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4 flex-shrink-0">
              <FaCreditCard style={{ color: "#ef4444", fontSize: "20px" }} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                Total Credit
              </p>
              <p className="text-xl font-bold text-red-500">
                {parseFloat(totalCredit || 0).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5 flex items-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4 flex-shrink-0">
              <FaChartLine style={{ color: "#3b82f6", fontSize: "20px" }} />
            </div>
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
                Total Amount
              </p>
              <p className="text-xl font-bold text-blue-600">
                {parseFloat(totalAmount || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="px-4">
        <DynamicTableComponent
          fetchDataFunction={fetchAccountList}
          setPage={setPage}
          page={page}
          setPageSize={setPageSize}
          data={accountDetailList}
          columns={tableColumns}
          pageSize={pageSize}
          totalPages={totalPages}
          totalElements={totalElements}
          loading={loading}
          title={`Vendor Account Detail - ${vendorName}`}
          actions={actions}
          firstButton={{
            icon: MdPrint,
            onClick: handlePrint,
            title: "Print Report",
            className: "bg-emerald-500",
          }}
          secondButton={{
            title: "Pay Back",
            onClick: () => {
              setExpenseDetail((prev) => ({
                ...prev,
                vendorAccountId: Number(accountId) || prev.vendorAccountId,
                organizationId:
                  organizationLocal?.organizationId || prev.organizationId,
              }));
              setIsPaymentModalOpen(true);
              setBackdrop(!backdrop);
            },
            icon: FaDownload,
            className: "bg-emerald-500",
          }}
        />
      </div>
    </div>
  );
}
