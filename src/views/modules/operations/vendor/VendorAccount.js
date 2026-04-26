import React, { useEffect, useState, useContext } from "react";
import httpService from "../../../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../../../components/table/DynamicTableComponent.js";
import { BiSolidDetail } from "react-icons/bi";
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
} from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import DynamicDetailsModal from "components/CustomerComponents/DynamicModal.js";
import { RiFolderReceivedFill } from "react-icons/ri";
import { GoSearch } from "react-icons/go";
import { paymentTypes } from "utility/Utility.js";

export default function VendorAccount() {
  const {
    loading,
    setLoading,
    notifySuccess,
    notifyError,
    backdrop,
    setBackdrop,
  } = useContext(MainContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [vendorName, setVendorName] = useState("");
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPaymentItem, setSelectedPaymentItem] = useState(null);
  const [vendorAccountList, setVendorAccountList] = useState([]);
  const [idempotencyKey, setIdempotencyKey] = useState(() =>
    generateIdempotencyKey(),
  );
  const [expenseDetail, setExpenseDetail] = useState({
    vendorAccountId: 0,
    amountPaid: 0,
    organizationId: 10,
    organizationAccountId: 0,
    paymentMethodType: "",
    paymentDocNo: "",
    paymentDocDate: new Date().toISOString().slice(0, 16),
    createdDate: new Date().toISOString().slice(0, 16),
    comments: "",
  });

  const { floorId } = useParams();
  const history = useHistory();

  const [accountList, setAccountList] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalElements, setTotalElements] = useState(0);
  const organizationLocal =
    JSON.parse(localStorage.getItem("organization")) || {};

  const fetchVendorList = async () => {
    setLoading(true);
    try {
      let organizationLocal = JSON.parse(localStorage.getItem("organization"));
      if (organizationLocal) {
        const requestBody = {
          id: organizationLocal.organizationId,
          page,
          size: pageSize,
          sortBy: "createdDate",
          sortDir: "desc",
          filteredName: vendorName,
        };

        const response = await httpService.post(
          `/vendorAccount/getVendorAccountsByOrgId`,
          requestBody,
        );

        setVendorAccountList(response?.data?.content || []);
        setTotalPages(response?.data?.totalPages || 0);
        setTotalElements(response?.data?.totalElements || 0);
      }
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const fetchAccountList = async () => {
    try {
      setLoading(true);
      let organizationLocal = JSON.parse(localStorage.getItem("organization"));
      if (organizationLocal) {
        const response = await httpService.get(
          `/organizationAccount/getAccountByOrgId/${organizationLocal.organizationId}`,
        );

        setAccountList(response?.data || []);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendorList();
  }, [page, pageSize]);

  useEffect(() => {
    fetchAccountList();
  }, []);

  const tableColumns = [
    { header: "Vendor Title", field: "name" },
    { header: "Total Amount Paid", field: "totalAmountPaid" },
    { header: "Total Credit Amount", field: "totalCreditAmount" },
    // { header: "Total Balance Amount", field: "totalBalanceAmount" },
    { header: "Total Amount", field: "totalAmount" },
    { header: "Last Updated", field: "lastUpdatedDateTime" },
  ];

  const handleView = (data) => {
    const formattedUnitDetails = {
      "Account Detail": {
        "Account Title": data?.name,
        "Total Amount Paid": data?.totalAmountPaid,
        "Total Credit Amount": data?.totalCreditAmount,
        // "Total Balance Amount": data?.totalBalanceAmount,
        "Total Amount": data?.totalAmount,
      },
      "Audit Info": {
        "Last Updated": data?.lastUpdatedDateTime,
        "Created By": data?.createdBy,
        "Created Date": data?.createdDate,
        "Updated By": data?.updatedBy,
        "Updated Date": data?.updatedDate,
      },
    };
    setSelectedUnit(formattedUnitDetails);
    toggleModal();
  };

  const handleEdit = (data) => {
    if (!data) {
      return notifyError("Invalid Account!", 4000);
    }
    history.push(`/dashboard/update-vendor-account/${data.id}`);
  };

  const handleDelete = async (data) => {
    try {
      const confirmed = window.confirm("Are you sure to Delete this Vendor?");
      if (!confirmed) return;

      setLoading(true);
      const response = await httpService.get(
        `/vendorAccount/deleteById/${data?.id}`,
      );
      notifySuccess(response.responseMessage, 3000);

      await fetchVendorList();
      setLoading(false);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
      setLoading(false);
    }
  };

  const handleViewAccountDetail = (data) => {
    if (!data) {
      return notifyError("Invalid Account!", 4000);
    }
    history.push(`/dashboard/vendor-account-detail/${data.id}`);
  };

  const actions = [
    {
      icon: FaEye,
      onClick: handleView,
      title: "View Detail",
      className: "text-grey-600",
    },
    // include Pay Back action only when organization allows payback by vendor
    ...(organizationLocal.paybackByVendor
      ? [
          {
            icon: FaDownload,
            onClick: (data) => {
              setSelectedPaymentItem(data);
              // pre-fill expenseDetail with vendorAccountId and organizationId
              setExpenseDetail((prev) => ({
                ...prev,
                vendorAccountId: data?.id || prev.vendorAccountId,
                organizationId:
                  organizationLocal?.organizationId || prev.organizationId,
              }));
              setIsPaymentModalOpen(true);
              setBackdrop(!backdrop);
            },
            title: "Pay Back",
            className: "text-green-600",
          },
        ]
      : []),
    {
      icon: BiSolidDetail,
      onClick: handleViewAccountDetail,
      title: "View Payment History",
      className: "text-blue-600",
    },
    { icon: FaPen, onClick: handleEdit, title: "Edit", className: "yellow" },
    {
      icon: FaTrashAlt,
      onClick: handleDelete,
      title: "Delete",
      className: "text-red-600",
    },
  ];

  const toggleModal = () => {
    setBackdrop(!backdrop);
    setIsModalOpen(!isModalOpen);
  };

  const togglePaymentModal = () => {
    setBackdrop(!backdrop);
    setIsPaymentModalOpen(!isPaymentModalOpen);
  };

  const changeExpenseDetail = (e) => {
    const { name, value } = e.target;
    setExpenseDetail((prev) => ({ ...prev, [name]: value }));
  };

  function generateIdempotencyKey(forceNew = false) {
    let key = sessionStorage.getItem("vendor_payment_key");
    if (!key || forceNew) {
      key = `VP-${crypto.randomUUID()}`;
      sessionStorage.setItem("vendor_payment_key", key);
    }
    return key;
  }

  const handleSubmit = async () => {
    if (expenseDetail.paymentMethodType === "CHEQUE") {
      if (
        !expenseDetail.paymentDocNo ||
        expenseDetail.paymentDocNo.toString().trim() === ""
      ) {
        return notifyError("Cheque number is required", 4000);
      }
      if (!expenseDetail.paymentDocDate) {
        return notifyError("Cheque date is required", 4000);
      }
    }

    setLoading(true);

    try {
      const requestBody = {
        ...expenseDetail,
        organizationId:
          organizationLocal?.organizationId || expenseDetail.organizationId,
        vendorAccountId:
          selectedPaymentItem?.id || expenseDetail.vendorAccountId,
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
        notifySuccess(
          `PDC created successfully! Cheque #${pdc.chequeNumber} will be processed on ${pdc.chequeDate}`,
          5000,
        );
      } else {
        notifySuccess(resp?.responseMessage || "Payback successful", 3000);
      }
      setIsPaymentModalOpen(false);
      setBackdrop(!backdrop);
      await fetchVendorList();

      setExpenseDetail({
        vendorAccountId: 0,
        amountPaid: 0,
        organizationId: organizationLocal?.organizationId || 0,
        organizationAccountId: 0,
        paymentMethodType: "",
        paymentDocNo: "",
        paymentDocDate: new Date().toISOString().slice(0, 16),
        createdDate: new Date().toISOString().slice(0, 16),
        comments: "",
      });
      setSelectedPaymentItem(null);
      sessionStorage.removeItem("vendor_payment_key");
      setIdempotencyKey(generateIdempotencyKey(true));
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = () => {
    history.push("/dashboard/add-vendor-account");
  };

  const onClickSearch = async (e) => {
    e.preventDefault();
    try {
      fetchVendorList();
    } catch (err) {
      notifyError(err?.message, err?.data, 4000);
    }
  };

  return (
    <>
      <div className="container mx-auto p-4">
        <form onSubmit={onClickSearch}>
          <div className="px-5 rounded bg-white shadow-lg flex flex-wrap py-5 md:justify-content-between">
            <div className="rounded-12 lg:w-4/12 md:w-6/12 sm:w-12/12 md:mx-0 sm:mt-5">
              <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                Vendor Name
              </label>
              <input
                type="text"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full"
                placeholder="Enter vendor name"
              />
            </div>

            <div className="rounded-12 lg:w-4/12 md:w-6/12 sm:w-12/12">
              <button
                type="submit"
                className="px-5 mt-7 ml-4 bg-lightBlue-500 text-white font-bold uppercase text-xs py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none"
              >
                <GoSearch className="w-5 h-5 inline-block mr-1" />
                Search
              </button>
            </div>
          </div>
        </form>
      </div>
      <div className="container mx-auto p-4">
        <DynamicDetailsModal
          isOpen={isModalOpen}
          onClose={toggleModal}
          data={selectedUnit}
          title="Vendor Account Detail"
        />
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
                  Pay Back
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
                            { id: "CHEQUE", name: "Post-Dated Cheque (PDC)" }
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
                  {organizationLocal.paybackByVendor ? (
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="bg-emerald-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 inline-flex items-center"
                    >
                      <FaDownload className="mr-2" style={{ color: "white" }} />
                      Pay Back
                    </button>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        ) : null}
        <DynamicTableComponent
          fetchDataFunction={fetchVendorList}
          setPage={setPage}
          page={page}
          setPageSize={setPageSize}
          data={vendorAccountList}
          columns={tableColumns}
          pageSize={pageSize}
          totalPages={totalPages}
          totalElements={totalElements}
          loading={loading}
          title="Vendor Account"
          actions={actions}
          firstButton={{
            title: "Add Account",
            onClick: handleAddAccount,
            icon: RiFolderReceivedFill,
            className: "bg-emerald-500",
          }}
        />
      </div>
    </>
  );
}
