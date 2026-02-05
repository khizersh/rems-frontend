import React, { useEffect, useState, useContext } from "react";
import httpService from "../../../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../../../components/table/DynamicTableComponent.js";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min.js";
import { v4 as uuidv4 } from "uuid";
import { FaEye, FaPen, FaTrashAlt, FaDownload } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import DynamicDetailsModal from "components/CustomerComponents/DynamicModal.js";
import { RiFolderReceivedFill } from "react-icons/ri";
import { GoSearch } from "react-icons/go";

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
  const [idempotencyKey] = useState(generateIdempotencyKey());
  const [expenseDetail, setExpenseDetail] = useState({
    vendorAccountId: 0,
    amountPaid: 0,
    organizationId: 10,
    organizationAccountId: 0,
    paymentType: "",
    paymentDocNo: 0,
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
      className: "text-green-600",
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
      icon: FaEye,
      onClick: handleViewAccountDetail,
      title: "View Account Detail",
      className: "text-green-600",
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

  function generateIdempotencyKey() {
    let key = sessionStorage.getItem("vendor_payment_key");
    console.log("key exist :: ", key);

    if (!key) {
      key = `VP-${crypto.randomUUID()}`;
      console.log("key new :: ", key);
      sessionStorage.setItem("vendor_payment_key", key);
    }

    return key;
  }

  const handleSubmit = async () => {
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
      };

      const data = await httpService.post(
        "/vendorAccount/paybackCredit",
        requestBody,
      );

      notifySuccess(data?.responseMessage || "Payback successful", 3000);
      setIsPaymentModalOpen(false);
      setBackdrop(!backdrop);
      await fetchVendorList();

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
      sessionStorage.removeItem("vendor_payment_key");
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
          <div>
            <div className="payback-modal inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded shadow-lg  w-full max-w-xl">
                <div className="flex justify-between items-center mb-4 p-4">
                  <h2 className="text-xl font-bold uppercase">Pay Back Form</h2>
                  <button onClick={togglePaymentModal}>
                    <RxCross2 className="w-5 h-5 text-red-500" />
                  </button>
                </div>

                <div className="grid grid-cols-12 gap-4 payback-form">
                  <div className="flex flex-wrap bg-white">
                    <div className="w-full lg:w-3/12 px-2 mb-2">
                      <div className="relative w-full mb-2">
                        <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                          Amount
                        </label>
                        <input
                          name="amountPaid"
                          type="number"
                          value={expenseDetail.amountPaid}
                          onChange={changeExpenseDetail}
                          className="border rounded px-3 py-2 w-full"
                          placeholder="Enter amount"
                        />
                      </div>
                    </div>
                    <div className="w-full lg:w-3/12 px-2 mb-2">
                      <div className="relative w-full mb-2">
                        <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                          Select Account
                        </label>
                        <select
                          name="organizationAccountId"
                          value={expenseDetail.organizationAccountId}
                          onChange={changeExpenseDetail}
                          className="border rounded px-3 py-2 w-full"
                        >
                          <option value="">All Account</option>
                          {accountList.map((account) => (
                            <option key={account.id} value={account.id}>
                              {account.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="w-full lg:w-3/12 px-2 mb-2">
                      <div className="relative w-full mb-2">
                        <label
                          className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                          htmlFor="projectType"
                        >
                          Payment Type
                        </label>
                        <select
                          id="paymentType"
                          name="paymentType"
                          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                          value={expenseDetail.paymentType}
                          onChange={changeExpenseDetail}
                        >
                          <option value="">SELECT PAYMENT TYPE</option>
                          {/* minimal static options to match ExpenseList */}
                          <option value="CASH">CASH</option>
                          <option value="CHEQUE">CHEQUE</option>
                          <option value="PAY_ORDER">PAY_ORDER</option>
                        </select>
                      </div>
                    </div>
                    {expenseDetail.paymentType == "CHEQUE" ||
                    expenseDetail.paymentType == "PAY_ORDER" ? (
                      <>
                        <div className="w-full lg:w-3/12 px-2 mb-2">
                          <div className="relative w-full mb-2">
                            <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                              {expenseDetail.paymentType == "CHEQUE"
                                ? "Cheque"
                                : "Pay Order"}{" "}
                              No
                            </label>
                            <input
                              name="paymentDocNo"
                              type="text"
                              value={expenseDetail.paymentDocNo}
                              onChange={changeExpenseDetail}
                              className="border rounded px-3 py-2 w-full"
                              placeholder="Enter amount"
                            />
                          </div>
                        </div>
                        <div className="w-full lg:w-3/12 px-2 mb-2">
                          <div className="relative w-full mb-2">
                            <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                              {expenseDetail.paymentType == "CHEQUE"
                                ? "Cheque"
                                : "Pay Order"}{" "}
                              Date
                            </label>
                            <input
                              type="datetime-local"
                              name="paymentDocDate"
                              value={expenseDetail.paymentDocDate}
                              onChange={changeExpenseDetail}
                              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                            />
                          </div>
                        </div>
                      </>
                    ) : (
                      ""
                    )}

                    <div className="w-full lg:w-3/12 px-2 mb-2">
                      <div className="relative w-full mb-2">
                        <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                          Created Date
                        </label>
                        <input
                          type="datetime-local"
                          name="createdDate"
                          value={expenseDetail.createdDate}
                          onChange={changeExpenseDetail}
                          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                        />
                      </div>
                    </div>

                    <div className="w-full lg:w-12/12 px-2 mb-2">
                      <div className="relative w-full mb-2">
                        <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                          Comments
                        </label>
                        <textarea
                          name="comments"
                          value={expenseDetail.comments}
                          onChange={changeExpenseDetail}
                          className="border rounded px-3 py-2 w-full"
                          placeholder="Enter comments"
                        />
                      </div>
                    </div>

                    {organizationLocal.paybackByVendor ? (
                      <div className="w-full lg:w-12/12 px-2 text-left">
                        <button
                          type="submit"
                          onClick={handleSubmit}
                          className="mt-3 bg-emerald-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
                        >
                          <FaDownload
                            className="w-5 h-5 inline-block "
                            style={{
                              paddingBottom: "3px",
                              paddingRight: "5px",
                            }}
                          />
                          Pay Back
                        </button>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <></>
        )}
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
