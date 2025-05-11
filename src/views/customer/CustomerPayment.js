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
    paymentType: "CASH",
    serialNo: 0,
    customerPaymentDetails: [],
  });
  const [selectedPaymetType, setselectedPaymetType] =
    useState("SINGLE PAYMENT");
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
      notifyError(err.message, err.data, 4000);
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
      notifyError("Failed to load projects", 4000);
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
    { header: "Created By", field: "createdBy" },
    { header: "Created Date", field: "createdDate" },
    { header: "Updated By", field: "updatedBy" },
    { header: "Updated Date", field: "updatedDate" },
  ];

  const handlePaymentModal = (customerPayment) => {
    setSelectedPayment(customerPayment);
    toggleModal();
  };

  const handleEdit = (customerPayment) => {};

  const handleDelete = (customerPayment) => {};

  const actions = [
    {
      icon: BsFillSave2Fill,
      onClick: handlePaymentModal,
      title: "Pay",
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
    setIsFormModalOpen(!isFormModalOpen);
    onResetForm();
    onResetFormDetail();
  };

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");

  const handleSubmit = async () => {
    const validAmount =
      payInstallment.receivedAmount > 0 ||
      payInstallment.customerPaymentDetails.some((detail) => detail.amount > 0);

    if (!validAmount) {
      return notifyError(
        "Invalid Amount!",
        "Amount should be greater than 0",
        4000
      );
    }

    payInstallment.id = selectedPayment.id;
    setLoading(true);
    try {
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

  const formFields = [
    {
      name: "name",
      label: "Name",
      type: "text",
      value: name,
      setter: setName,
      col: 6,
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      value: email,
      setter: setEmail,
      col: 6,
    },
    {
      name: "age",
      label: "Age",
      type: "number",
      value: age,
      setter: setAge,
      col: 6,
    },
  ];

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
      customerPaymentDetails: [],
    }));
  };

  const onAddDetailRow = () => {
    const updatedInstallmentDetail = [
      ...payInstallment.customerPaymentDetails,
      { amount: 0, paymentType: "CASH" },
    ];
    setPayInstallment({
      ...payInstallment,
      customerPaymentDetails: updatedInstallmentDetail,
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

  return (
    <>
      <PaymentModal
        isOpen={isFormModalOpen}
        onClose={toggleModal}
        formTitle="Installment Payment Form"
        fields={payInstallment}
        onChangeForm={onChangeForm}
        onResetForm={onResetForm}
        onResetFormDetail={onResetFormDetail}
        onChangeFormDetail={onChangeFormDetail}
        onAddDetailRow={onAddDetailRow}
        onRemoveDetailRow={onRemoveDetailRow}
        selectedPaymetType={selectedPaymetType}
        setselectedPaymetType={setselectedPaymetType}
        onSubmit={handleSubmit}
      />
      <div className="container mx-auto ">
        <div className="flex flex-wrap  py-3 px-4">
          <div className=" bg-white  shadow-lg p-5 rounded lg:w-4/12 ">
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
          <div className="bg-white  shadow-lg p-5 rounded lg:w-4/12 mx-4">
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
                  {account.customerName}
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
