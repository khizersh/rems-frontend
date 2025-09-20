import React, { useEffect, useState, useContext } from "react";
import httpService from "../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../components/table/DynamicTableComponent.js";
import {
  useHistory,
  useParams,
  useLocation,
} from "react-router-dom/cjs/react-router-dom.min.js";
import { FaEye, FaPen, FaTrashAlt } from "react-icons/fa";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import DynamicDetailsModal from "components/CustomerComponents/DynamicModal.js";
import DynamicFormModal from "components/CustomerComponents/DynamicFormModal.js";
import PaymentModal from "./component/PaymentModal.js";
import { BsFillSave2Fill } from "react-icons/bs";
import { MdPrint } from "react-icons/md";
import { getOrdinal } from "../../utility/Utility.js";

export default function CustomerPayment() {
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
  const [payInstallment, setPayInstallment] = useState({
    id: 0,
    receivedAmount: 0,
    addedAmount: 0,
    paymentType: "CASH",
    serialNo: 0,
    customerAccountId: null,
    customerPaymentDetails: [
      {
        amount: 0,
        paymentType: "CASH",
        createdDate: new Date().toISOString().slice(0, 16),
      },
    ],
    organizationAccountDetails: [
      // {
      //   organizationAcctId: null,
      //   transactionType: "CREDIT",
      //   amount: 0,
      //   comments: "",
      //   customerId: null,
      //   customerPaymentId: null,
      //   customerPaymentDetailId: null,
      //   customerAccountId: null,
      //   createdDate: new Date().toISOString().slice(0, 16),
      // },
    ],
  });
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


      console.log("response :: ",response);
      
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
      const requestBody = {
        id: accountId,
        page,
        size: pageSize,
        sortBy: "id",
        sortDir: "asc",
      };

      const response = await httpService.post(
        "/customerPayment/getByCustomerAccountId",
        requestBody
      );

      setCustomerPaymentList(response?.data?.content || []);
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
    { header: "Received Amount", field: "receivedAmount" },
    { header: "Payment Type", field: "paymentType" },
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

  const handlePrintSlip = async (customerPayment) => {
    const customer = customerAccountList.find(
      (custom) => custom.accountId == customerPayment.customerAccountId
    );

    if (
      (customerPayment.paymentStatus &&
        customerPayment.paymentStatus == "PAID") ||
      customerPayment.paymentStatus == "PENDING"
    ) {
      if (customer.customerId) {
        const request = {
          customerId: customer.customerId,
          customerPaymentId: customerPayment.id,
        };
        const response = await httpService.post(
          `/customer/getFullDetailsByCustomerId`,
          request
        );
        if (response) {
          let data = {
            ...response.data,
            ...customerPayment,
          };

          const sumDetailAmount = data.paymentDetails.reduce((sum, item, i) => {
            return sum + (parseFloat(item.amount) || 0);
          }, 0);

          const formatedData = {
            contactNo: data.customer?.contactNo || "-",
            customerName: data.customer?.customerName || "-",
            cnic: data.customer?.nationalId || "-",
            fatherHusbandName: data.customer?.guardianName || "-",
            address: data.customer?.customerAddress || "-",
            flatNo: data.customer?.unitSerial || "-",
            floor: data.customer?.floorNo?.toString() || "-",
            type: data.customer?.unitType || "-",
            paymentType: data.payment?.paymentType || "-",
            amount: sumDetailAmount || 0,
            receiptNo: data.payment?.id || "-",
            createdAt: data.payment?.createdDate || "-",
            customerPaymentDetails: data.paymentDetails,
          };

          const win = window.open("", "_blank");
          const printContent = generateReceiptHTML(formatedData); // 👈 generate HTML string
          win.document.write(printContent);
          win.document.close();
          win.focus();
          setTimeout(() => win.print(), 500); // slight delay to render
        }
      }
    } else {
      notifyError(
        customerPayment.paymentStatus + " payments not allowed!",
        "",
        4000
      );
    }
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
      amount,
      receiptNo,
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
          <div class="receipt-title">RECEIPT</div>
        </div>

        <div class="info">
          <div>
            <p><strong>Receipt No:</strong> ${receiptNo}</p>
            <p><strong>Customer Name:</strong> ${customerName}</p>
            <p><strong>CNIC:</strong> ${cnic}</p>
            <p><strong>Father / Husband Name:</strong> ${fatherHusbandName}</p>
            <p><strong>Contact No:</strong> ${contactNo}</p>
            <p><strong>Address:</strong> ${address}</p>
            <p><strong>Receipt Date:</strong> ${formattedDate}</p>
          </div>
          <div>
            <p><strong>Unit No:</strong> ${flatNo}</p>
            <p><strong>Floor:</strong> ${getOrdinal(floor)}</p>
            <p><strong>Type:</strong> ${type}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Sr#</th>
              <th>Paid Date</th>
              <th>Type</th>
              <th>Payment Method</th>
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
                  <td>INSTALLMENT</td>
                  <td>${detail.paymentType}</td>
                  <td>${parseFloat(detail.amount).toLocaleString()}</td>
                </tr>
              `;
              })
              .join("")}
          </tbody>
        </table>

        <h3 style="text-align: right;">Grand Total: ${parseFloat(
          amount
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

  const actions = [
    {
      icon: FaEye,
      onClick: handleDetailModal,
      title: "View Details",
      className: "text-green-600",
    },
    {
      icon: BsFillSave2Fill,
      onClick: handlePaymentModal,
      title: "Payment",
      className: "text-green-600",
    },
    {
      icon: MdPrint,
      onClick: handlePrintSlip,
      title: "Print Slip",
      className: "yellow",
    },
    { icon: FaPen, onClick: handleEdit, title: "Edit", className: "yellow" },
    {
      icon: FaTrashAlt,
      onClick: handleDelete,
      title: "Delete",
      className: "text-red-600",
    },
  ];

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

  const handleSubmit = async () => {
    const validAmount =
      payInstallment.receivedAmount > 0 ||
      payInstallment.customerPaymentDetails.some((detail) => detail.amount > 0);

    if (!validAmount || validAmount < 0) {
      return notifyError(
        "Invalid Amount!",
        "Amount should be greater than 0",
        4000
      );
    }

    payInstallment.id = selectedPayment.id;
    setLoading(true);
    try {
      let filterId = selectedCustomerAccount || customerAccountId;
      let customerObj = customerAccountList.find(
        (customer) => customer.accountId == filterId
      );

      const orgAccountList = payInstallment.organizationAccountDetails?.map(
        (orgAccount) => {
          return {
            ...orgAccount,
            customerAccountId: selectedPayment.customerAccountId,
            customerPaymentId: selectedPayment.id,
            customerId: customerObj?.customerId,
          };
        }
      );

      payInstallment.organizationAccountDetails = orgAccountList;
      payInstallment.customerAccountId = filterId;


      const response = await httpService.post(
        `/customerPayment/payInstallment`,
        payInstallment
      );

      notifySuccess(response.responseMessage, 4000);
      await fetchCustomerPayments();
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      toggleModal();
      setLoading(false);
    }
  };

  const onChangeForm = (e) => {
    const { name, value } = e.target;
    setPayInstallment((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const onChangeFormDetail = (e, index) => {
    const { name, value } = e.target;
    const updatedInstallmentDetail = [...payInstallment.customerPaymentDetails];
    updatedInstallmentDetail[index][name] = value;

    setPayInstallment((prev) => ({
      ...prev,
      customerPaymentDetails: updatedInstallmentDetail,
    }));
  };
  const onChangeAccountDetail = (e, index) => {
    const { name, value } = e.target;
    const updatedAccountDetail = [...payInstallment.organizationAccountDetails];
    updatedAccountDetail[index][name] = value;

    setPayInstallment((prev) => ({
      ...prev,
      organizationAccountDetails: updatedAccountDetail,
    }));
  };

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
      customerPaymentDetails: [
        {
          amount: 0,
          paymentType: "CASH",
          createdDate: new Date().toISOString().slice(0, 16),
        },
      ],
    }));
  };

  const onAddDetailRow = () => {
    const updatedInstallmentDetail = [
      ...payInstallment.customerPaymentDetails,
      {
        amount: 0,
        paymentType: "CASH",
        createdDate: new Date().toISOString().slice(0, 16),
      },
    ];
    setPayInstallment({
      ...payInstallment,
      customerPaymentDetails: updatedInstallmentDetail,
    });
  };
  const onAddAccountRow = () => {
    const updatedAccountDetail = [
      ...payInstallment.organizationAccountDetails,
      {
        organizationAcctId: 0,
        transactionType: "CREDIT",
        amount: 0,
        comments: "",
        customerId: 0,
        customerPaymentId: 0,
        customerPaymentDetailId: 0,
        customerAccountId: 0,
        createdDate: new Date().toISOString().slice(0, 16),
      },
    ];

    setPayInstallment({
      ...payInstallment,
      organizationAccountDetails: updatedAccountDetail,
    });
  };

  const onRemoveDetailRow = (index) => {
    const updatedInstallmentDetail = [...payInstallment.customerPaymentDetails];
    updatedInstallmentDetail.splice(index, 1);
    setPayInstallment({
      ...payInstallment,
      customerPaymentDetails: updatedInstallmentDetail,
    });
  };
  const onRemoveAccountRow = (index) => {
    const updatedAccountDetail = [...payInstallment.organizationAccountDetails];
    updatedAccountDetail.splice(index, 1);
    setPayInstallment({
      ...payInstallment,
      organizationAccountDetails: updatedAccountDetail,
    });
  };

  const onPrintDetail = async (customerPaymentDetail) => {
    const customerPayment = customerPaymentList.find(
      (payment) => payment.id == customerPaymentDetail.customerPaymentId
    );

    const customer = customerAccountList.find(
      (custom) => custom.accountId == customerPayment.customerAccountId
    );

    if (customer.customerId) {
      const request = {
        customerId: customer.customerId,
        customerPaymentId: customerPayment.id,
      };
      const response = await httpService.post(
        `/customer/getFullDetailsByCustomerId`,
        request
      );
      if (response) {
        let data = {
          ...response.data,
          ...customerPayment,
        };

        const formatedData = {
          contactNo: data.customer?.contactNo || "-",
          customerName: data.customer?.customerName || "-",
          cnic: data.customer?.nationalId || "-",
          fatherHusbandName: data.customer?.guardianName || "-",
          address: data.customer?.customerAddress || "-",
          flatNo: data.customer?.unitSerial || "-",
          floor: data.customer?.floorNo?.toString() || "-",
          type: data.customer?.unitType || "-",
          paymentType: data.payment?.paymentType || "-",
          amount: customerPaymentDetail?.amount || 0,
          receiptNo: data.payment?.id || "-",
          createdAt: data.payment?.createdDate || "-",
          customerPaymentDetails: [customerPaymentDetail],
        };

        console.log("formatedData :: ", formatedData);

        const win = window.open("", "_blank");
        const printContent = generateReceiptHTML(formatedData); // 👈 generate HTML string
        win.document.write(printContent);
        win.document.close();
        win.focus();
        setTimeout(() => win.print(), 500); // slight delay to render
      }
    }
  };

  return (
    <>
      <DynamicDetailsModal
        isOpen={isModalOpen}
        onClose={toggleModalDetail}
        data={selectedPayment}
        title="Customer Details"
      />
      <PaymentModal
        selectedPayment={selectedPayment}
        isOpen={isFormModalOpen}
        onClose={toggleModal}
        formTitle="Installment Payment Form"
        fields={payInstallment}
        onChangeForm={onChangeForm}
        onChangeFormDetail={onChangeFormDetail}
        onChangeAccountDetail={onChangeAccountDetail}
        onAddDetailRow={onAddDetailRow}
        onAddAccountRow={onAddAccountRow}
        onRemoveDetailRow={onRemoveDetailRow}
        onRemoveAccountRow={onRemoveAccountRow}
        onPrintDetail={onPrintDetail}
        onSubmit={handleSubmit}
      />
      <div className="container mx-auto p-4">
        <div className="flex flex-wrap py-3 md:justify-content-between">
          <div className=" bg-white shadow-lg p-5 rounded-12 lg:w-4/12 md:w-6/12 sm:w-12/12">
            <label className="block text-sm font-medium mb-1">Project</label>
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
          <div className="bg-white shadow-lg p-5 mx-4 rounded-12 lg:w-4/12 md:w-6/12 sm:w-12/12 md:mx-0 sm:mt-5">
            <label className="block text-sm font-medium mb-1">
              Customer Account
            </label>
            <select
              value={selectedCustomerAccount}
              onChange={(e) => changeCustomerAccount(e.target.value)}
              className="border rounded px-3 py-2 w-full"
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

      {/* Dynamic Table */}
      <div className="container mx-auto p-4">
        <DynamicTableComponent
          fetchDataFunction={fetchCustomerPayments}
          setPage={setPage}
          page={page}
          data={customerPaymentList}
          columns={tableColumns} // You need to define the columns for the table
          pageSize={pageSize}
          totalPages={totalPages}
          totalElements={totalElements}
          loading={loading}
          actions={actions}
          title={customerName ? customerName + " - Payments" : ""}
        />
      </div>
    </>
  );
}
