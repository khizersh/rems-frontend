import React, { useEffect, useState, useContext } from "react";
import httpService from "../../../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../../../components/table/DynamicTableComponent.js";
import { HiOutlineSave } from "react-icons/hi";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min.js";
import { FaEye, FaPen, FaTrashAlt, FaBuilding, FaMoneyBillWave } from "react-icons/fa";
import DynamicDetailsModal from "components/CustomerComponents/DynamicModal.js";
import { MdPrint, MdAccountBalance, MdCreditCard, MdReceipt, MdUpdate } from "react-icons/md";
import { ACCOUNT_BALANCE_TRANSACTION_CATEGORY } from "utility/Utility.js";
import { TRANSACTION_TYPES } from "utility/Utility.js";
import { IoArrowBackOutline, IoChevronDown, IoChevronUp } from "react-icons/io5";

export default function OrganizationAccountDetail() {
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
  const [formData, setFormData] = useState({
    projectId: 0,
    organizationAcctId: 0,
    transactionType: "",
    transactionCategory: "",
    amount: 0,
    comments: "",
  });
  const { accountId } = useParams();

  const [accountDetailList, setAccountDetailList] = useState([]);
  const [accountData, setAccountData] = useState(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [projects, setProjects] = useState([]);
  const pageSize = 10;

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
        `/organizationAccount/getAccountDetailByAcctId`,
        requestBody,
      );

      setAccountDetailList(response?.data?.content || []);
      setTotalPages(response?.data?.totalPages || 0);
      setTotalElements(response?.data?.totalElements || 0);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountList();
    // Fetch projects and accounts for dropdowns
    fetchProjects();

    getAccountDetail();
  }, [page]);

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
  const getAccountDetail = async () => {
    try {
      const response = await httpService.get(
        `/organizationAccount/getById/${accountId}`,
      );

      setAccountData(response?.data);
      console.log("response :: ", response);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    }
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]:
        name === "projectId" || name === "organizationAcctId"
          ? parseInt(value)
          : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onClickAdjustment();
  };

  const tableColumns = [
    { header: "Customer", field: "customerName" },
    { header: "Project", field: "projectName" },
    { header: "Category", field: "transactionCategory" },
    {
      header: "Transaction",
      field: "transactionType",
      render: (value) => {
        const baseClass = "font-semibold uppercase";
        if (value === "CREDIT")
          return (
            <span className="text-red-600">
              <i className="fas fa-arrow-up text-red-500 mr-1"></i>
              {value}
            </span>
          );
        if (value === "DEBIT")
          return (
            <span className="text-green-600">
              <i className="fas fa-arrow-down text-emerald-500 mr-1"></i>
              {value}
            </span>
          );
        else
          return (
            <span>
              <i className="fas fa-arrow-up text-emerald-500"></i>
              <i className="fas fa-arrow-down text-red-500 mr-4"></i>
              {value}
            </span>
          );
      },
    },
    { header: "Amount", field: "amount" },
    { header: "Comments", field: "comments" },
  ];

  const handleView = (data) => {
    const formattedAccountDetail = {
      "Transaction Info": {
        "Transaction Type": data.transactionType,
        "Transaction Category": data.transactionCategory,
        Amount: data.amount,
        Comments: data.comments,
      },
      "Customer Info": {
        "Customer Name": data.customerName,
        "Unit Serial No": data.unitSerialNo,
      },
      "Project Info": {
        "Project ID": data.projectId,
        "Project Name": data.projectName,
      },
      "Audit Info": {
        "Created By": data.createdBy,
        "Created Date": data.createdDate,
        "Updated By": data.updatedBy,
        "Updated Date": data.updatedDate,
      },
    };
    setSelectedUnit(formattedAccountDetail);
    toggleModal();
  };

  const handleEdit = (floor) => {
    console.log("Edit Floor:", floor);
    // Implement edit functionality
  };

  const handleDelete = (floor) => {
    console.log("Delete Floor:", floor);
    // Implement delete logic
  };

  const actions = [
    {
      icon: FaEye,
      onClick: handleView,
      title: "View Detail",
      className: "text-green-600",
    },
  ];

  const toggleModal = () => {
    setBackdrop(!backdrop);
    setIsModalOpen(!isModalOpen);
  };

  const handlePrint = async () => {
    setLoading(true);

    try {
      const response = await httpService.get(
        `/organizationAccount/getAccountDetailByAcctIdPrint/${accountId}`,
      );

      const organization =
        JSON.parse(localStorage.getItem("organization")) || {};

      response.organizationTitle = organization?.name;
      response.address = organization?.address;
      response.numbers = organization?.contactNo;

      console.log("response :: ", response);

      const html = generateOrganizationLedgerHTML(response);

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

  const generateOrganizationLedgerHTML = (input) => {
    let data = input.data?.list;
    let mainData = input?.data?.account;
    const formattedDate = new Date().toLocaleString();

    return `
  <html>
    <head>
      <title>Organization Ledger</title>
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
          <div class="ledger-title">ORGANIZATION ACCOUNT LEDGER</div>
        </div>

        <div>
          <p><strong>Account Title:</strong> ${mainData?.name || "-"}</p>
          <p><strong>Bank Name:</strong> ${mainData?.bankName || "-"}</p>
          <p><strong>Account Number:</strong> ${mainData?.accountNo || "-"}</p>
          <p><strong>Iban:</strong> ${mainData?.iban || "-"}</p>
          <p><strong>Current Balance:</strong> ${parseFloat(
            mainData?.totalAmount || 0,
          ).toLocaleString()}</p>
          <p><strong>Ledger Date:</strong> ${formattedDate}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Sr#</th>
              <th>Transaction Type</th>
              <th>Amount</th>
              <th>Project Name</th>
              <th>Narration</th>
              <th>Date</th>
              <th>Created By</th>
            </tr>
          </thead>
          <tbody>
            ${data
              .map((detail, ind) => {
                return `
                  <tr>
                    <td>${ind + 1}</td>
                    <td>${
                      detail.transactionType == "CREDIT"
                        ? "↑ CREDIT"
                        : "↓ DEBIT" || ""
                    }</td>
                    <td>${parseFloat(detail.amount || 0).toLocaleString()}</td>
                    <td>${detail.projectName || ""}</td>
                    <td>${detail.comments || ""}</td>
                    <td>${
                      detail.createdDate ? detail.createdDate.split("T")[0] : ""
                    }</td>
                    <td>${detail.createdBy || ""}</td>
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

  const onClickAdjustment = async () => {
    // Validation
    if (!formData.projectId || formData.projectId === 0) {
      notifyError("Please select a project", "", 3000);
      return;
    }

    if (!formData.transactionType || formData.transactionType === "") {
      notifyError(
        "Please select a transaction type (Debit or Credit)",
        "",
        3000,
      );
      return;
    }

    if (!formData.amount || formData.amount <= 0) {
      notifyError("Please enter a valid amount greater than 0", "", 3000);
      return;
    }

    if (!formData.comments) {
      notifyError("Please enter a comments", "", 3000);
      return;
    }

    // Confirmation popup
    const confirmMessage = `Are you sure you want to ${
      formData.transactionType === "DEBIT" ? "add" : "reduce"
    } the account balance by ${formData.amount}?`;

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setLoading(true);
    try {
      const organization =
        JSON.parse(localStorage.getItem("organization")) || {};

      formData.organizationAcctId = accountId;

      const response = await httpService.post(
        `/organizationAccount/${organization.organizationId}/transferAmount`,
        formData,
      );

      notifySuccess("Balance adjustment successful", "", 3000);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {accountData && (
        <div className="w-full flex justify-center mb-6">
          <div className="inline-flex w-full sm:w-auto max-w-5xl bg-white shadow-lg rounded-12 px-4 items-center sm:items-start justify-between gap-4">
            <div className="flex items-center gap-4 sm:gap-6">
             
              <div>
                <div className="text-xs text-blueGray-500">Account Title</div>
                <div className="text-lg font-semibold text-blueGray-700">
                  {accountData.name || "-"}
                </div>
                <div className="text-sm text-blueGray-500 mt-1">
                  <MdAccountBalance className="w-5 h-5 inline-block mr-2 text-emerald-500" style={{ paddingBottom: "3px", paddingRight: "5px" }} /> {accountData.bankName || "-"}
                </div>
              </div>
            </div>

            <div className="flex-1 px-2 rounded-12">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="px-3 py-2 bg-gray-50 rounded-md">
                  <div className="text-xs text-blueGray-500">Account No</div>
                  <div className="font-medium text-blueGray-700">
                    <MdCreditCard className="w-5 h-5 inline-block mr-2 text-blueGray-400" style={{ paddingBottom: "3px", paddingRight: "5px" }} /> {accountData.accountNo || "-"}
                  </div>
                </div>
                <div className="px-3 py-2 bg-gray-50 rounded-md">
                  <div className="text-xs text-blueGray-500">IBAN</div>
                  <div className="font-medium text-blueGray-700 truncate">
                    <MdReceipt className="w-5 h-5 inline-block mr-2 text-blueGray-400" style={{ paddingBottom: "3px", paddingRight: "5px" }} /> {accountData.iban || "-"}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-xs text-blueGray-500">Current Balance</div>
              <div className="text-2xl font-semibold text-emerald-600">
                <FaMoneyBillWave className="w-5 h-5 inline-block mr-2 text-emerald-500" style={{ paddingBottom: "3px", paddingRight: "5px" }} /> {parseFloat(accountData.totalAmount || 0).toLocaleString()}
              </div>
              <div className="mt-2 text-xs text-blueGray-500">
                <div>
                  <MdUpdate className="w-5 h-5 inline-block mr-2 text-blueGray-400" style={{ paddingBottom: "3px", paddingRight: "5px" }} /> Last Updated: {accountData.lastUpdatedDateTime
                    ? new Date(accountData.lastUpdatedDateTime).toLocaleString()
                    : accountData.updatedDate
                      ? new Date(accountData.updatedDate).toLocaleString()
                      : "-"}
                </div>
                <div>
                  By:{" "}
                  <span className="font-medium text-blueGray-700">
                    {accountData.updatedBy || accountData.createdBy || "-"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      <form
        className="container mx-auto p-4 bg-white w-full mb-6 shadow-lg rounded-12"
        onSubmit={handleSubmit}
      >
        <h3 className="text-xl font-semibold mb-4 border-bottom-grey pb-4 flex items-center justify-between">
          <div className="flex items-center">
            <button className="">
              <IoArrowBackOutline
                onClick={() => history.goBack()}
                className="back-button-icon inline-block back-button"
                style={{
                  paddingBottom: "3px",
                  paddingRight: "7px",
                  marginBottom: "3px",
                }}
              />
            </button>
            <span className="ml-2">Balance Adjustment</span>
          </div>
          <button
            type="button"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-expanded={!isCollapsed}
            className="text-blueGray-500"
          >
            {!isCollapsed ? (
              <IoChevronUp className="w-5 h-5 inline-block " style={{ paddingBottom: "3px", paddingRight: "5px" }} />
            ) : (
              <IoChevronDown className="w-5 h-5 inline-block " style={{ paddingBottom: "3px", paddingRight: "5px" }} />
            )}
          </button>
        </h3>
        {!isCollapsed && (
          <>
            <div className="w-full lg:w-12/12 mb-8">
              <div className="flex flex-wrap">
                <div className="w-full lg:w-12/12 px-4 mb-5">
              <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2 text-center">
                Transaction Type
              </label>
              <div className="flex items-center justify-center gap-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="transactionType"
                    value="DEBIT"
                    checked={formData.transactionType === "DEBIT"}
                    onChange={handleFormChange}
                    className="w-4 h-4 text-green-600 cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-blueGray-600 font-semibold">
                    <i className="fas fa-arrow-down text-emerald-500 mr-1"></i>
                    Debit (Add)
                  </span>
                </label>
                <label className="flex items-center cursor-pointer ml-5">
                  <input
                    type="radio"
                    name="transactionType"
                    value="CREDIT"
                    checked={formData.transactionType === "CREDIT"}
                    onChange={handleFormChange}
                    className="w-4 h-4 text-red-600 cursor-pointer"
                  />
                  <span className="ml-2 text-sm text-blueGray-600 font-semibold">
                    <i className="fas fa-arrow-up text-red-500 mr-1"></i>
                    Credit (Reduce)
                  </span>
                </label>
              </div>
            </div>

            <div className="w-full lg:w-4/12 px-4 mt-5">
              <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                Transaction Category
              </label>
              <select
                name="transactionCategory"
                value={formData.transactionCategory}
                onChange={handleFormChange}
                className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full border "
              >
                <option value="">Select Transaction Category</option>
                {ACCOUNT_BALANCE_TRANSACTION_CATEGORY.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full lg:w-4/12 px-4 mt-5">
              <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                Project
              </label>
              <select
                name="projectId"
                value={formData.projectId}
                onChange={handleFormChange}
                className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full border "
              >
                <option value="">Select a project</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="w-full lg:w-4/12 px-4 mt-5">
              <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                Amount
              </label>
              <input
                type="number"
                name="amount"
                value={formData.amount}
                onChange={handleFormChange}
                className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full"
                placeholder="Enter name"
              />
            </div>

            <div className="w-full lg:w-12/12 px-4 mt-5">
              <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                Comments
              </label>
              <textarea
                id="comments"
                rows="3"
                name="comments"
                value={formData.comments}
                onChange={handleFormChange}
                className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear "
              ></textarea>
            </div>
          </div>
        </div>
        <div className="flex justify-end mt-4">
          <button
            type="submit"
            className="px-4 mt-4 bg-emerald-500 text-white font-bold  text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
          >
            <HiOutlineSave
              className="w-5 h-5 inline-block "
              style={{ paddingBottom: "3px", paddingRight: "5px" }}
            />
            Save Adjustment
          </button>
        </div>
          </>
        )}
      </form>
      <div className="container mx-auto p-4">
        <DynamicDetailsModal
          isOpen={isModalOpen}
          onClose={toggleModal}
          data={selectedUnit}
          title="Organization Account Detail"
        />
        <DynamicTableComponent
          fetchDataFunction={fetchAccountList}
          setPage={setPage}
          page={page}
          data={accountDetailList}
          columns={tableColumns}
          pageSize={pageSize}
          totalPages={totalPages}
          totalElements={totalElements}
          loading={loading}
          title="Organization Account Detail"
          actions={actions}
          firstButton={{
            icon: MdPrint,
            onClick: handlePrint,
            title: "Print Report",
            className: "bg-emerald-500",
          }}
        />
      </div>
    </>
  );
}
