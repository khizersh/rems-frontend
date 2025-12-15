import React, { useEffect, useState, useContext } from "react";
import httpService from "../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../components/table/DynamicTableComponent.js";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min.js";
import { FaEye, FaPen, FaTrashAlt } from "react-icons/fa";
import DynamicDetailsModal from "components/CustomerComponents/DynamicModal.js";
import { MdPrint } from "react-icons/md";

export default function OrganizationAccountDetail() {
  const { loading, setLoading, notifyError, backdrop, setBackdrop } =
    useContext(MainContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const { accountId } = useParams();

  const [accountDetailList, setAccountDetailList] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
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
        requestBody
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
  }, [page]);

  const tableColumns = [
    { header: "Customer Name", field: "customerName" },
    { header: "Project Name", field: "projectName" },
    { header: "Unit Serial", field: "unitSerialNo" },
    {
      header: "Transaction Type",
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
        `/organizationAccount/getAccountDetailByAcctIdPrint/${accountId}`
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
            mainData?.totalAmount || 0
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

  return (
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
  );
}
