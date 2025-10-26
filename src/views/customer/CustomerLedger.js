import React, { useEffect, useState, useContext } from "react";
import httpService from "../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../components/table/DynamicTableComponent.js";
import {
  useParams,
  useLocation,
  useHistory,
} from "react-router-dom/cjs/react-router-dom.min.js";
import { getOrdinal } from "../../utility/Utility.js";
import Tippy from "@tippyjs/react";
import { MdPrint } from "react-icons/md";
import { IoArrowBackOutline } from "react-icons/io5";

export default function CustomerLedger() {
  const {
    loading,
    setLoading,
    notifyError,
    notifySuccess,
    backdrop,
    setBackdrop,
  } = useContext(MainContext);
  const location = useLocation();
  const { customerAccountId } = useParams();
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState([]);
  const [customerAccountFilterId, setCustomerAccountFilterId] = useState(""); // The ID of the selected project or floor
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [filteredId, setFilteredId] = useState("");
  const [filterProject, setFilterProject] = useState("");
  const [selectedPayment, setSelectedPayment] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [amounts, setAmount] = useState({
    totalAmount: 0,
    grandTotal: 0,
    remaianingBalance: 0,
  });
  const [payInstallment, setPayInstallment] = useState({
    id: 0,
    receivedAmount: 0,
    addedAmount: 0,
    paymentType: "CASH",
    serialNo: 0,
    customerPaymentDetails: [{ amount: 0, paymentType: "CASH" }],
  });
  const [customer, setCustomer] = useState(null);
  const [customerAccountList, setCustomerAccountList] = useState([]);
  const [selectedCustomerAccount, setSelectedCustomerAccount] = useState(null);
  const [customerPaymentList, setCustomerPaymentList] = useState([]);
  const pageSize = 10;

  useEffect(() => {
    fetchCustomerPayments();
  }, [selectedCustomerAccount, page]);

  useEffect(() => {
    let organizationLocal = JSON.parse(localStorage.getItem("organization"));
    if (organizationLocal) {
      fetchCustomerAccountList(
        organizationLocal.organizationId,
        "organization"
      );
    }
    fetchProjects();
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const myParam = queryParams.get("cName");
    setCustomerName(myParam);
  }, []);

  const fetchCustomerAccountList = async (id, filteredBy) => {
    setLoading(true);
    try {
      let request = {
        id: id,
        filteredBy: filteredBy,
      };

      const response = await httpService.post(
        `/customerAccount/getNameIdsByIds`,
        request
      );

      setCustomerAccountList(response.data || []);
    } catch (err) {
      // notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerPayments = async () => {
    try {
      if (!customerAccountId && !selectedCustomerAccount) {
        return;
      }

      let accountId = selectedCustomerAccount
        ? selectedCustomerAccount
        : customerAccountId;

      setLoading(true);

      const response = await httpService.get(
        `/customerPayment/customerLedger/${accountId}`
      );

      setAmount({
        totalAmount: response?.data?.totalAmount,
        grandTotal: response?.data?.grandTotal,
        remaianingBalance: response?.data?.balanceAmount,
      });
      setCustomer(response?.data?.customer);
      setCustomerPaymentList(response?.data?.paymentDetails || []);
      setTotalPages(response?.data?.totalPages || 0);
      setTotalElements(response?.data?.totalElements || 0);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      const organization =
        JSON.parse(localStorage.getItem("organization")) || null;
      if (organization) {
        const response = await httpService.get(
          `/project/getAllProjectByOrg/${organization.organizationId}`
        );
        setProjects(response.data || []);
      }
    } catch (err) {
      // notifyError(err.message, err.data, 4000);
    }
  };

  const changeSelectedProjected = (projectId) => {
    if (projectId) {
      setFilteredId(projectId);
      setFilterProject(projectId);
      fetchCustomerAccountList(projectId, "project");
    }
  };

  const changeCustomerAccount = (accountId) => {
    if (accountId) {
      setSelectedCustomerAccount(accountId);
      setCustomerAccountFilterId(accountId);
      let customerName = customerAccountList.find(
        (customer) => customer.accountId == accountId
      );
      setCustomerName(customerName.customerName);
    }
  };

  const tableColumns = [
    { header: "Amount", field: "amount" },
    { header: "Payment Date", field: "updatedDate" },
    {
      header: "Type",
      field: "customerPaymentReason",
      render: (value) => {
        return <span>{value}</span>;
      },
    },
    { header: "Payment Mode", field: "paymentType" },
    { header: "Cheque No", field: "chequeNo" },
    { header: "Cheque Date", field: "chequeDate" },
  ];

  const handlePaymentModal = (customerPayment) => {
    setSelectedPayment(customerPayment);
    toggleModal();
  };

  const handleDetailModal = (data) => {
    const name = customerAccountList.find(
      (custom) => custom.accountId == selectedCustomerAccount
    );

    const formattedPaymentInfo = {
      "Payment Info": {
        "Customer Name": name?.customerName || customerName,
        "Unit Serial No": data?.serialNo,
        "Installment Amount": data?.amount,
        "Received Amount": data?.receivedAmount,
        "Payment Type": data?.paymentType,
        "Payment Status": data?.paymentStatus,
      },
      "Audit Info": {
        "Created By": data?.createdBy,
        "Updated By": data?.updatedBy,
        "Created Date": data?.createdDate,
        "Updated Date": data?.updatedDate,
      },
    };

    setSelectedPayment(formattedPaymentInfo);
    toggleModalDetail();
  };

  const handleEdit = (customerPayment) => {};

  const handlePrintSlip = async () => {
    try {
      const formatedData = {
        contactNo: customer?.contactNo || "-",
        customerName: customer?.customerName || "-",
        cnic: customer?.nationalId || "-",
        fatherHusbandName: customer?.guardianName || "-",
        address: customer?.customerAddress || "-",
        flatNo: customer?.unitSerial || "-",
        floor: customer?.floorNo?.toString() || "-",
        type: customer?.unitType || "-",
        totalAmount: amounts.totalAmount || 0,
        grandTotal: amounts.grandTotal || 0,
        balanceAmount: amounts.remaianingBalance || 0,
        customerPaymentDetails: customerPaymentList,
      };

      console.log("formatedData:: ", formatedData);

      const win = window.open("", "_blank");
      const printContent = generateReceiptHTML(formatedData); // 👈 generate HTML string
      win.document.write(printContent);
      win.document.close();
      win.focus();
      setTimeout(() => win.print(), 500); // slight delay to render
    } catch (err) {}
  };

  const generateReceiptHTML = (data) => {
    const {
      contactNo,
      customerName,
      cnic,
      fatherHusbandName,
      address,
      flatNo,
      floor,
      type,
      totalAmount,
      grandTotal,
      balanceAmount,
      customerPaymentDetails,
    } = data;

    const formattedDate = new Date().toLocaleString();

    return `
    <html>
    <head>
      <title>Receipt</title>
      <style>
        body { font-family: Arial, sans-serif; font-size: 14px; margin: 20px; }
        .receipt-container { width: 800px; margin: auto; }
        .header { text-align: center; }
        .header h2 { margin: 0; font-size: 20px; }
        .header p { margin: 0; font-size: 12px; }
        .receipt-title { font-weight: bold; font-size: 16px; background: #000; color: #fff; padding: 5px; display: inline-block; margin: 10px 0; }
        .info { display: flex; justify-content: space-between; margin-top: 20px; }
        .info div { width: 48%; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid black; padding: 8px; text-align: left; font-size : 13px; }
        .footer { margin-top: 30px; border-top : 1px solid black; }
        .footer-div { display: flex; justify-content: space-left;}
        .signature { text-align: right; margin-top: 50px; }
        .page {margin-left : 10px;}
      </style>
    </head>
    <body>
      <div class="receipt-container">
        <div class="header">
          <h2>VISION BUILDERS & MARKETING</h2>
          <p>SHOP # 4, B-81 Mustafabad, Malir City, Karachi</p>
          <p>0336-2590911, 03132107640, 0313-2510343, 0347-2494998</p>
          <div class="receipt-title">CUSTOMER LEDGER</div>
        </div>

        <div class="info">
          <div>
            <p><strong>Customer Name:</strong> ${customerName}</p>
            <p><strong>CNIC:</strong> ${cnic}</p>
            <p><strong>Father / Husband Name:</strong> ${fatherHusbandName}</p>
            <p><strong>Contact No:</strong> ${contactNo}</p>
            <p><strong>Address:</strong> ${address}</p>
            <p><strong>Ledger Date:</strong> ${formattedDate}</p>
          </div>
          <div>
            <p><strong>Unit No:</strong> ${flatNo}</p>
            <p><strong>Floor:</strong> ${getOrdinal(floor)}</p>
            <p><strong>Type:</strong> ${type}</p>
          </div>
        </div>
        <div>
          <p><text>Total Amount:</text> <text>${totalAmount}</text></p> 
        </div>

        <table>
          <thead>
            <tr>
              <th>Sr#</th>
              <th>Paid Date</th>
              <th>Type</th>
              <th>Payment Method</th>
              <th>Cheque No</th>
              <th>Cheque Date</th>
              <th>Receipt Amount</th>
            </tr>
          </thead>
          <tbody>
            ${customerPaymentDetails
              .map((detail, ind) => {
                return `
                <tr>
                  <td>${ind + 1}</td>
                  <td>${detail.createdDate.split("T")[0]}</td>
                  <td>${detail.customerPaymentReason}</td>
                  <td>${detail.paymentType}</td>
                  <td>${detail.chequeNo ? detail.chequeNo : "-"}</td>
                  <td>${
                    detail.chequeDate ? detail.chequeDate.split("T")[0] : "-"
                  }</td>
                  <td>${parseFloat(detail.amount).toLocaleString()}</td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>

        <h3 style="text-align: right;">Grand Total: ${parseFloat(
          grandTotal
        ).toLocaleString()}</h3>
        <h3 style="text-align: right;">Balance Amount: ${parseFloat(
          balanceAmount
        ).toLocaleString()}</h3>

        <div class="footer">
          <div class="footer-div">
            <p><strong>Print Date:</strong> ${formattedDate}</p>
          </div>
          <div class="signature">
            <p>Signature</p>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
  };

  const handleDelete = (customerPayment) => {};

  const actions = [];

  const toggleModalDetail = () => {
    setBackdrop(!backdrop);
    setIsModalOpen(!isModalOpen);
  };

  const toggleModal = () => {
    setBackdrop(!backdrop);
    setIsFormModalOpen(!isFormModalOpen);
    onResetForm();
    onResetFormDetail();
  };

  const handleSubmit = async () => {};

  const onResetForm = () => {
    setPayInstallment((prev) => ({
      ...prev,
      id: 0,
      receivedAmount: 0,
      paymentType: "CASH",
      serialNo: 0,
      customerPaymentDetails: [{ amount: 0, paymentType: "CASH" }],
    }));
  };
  const onResetFormDetail = () => {
    setPayInstallment((prev) => ({
      ...prev,
      customerPaymentDetails: [{ amount: 0, paymentType: "CASH" }],
    }));
  };

  const getNestedValue = (obj, path) =>
    path.split(".").reduce((acc, part) => (acc ? acc[part] : ""), obj);

  const history = useHistory();

  return (
    <>
      <div className="container mx-auto ">
        <div className="flex flex-wrap py-3 px-4 md:justify-content-between">
          <div className="bg-white shadow-lg p-5 rounded-12 lg:w-4/12 md:w-6/12 sm:w-12/12">
            <label className="block text-sm font-medium mb-1">Project</label>
            <select
              value={filterProject}
              onChange={(e) => changeSelectedProjected(e.target.value)}
              className="border rounded-lg px-3 py-2 w-full"
            >
              <option value="">All Projects</option>
              {projects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </select>
          </div>

          <div className="bg-white shadow-lg p-5 rounded-12 mx-4 lg:w-4/12 md:w-6/12 sm:w-12/12 md:mx-0 sm:mt-5">
            <label className="block text-sm font-medium mb-1">
              Customer Account
            </label>
            <select
              value={selectedCustomerAccount}
              onChange={(e) => changeCustomerAccount(e.target.value)}
              className="border rounded-lg px-3 py-2 w-full"
            >
              <option value="">Select Account</option>
              {customerAccountList.map((account) => (
                <option key={account.accountId} value={account.accountId}>
                  {account.customerName} - {account.unitSerial}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className="container mx-auto mt-4">
        <div className="bg-white shadow-lg flex flex-wrap my-3 mx-4 rounded-12 md:justify-content-between">
          <div className="p-5 lg:w-6/12 text-sm md:w-6/12 sm:w-12/12">
            <p className="py-1">
              <span className="font-semibold pr-2">Customer Name:</span>{" "}
              {customer?.customerName}
            </p>
            <p className="py-1">
              <span className="font-semibold pr-2">CNIC:</span>{" "}
              {customer?.nationalId}
            </p>
            <p className="py-1">
              <span className="font-semibold pr-2">Father/Husband Name:</span>{" "}
              {customer?.guardianName}
            </p>
            <p className="py-1">
              <span className="font-semibold pr-2">Contact No:</span>{" "}
              {customer?.contactNo}
            </p>
            <p className="py-1">
              <span className="font-semibold pr-2">Address:</span>{" "}
              {customer?.customerAddress}
            </p>
            <p className="py-1">
              <span className="font-semibold pr-2">Total Amount:</span>{" "}
              {amounts?.totalAmount}
            </p>
          </div>
          <div className="p-5 lg:w-6/12 text-sm md:w-6/12 sm:w-12/12">
            <p className="py-1">
              <span className="font-semibold pr-2">Unit No:</span>{" "}
              {customer?.unitSerial}
            </p>
            <p className="py-1">
              <span className="font-semibold pr-2">Unti Type:</span>{" "}
              {customer?.unitType}
            </p>
            <p className="py-1">
              <span className="font-semibold pr-2">Floor:</span>{" "}
              {getOrdinal(customer?.floorNo)}
            </p>
            <p className="py-1">
              <span className="font-semibold pr-2">Project:</span>{" "}
              {customer?.projectName}
            </p>

            <p className="py-1">
              <span className="font-semibold pr-2">Grand Total:</span>{" "}
              {amounts?.grandTotal}
            </p>
            <p className="py-1">
              <span className="font-semibold pr-2">Remaianing Balance:</span>{" "}
              {amounts?.remaianingBalance}
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Table */}
      <div className="container mx-auto p-4 mt-5">
        <div className="relative flex flex-col min-w-0 bg-white w-full mb-6 shadow-lg rounded-12">
          {/* Header */}
          <div className="px-4 py-3 border-b flex justify-between items-center">
            <div>
              <h3 className="font-semibold text-base text-gray-700">
                <span>
                  <button className="">
                    <IoArrowBackOutline
                      onClick={() => history.goBack()}
                      className="back-button-icon inline-block back-button"
                      style={{ paddingBottom: "3px", paddingRight: "7px" }}
                    />
                  </button>
                </span>
                {customerName ? customerName + " - Payments" : ""}
              </h3>
            </div>
            <div>
              <button
                onClick={handlePrintSlip}
                className="bg-lightBlue-500 text-white text-xs font-bold px-3 py-1 rounded mx-4"
              >
                <MdPrint
                  className="w-5 h-5 inline-block "
                  style={{ paddingBottom: "0px", paddingRight: "5px" }}
                />
                Print
              </button>
              <button
                onClick={fetchCustomerPayments}
                className="bg-indigo-500 text-white text-xs font-bold px-3 rounded"
                style={{ paddingTop: "5px", paddingBottom: "7px" }}
              >
                Refresh
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="block w-full overflow-x-auto">
            <table className="w-full bg-transparent border-collapse">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-6 py-3 text-xs font-semibold text-left">
                    S.No
                  </th>
                  {tableColumns.map((col, idx) => (
                    <th
                      key={idx}
                      className="px-6 py-3 text-xs font-semibold text-left"
                    >
                      {col.header}
                    </th>
                  ))}
                  {Object.keys(actions).length > 0 && (
                    <th className="px-6 py-3 text-xs font-semibold text-left">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td
                      colSpan={tableColumns.length + 2}
                      className="text-center py-4"
                    >
                      Loading...
                    </td>
                  </tr>
                ) : customerPaymentList.length === 0 ? (
                  <tr>
                    <td
                      colSpan={tableColumns.length + 2}
                      className="text-center py-4"
                    >
                      No data found.
                    </td>
                  </tr>
                ) : (
                  customerPaymentList.map((item, index) => (
                    <tr
                      key={index}
                      className={`${
                        index % 2 === 0 ? "bg-gray-50" : "bg-white"
                      } project-table-rows`}
                    >
                      <td className="px-6 py-4">
                        {page * pageSize + index + 1}
                      </td>
                      {tableColumns.map((col, i) => (
                        <td key={i} className="px-6 py-4">
                          {col.render
                            ? col.render(getNestedValue(item, col.field), item)
                            : getNestedValue(item, col.field)}
                        </td>
                      ))}

                      {actions.length > 0 && (
                        <td className="px-6 py-4">
                          <div className="flex gap-4 items-center">
                            {actions.map((action, index) => {
                              const IconComponent = action.icon;
                              const tooltipId = `tooltip-${index}`;
                              return (
                                <div key={tooltipId} className="relative">
                                  <Tippy
                                    placement="top"
                                    theme="custom"
                                    content={action.title}
                                  >
                                    <button
                                      key={tooltipId}
                                      onClick={() => action.onClick(item)}
                                      className={`hover:shadow-md transition-shadow duration-150 ${action.className}`}
                                    >
                                      <IconComponent />
                                    </button>
                                  </Tippy>
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-6 py-4 text-sm">
            <div className="text-gray-600"></div>

            <div className="">
              <p className="py-1">
                <span className="font-semibold pr-2">Grand Total: </span>{" "}
                {amounts.grandTotal}
              </p>
              <p className="py-1">
                <span className="font-semibold pr-2">Balance Amount: </span>{" "}
                {amounts.remaianingBalance}
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
