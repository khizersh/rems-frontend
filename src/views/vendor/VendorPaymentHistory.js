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
import { BsFillSave2Fill } from "react-icons/bs";
import { MdPrint } from "react-icons/md";

export default function VendorPaymentHistory() {
  const { loading, setLoading, notifyError, backdrop, setBackdrop } =
    useContext(MainContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [vendorDetail, setVendorDetail] = useState(null);
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
        `/vendorAccount/getHistoryByAccountId`,
        requestBody
      );

      console.log("response?.data?.content :: ", response?.data?.content);

      // response?.data?.content.map(vendor => {
      //   console.log("vendor :: ");

      // })
      setAccountDetailList(response?.data?.content || []);
      setTotalPages(response?.data?.totalPages || 0);
      setTotalElements(response?.data?.totalElements || 0);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendorDetail = async () => {
    setLoading(true);
    try {
      const response = await httpService.get(
        `/vendorAccount/getById/${accountId}`
      );

      console.log("response :: ", response);

      setVendorDetail(response?.data);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountList();
    fetchVendorDetail();
  }, [page]);

  const tableColumns = [
    { header: "From Account", field: "organizationAccount" },
    { header: "Vendor", field: "vendorAccount" },
    {
      header: "Type",
      field: "transactionType",
      render: (value) => {
        const baseClass = "font-semibold uppercase";
        if (value === "CREDIT")
          return (
            <span className="text-red-600">
              <i className="fas fa-arrow-up text-red-500 mr-4"></i>
              {value}
            </span>
          );
        if (value === "DEBIT")
          return (
            <span className="text-green-600">
              <i className="fas fa-arrow-down text-emerald-500 mr-4"></i>
              {value}
            </span>
          );
        else
          return (
            <span>
              <i className="fas fa-arrow-up text-emerald-500"></i>
              <i className="fas fa-arrow-down text-red-500 mr-2"></i>
              {value}
            </span>
          );
      },
    },
    { header: "Paid Amount", field: "amountPaid" },
    { header: "Credit Amount", field: "creditAmount" },
    { header: "Balance Amount", field: "balanceAmount" },
    { header: "Date", field: "createdDate" },
  ];

  const handleView = (data) => {
    const formattedUnitDetails = {
      "Account Detail": {
        "Account Title": data?.name,
        "Bank Name": data?.bankName,
        "Account No": data?.accountNo,
        IBAN: data?.iban,
        "Account Balance": data?.totalAmount,
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

  const handleEdit = (floor) => {
    console.log("Edit Floor:", floor);
    // Implement edit functionality
  };

  const handleDelete = (floor) => {
    console.log("Delete Floor:", floor);
    // Implement delete logic
  };

  const actions = [];

  const toggleModal = () => {
    setBackdrop(!backdrop);
    setIsModalOpen(!isModalOpen);
  };
  const handlePrint = async () => {
    setLoading(true);

    try {
      const response = await httpService.get(
        `/vendorAccount/getHistoryByAccountIdPrint/${accountId}`
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
            mainData?.totalPaid
          ).toLocaleString()}</p>
          <p><strong>Total Credit:</strong> ${parseFloat(
            mainData?.totalCredit
          ).toLocaleString()}</p>
          <p><strong>Total Amount:</strong> ${parseFloat(
            mainData?.totalAmount
          ).toLocaleString()}</p>
          <p><strong>Ledger Date:</strong> ${formattedDate}</p>
        </div>

        <table>
          <thead>
            <tr>
              <th>Sr#</th>
              <th>Date</th>
              <th>Transaction Type</th>
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
                    <td>${parseFloat(detail.amountPaid).toLocaleString()}</td>
                    <td>${parseFloat(detail.creditAmount).toLocaleString()}</td>
                    <td>${parseFloat(
                      detail.amountPaid + detail.creditAmount
                    ).toLocaleString()}</td>
                    <td>${parseFloat(detail.balanceAmount).toLocaleString()}</td>
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
        title="Vendor Account Detail"
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
        title="Vendor Account Detail"
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
