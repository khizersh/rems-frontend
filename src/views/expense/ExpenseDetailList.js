import React, { useEffect, useState, useContext } from "react";
import httpService from "../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../components/table/DynamicTableComponent.js";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min.js";
import { FaDownload } from "react-icons/fa6";
import "../../assets/styles/responsive.css";

import { FaEye, FaPen, FaTrashAlt, FaUserPlus } from "react-icons/fa";
import DynamicDetailsModal from "components/CustomerComponents/DynamicModal.js";
import DynamicFormModal from "components/CustomerComponents/DynamicFormModal.js";
import { RxCross2 } from "react-icons/rx";

export default function ExpenseDetailList() {
  const {
    loading,
    setLoading,
    notifyError,
    notifySuccess,
    backdrop,
    setBackdrop,
  } = useContext(MainContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const history = useHistory();
  const [expenseList, setExpenseList] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [accountList, setAccountList] = useState([]);
  const pageSize = 10;
  const { expenseId } = useParams();
  const [expenseDetail, setExpenseDetail] = useState({
    expenseId: 0,
    amountPaid: 0,
    organizationAccountId: 0,
  });

  const fetchExpenseList = async () => {
    setLoading(true);
    try {
      const response = await httpService.get(
        `/expense/getExpenseDetailByExpenseId/${expenseId}`
      );

      setSelectedExpense(response?.data?.expense || {});
      setExpenseList(response?.data?.expenseDetail || []);
      setTotalPages(response?.data?.totalPages || 0);
      setTotalElements(response?.data?.totalElements || 0);
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
          `/organizationAccount/getAccountByOrgId/${organizationLocal.organizationId}`
        );

        setAccountList(response?.data || []);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenseList();
    fetchAccountList();
  }, []);

  const tableColumns = [
    { header: "Expense Title", field: "expenseTitle" },
    { header: "Account Title", field: "organizationAccountTitle" },
    { header: "Amount Paid", field: "amountPaid" },
    { header: "Created By", field: "createdBy" },
    // { header: "Updated By", field: "updatedBy" },
    { header: "Created Date", field: "createdDate" },
    // { header: "Updated Date", field: "updatedDate" },
  ];

  const handleEdit = (floor) => {
    console.log("Edit Floor:", floor);
    // Implement edit functionality
  };

  const handleDelete = (floor) => {
    console.log("Delete Floor:", floor);
    // Implement delete logic
  };
  const handleViewAccountDetail = (data) => {
    if (!data) {
      return notifyError("Invalid Account!", 4000);
    }
    history.push(`/dashboard/vendor-account-detail/${data.id}`);
  };

  const actions = [
    // { icon: FaPen, onClick: handleEdit, title: "Edit", className: "yellow" },
    // {
    //   icon: FaTrashAlt,
    //   onClick: handleDelete,
    //   title: "Delete",
    //   className: "text-red-600",
    // },
  ];

  const toggleModal = () => {
    setBackdrop(!backdrop);
    setIsModalOpen(!isModalOpen);
  };

  const changeExpenseDetail = (e) => {
    const { name, value } = e.target;
    setExpenseDetail((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      let requestBody = { ...expenseDetail, expenseId };

      console.log("requestBody :: ", requestBody);

      const data = await httpService.post(
        "/expense/addExpenseDetail",
        requestBody
      );

      notifySuccess(data.responseMessage, 3000);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {isModalOpen ? (
        <div>
          <div className="payback-modal inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-lg  w-full max-w-xl">
              <div className="flex justify-between items-center mb-4 p-4">
                <h2 className="text-xl font-bold uppercase">Pay Back Form</h2>
                <button onClick={toggleModal}>
                  <RxCross2 className="w-5 h-5 text-red-500" />
                </button>
              </div>

              <div className="grid grid-cols-12 gap-4 payback-form">
                <div className="flex flex-wrap bg-white">
                  <div className="w-full lg:w-4/12 px-2 mb-2">
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
                  <div className="w-full lg:w-4/12 px-2 mb-2">
                    <label className="block text-sm font-medium mb-1 ">
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
                  <div className="w-full lg:w-4/12 px-2 text-right">
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      className="mt-7  bg-emerald-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
                    >
                      <FaDownload
                        className="w-5 h-5 inline-block "
                        style={{ paddingBottom: "3px", paddingRight: "5px" }}
                      />
                      Pay Back
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <></>
      )}
      <div className="container mx-auto p-4">
        <div className="w-full desktop-show">
          <div className="flex flex-wrap  justify-between ">
            <div className="bg-white  shadow-lg rounded p-5">
              <text className="text-green-600">Total Paid</text>:{" "}
              <p>{selectedExpense?.amountPaid}</p>
            </div>
            <div className="bg-white  shadow-lg rounded p-5">
              <text className="text-red-600">Total Credit</text>:{" "}
              <p>{selectedExpense?.creditAmount}</p>
            </div>
            <div className="bg-white  shadow-lg rounded p-5">
              <text className="text-blue-600">Total Amount</text>:{" "}
              <p>{selectedExpense?.totalAmount}</p>
            </div>
          </div>
        </div>
        <div className="w-full mobile-show">
          <div className="flex flex-wrap justify-between mb-5">
            <div className="bg-white  shadow-lg rounded p-3">
              <text className="text-green-600 text-sm">Total Paid</text>:{" "}
              <p>{selectedExpense?.amountPaid}</p>
            </div>
            <div className="bg-white  shadow-lg rounded p-3">
              <text className="text-red-600 text-sm">Total Credit</text>:{" "}
              <p>{selectedExpense?.creditAmount}</p>
            </div>
          </div>
          <div className="bg-white  shadow-lg rounded p-3">
            <text className="text-blue-600 text-sm">Total Amount</text>:{" "}
            <p>{selectedExpense?.totalAmount}</p>
          </div>
        </div>
        <div className="mt-7">
          <DynamicTableComponent
            fetchDataFunction={fetchExpenseList}
            setPage={setPage}
            page={page}
            data={expenseList}
            columns={tableColumns}
            pageSize={pageSize}
            totalPages={totalPages}
            totalElements={totalElements}
            loading={loading}
            title="Expense Detail"
            actions={actions}
            secondButton={{
              onClick: toggleModal,
              className: "bg-emerald-500",
              title: "Pay back",
              icon: FaDownload,
            }}
          />
        </div>
      </div>
    </>
  );
}
