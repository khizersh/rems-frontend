import React, { useEffect, useState, useContext } from "react";
import httpService from "../../../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../../../components/table/DynamicTableComponent.js";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min.js";
import {
  FaDownload,
  FaEdit,
  FaEye,
  FaPen,
  FaTrashAlt,
  FaSearch,
} from "react-icons/fa";
import DynamicDetailsModal from "components/CustomerComponents/DynamicModal.js";
import { RxCross2 } from "react-icons/rx";
import { TbFileExport } from "react-icons/tb";
import "../../../../assets/styles/responsive.css";
import { BiSolidDetail } from "react-icons/bi";
import {
  paymentTypes,
  EXPENSE_TYPE,
  EXPENSE_TYPE_ID,
} from "utility/Utility.js";

export default function ExpenseList() {
  const {
    loading,
    setLoading,
    notifyError,
    notifySuccess,
    backdrop,
    setBackdrop,
  } = useContext(MainContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [filterProject, setFilterProject] = useState("");
  const [filterVendor, setFilterVendor] = useState("");
  const [projects, setProjects] = useState([]);
  const [pageSize, setPageSize] = useState(10);
  const [vendorList, setVendorList] = useState([]);
  const [filteredBy, setFilteredBy] = useState("organization");
  const [projectFileteredId, setProjectFilteredId] = useState("");
  const [vendorFileteredId, setVendorFilteredId] = useState("");
  const [accountList, setAccountList] = useState([]);
  const [expenseType, setExpenseType] = useState("ALL");
  const [accountGroupId, setAccountGroupId] = useState(null);
  const [coaId, setCoaId] = useState(null);
  const [accountGroups, setAccountGroups] = useState([]);
  const [coaList, setCoaList] = useState([]);
  const [expenseDetail, setExpenseDetail] = useState({
    expenseId: 0,
    amountPaid: 0,
    organizationAccountId: 0,
    paymentType: "",
    paymentDocNo: 0,
    paymentDocDate: new Date().toISOString().slice(0, 16),
    createdDate: new Date().toISOString().slice(0, 16),
  });
  const history = useHistory();

  const [expenseList, setExpenseList] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchProjects = async () => {
    try {
      const sidebarData =
        JSON.parse(localStorage.getItem("organization")) || null;
      if (sidebarData) {
        const response = await httpService.get(
          `/project/getAllProjectByOrg/${sidebarData.organizationId}`,
        );
        setProjects(response.data || []);
      }
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    }
  };

  const fetchExpenseList = async () => {
    setLoading(true);
    try {
      let id1 = projectFileteredId || vendorFileteredId || "";

      let id2 =
        projectFileteredId && vendorFileteredId ? vendorFileteredId : "";
      let filteredByFinal =
        projectFileteredId && vendorFileteredId
          ? "project_vendor"
          : filteredBy || "";

      const requestBody = {
        id: id1,
        id2: id2,
        filteredBy: filteredByFinal,
        expenseType: expenseType,
        accountGroupId: accountGroupId,
        coaId: coaId,
        page,
        size: pageSize,
        sortBy: "id",
        sortDir: "desc",
      };

      if (!id1) {
        const organizationLocal = JSON.parse(
          localStorage.getItem("organization"),
        );
        if (organizationLocal) {
          requestBody.id = organizationLocal.organizationId;
        }
        requestBody.filteredBy = "organization";
      }
      const response = await httpService.post(
        `/expense/getAllExpensesByIds`,
        requestBody,
      );

      setExpenseList(response?.data?.content || []);
      setTotalPages(response?.data?.totalPages || 0);
      setTotalElements(response?.data?.totalElements || 0);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const changeExpenseDetail = (e) => {
    const { name, value } = e.target;
    setExpenseDetail((prev) => ({ ...prev, [name]: value }));
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

  const fetchAccountGroups = async () => {
    try {
      const org = JSON.parse(localStorage.getItem("organization")) || null;
      if (!org) return;
      const response = await httpService.get(
        `/accounting/${org.organizationId}/getAccountGroups?accountType=${EXPENSE_TYPE_ID}`,
      );
      setAccountGroups(response?.data?.data || []);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    }
  };

  const fetchCoaList = async (groupId) => {
    try {
      if (!groupId) {
        setCoaList([]);
        return;
      }
      const org = JSON.parse(localStorage.getItem("organization")) || null;
      if (!org) return;
      const response = await httpService.get(
        `/accounting/${org.organizationId}/allChartOfAccounts?accountType=${EXPENSE_TYPE_ID}&accountGroup=${groupId}`,
      );
      setCoaList(response?.data?.data || []);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    }
  };

  const [isSearched, setIsSearched] = useState(false);

  useEffect(() => {
    fetchExpenseList();
  }, [page, pageSize]);

  useEffect(() => {
    fetchProjects();
    fetchVendors();
    fetchAccountList();
    fetchAccountGroups();
  }, []);

  // Fetch COAs automatically when account group is selected
  useEffect(() => {
    if (accountGroupId) {
      fetchCoaList(accountGroupId);
    } else {
      setCoaList([]);
    }
  }, [accountGroupId]);

  const handleExpenseTypeChange = (e) => {
    const val = e.target.value;
    setExpenseType(val);
    if (val !== "MISCELLANEOUS") {
      setAccountGroupId(null);
      setCoaId(null);
      setCoaList([]);
    } else {
      if (!accountGroups.length) fetchAccountGroups();
    }
  };

  const handleLoadCoas = async () => {
    if (!accountGroupId)
      return notifyError("Please select Account Group first", 4000);
    await fetchCoaList(accountGroupId);
  };

  const handleSearch = async () => {
    setPage(0);
    if (page == 0) {
      fetchExpenseList();
    }
  };

  const changeSelectedProjected = (projectId) => {
    setProjectFilteredId(projectId);
    setFilterProject(projectId);
    if (projectId) {
      setFilteredBy("project");
    } else {
      setFilteredBy(vendorFileteredId ? "vendor" : "");
    }
  };

  const fetchVendors = async () => {
    try {
      const sidebarData =
        JSON.parse(localStorage.getItem("organization")) || {};

      const response = await httpService.get(
        `/vendorAccount/getVendorByOrg/${sidebarData.organizationId}`,
      );
      setVendorList(response.data || []);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    }
  };

  const changeSelectedVendor = (vendorId) => {
    setVendorFilteredId(vendorId);
    setFilterVendor(vendorId);
    if (vendorId) {
      setFilteredBy("vendor");
    } else {
      setFilteredBy(projectFileteredId ? "project" : "");
    }
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      let requestBody = { ...expenseDetail, expenseId: selectedExpense.id };

      const data = await httpService.post(
        "/expense/addExpenseDetail",
        requestBody,
      );

      notifySuccess(data.responseMessage, 3000);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const tableColumns = [
    { header: "Title", field: "expenseTitle" },
    { header: "Vendor ", field: "vendorName" },
    { header: "Comments", field: "comments" },
    { header: "Account", field: "orgAccountTitle" },
    {
      header: "State",
      field: "paymentStatus",
      render: (value) => {
        const baseClass = "font-semibold uppercase";
        if (value === "PAID")
          return <span className={`${baseClass} text-green-600`}>{value}</span>;
        if (value === "PENDING")
          return <span className={`${baseClass} text-blue-600`}>{value}</span>;
        if (value === "UNPAID")
          return <span className={`${baseClass} text-red-600`}>{value}</span>;
        return <span className={`${baseClass} text-gray-600`}>{value}</span>;
      },
    },
    { header: "Paid", field: "amountPaid" },
    { header: "Credit", field: "creditAmount" },
    { header: "Total", field: "totalAmount" },
  ];

  const handleView = (data) => {
    const formattedExpenseDetails = {
      "Transaction Details": {
        "Amount Paid": data?.amountPaid,
        "Credit Amount": data?.creditAmount,
        "Total Amount": data?.totalAmount,
        "Expense Title": data?.expenseTitle,
        "Project Name": data?.projectName,
        Comments: data?.comments,
      },
      "Vendor & Organization Account": {
        "Vendor Name": data?.vendorName,
        "Org Account Title": data?.orgAccountTitle,
      },
      "Audit Info": {
        "Created By": data?.createdBy,
        "Created Date": data?.createdDate,
        "Updated By": data?.updatedBy,
        "Updated Date": data?.updatedDate,
      },
    };
    setSelectedExpense(formattedExpenseDetails);
    toggleModal();
  };

  const handlePayback = (floor) => {
    setSelectedExpense(floor);
    togglePaymentModal();
  };

  const handleEdit = (data) => {
    history.push(`/dashboard/expense-update/${data?.id}`);
  };
  const handleDelete = async (data) => {
    try {
      const confirmed = window.confirm("Are you sure to Delete this expense?");
      if (!confirmed) return;

      setLoading(true);
      const response = await httpService.get(`/expense/deleteById/${data?.id}`);
      notifySuccess(response.responseMessage, 3000);

      await fetchExpenseList();

      setLoading(false);
    } catch (error) {
      notifyError(error.message, error.data, 4000);
      setLoading(false);
    }
  };
  const handleViewExpenseDetail = (data) => {
    if (!data) {
      return notifyError("Invalid Account!", 4000);
    }
    history.push(`/dashboard/expense-detail/${data.id}`);
  };

  const actions = [
    {
      icon: FaEye,
      onClick: handleView,
      title: "View Detail",
      className: "text-grey-detail",
    },
    {
      icon: BiSolidDetail,
      onClick: handleViewExpenseDetail,
      title: "View Payment Detail",
      className: "text-blue-600",
    },
    {
      icon: FaDownload,
      onClick: handlePayback,
      title: "Pay Back",
      className: "text-green-600",
    },
    {
      icon: FaPen,
      onClick: handleEdit,
      title: "Pay Back",
      className: "text-green-600",
    },
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
  const handleAddExpense = () => {
    history.push("/dashboard/add-expense");
  };

  return (
    <>
      <DynamicDetailsModal
        isOpen={isModalOpen}
        onClose={toggleModal}
        data={selectedExpense}
        title="Expense Details"
      />

      {isPaymentModalOpen ? (
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
                        {paymentTypes.map((type, index) => (
                          <option key={index} value={type}>
                            {type}
                          </option>
                        ))}
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

                  <div className="w-full lg:w-12/12 px-2 text-left">
                    <button
                      type="submit"
                      onClick={handleSubmit}
                      className="mt-3 bg-emerald-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
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
        <div className="w-full mb-6 bg-white  shadow-lg rounded p-4">
          <div className=" flex flex-wrap  py-3 justify-between">
            <div className="w-full mb-4 flex justify-center">
              <div className="flex items-center space-x-6">
                {["ALL", "MISCELLANEOUS", "CONSTRUCTION"].map((type) => (
                  <label key={type} className="flex items-center mx-4">
                    <input
                      type="radio"
                      name="expenseTypeRadioTop"
                      value={type}
                      checked={expenseType === type}
                      onChange={handleExpenseTypeChange}
                      className="form-radio"
                    />
                    <span className="text-sm font-medium ml-1">{type}</span>
                  </label>
                ))}
              </div>
            </div>

            {expenseType === "MISCELLANEOUS" ? (
              <>
                <div className="p-5 rounded w-47">
                  <label className="block text-sm font-medium mb-1">
                    Account Group
                  </label>
                  <select
                    value={accountGroupId || ""}
                    onChange={(e) => setAccountGroupId(e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                  >
                    <option value="">Select Account Group</option>
                    {accountGroups.map((ag) => (
                      <option key={ag.id} value={ag.id}>
                        {ag.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-5 rounded w-47">
                  <label className="block text-sm font-medium mb-1">
                    Select Chart of Account
                  </label>
                  <select
                    value={coaId || ""}
                    onChange={(e) => setCoaId(e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                  >
                    <option value="">Select COA</option>
                    {coaList.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : expenseType === "CONSTRUCTION" ? (
              <>
                <div className="  p-5 rounded  w-47">
                  <label className="block text-sm font-medium mb-1 ">
                    Select Project
                  </label>
                  <select
                    value={filterProject}
                    onChange={(e) => changeSelectedProjected(e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                  >
                    <option value="">All Projects</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-5 rounded w-47 ">
                  <label className="block text-sm font-medium mb-1">
                    Select Vendor
                  </label>
                  <select
                    value={filterVendor}
                    onChange={(e) => changeSelectedVendor(e.target.value)}
                    className="border rounded px-3 py-2 w-full"
                  >
                    <option value="">All Vendors</option>
                    {vendorList.map((vendor) => (
                      <option key={vendor.id} value={vendor.id}>
                        {vendor.name}
                      </option>
                    ))}
                  </select>
                </div>
              </>
            ) : null}
            <div className="w-full flex justify-center mt-4">
              <div className="space-x-3">
                <button
                  type="button"
                  onClick={handleSearch}
                  className="bg-emerald-500 text-white font-bold uppercase text-xs px-4 py-2 rounded shadow-sm hover:shadow-lg"
                >
                  <FaSearch className="w-4 h-4 inline-block mr-2" />
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto p-4">
        <DynamicTableComponent
          fetchDataFunction={fetchExpenseList}
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          data={expenseList}
          columns={tableColumns}
          pageSize={pageSize}
          totalPages={totalPages}
          totalElements={totalElements}
          loading={loading}
          title="Expense List"
          actions={actions}
          firstButton={{
            title: "Add Expense",
            onClick: handleAddExpense,
            icon: TbFileExport,
            className: "bg-emerald-500",
          }}
        />
      </div>
    </>
  );
}
