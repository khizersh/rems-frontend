import React, { useEffect, useState, useContext } from "react";
import httpService from "../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../components/table/DynamicTableComponent.js";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min.js";
import { FaDownload, FaEye, FaPen, FaTrashAlt } from "react-icons/fa";
import { MdPrint } from "react-icons/md";
import { generateBookingHtml } from "utility/Utility.js";
import { getOrdinal } from "utility/Utility.js";
import { BsBuildingFillAdd } from "react-icons/bs";
import { MdSchedule, MdCancel } from "react-icons/md";
import CancelBookingModal from "./CancelBookingModal.js";
import CustomerAccount from "views/customer/CustomerAccount.js";
import { GoSearch } from "react-icons/go";
import { RxCross2 } from "react-icons/rx";
import { paymentTypes } from "utility/Utility.js";

export default function BookingCancelList() {
  const {
    loading,
    setLoading,
    notifyError,
    notifyWarning,
    setBackdrop,
    notifySuccess,
    backdrop,
  } = useContext(MainContext);
  const history = useHistory();

  const [bookingList, setBookingList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filterProject, setFilterProject] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [filterFloor, setFilterFloor] = useState("");
  const [fileteredId, setFileteredId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [accountList, setAccountList] = useState([]);
  const [customerName, setCustomerName] = useState("");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paybackRequest, setPaybackRequest] = useState({
    amountPaid: 0,
    organizationAccountId: 0,
    paymentType: "",
    paymentDocNo: 0,
    paymentDocDate: new Date().toISOString().slice(0, 16),
    createdDate: new Date().toISOString().slice(0, 16),
  });

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchProjects();
    fetchAccountList();
  }, []);

  useEffect(() => {
    fetchCancelBookingList();
  }, [page, filterProject, filterFloor]);

  const fetchProjects = async () => {
    try {
      const sidebarData =
        JSON.parse(localStorage.getItem("organization")) || null;
      if (sidebarData) {
        const response = await httpService.get(
          `/project/getAllProjectByOrg/${sidebarData.organizationId}`
        );
        setProjects(response.data || []);
      }
    } catch (err) {
      notifyError("Failed to load projects", 4000);
    }
  };

  const fetchCancelBookingList = async () => {
    setLoading(true);
    try {
      let url = "";
      let organizationLocal = JSON.parse(localStorage.getItem("organization"));
      if (organizationLocal) {
        url = `/booking/${organizationLocal.organizationId}/allCancelledBookings`;
      }
      if (projectId && customerName) {
        url += `?projectId=${projectId}&customerName=${customerName}`;
      } else if (projectId) {
        url += `?projectId=${projectId}`;
      } else if (customerName) {
        url += `?customerName=${customerName}`;
      }

      const response = await httpService.get(url);

      setBookingList(response?.data || []);
      setTotalPages(0);
      setTotalElements(0);
    } catch (err) {
      notifyWarning("Please try with different name", err.data, 4000);
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

  const changeSelectedProjected = (projectId) => {
    if (projectId) {
      setProjectId(projectId);
    } else {
      setProjectId("");
    }
  };
  const changeCustomer = (name) => {
    if (name) {
      setCustomerName(name);
    } else {
      setCustomerName("");
    }
  };

  const handleSchedule = async (unit) => {
    // history.push("/dashboard/customer-schedule/" + unit?.id);
  };
  const tableColumns = [
    { header: "Customer Name", field: "customerName" },
    { header: "Unit Serial", field: "unitSerial" },
    { header: "Project", field: "project" },
    { header: "Total Amount", field: "totalCancelPayable" },
    { header: "Refund Amount ", field: "totalCancelRefund" },
    { header: "Total Deduction ", field: "totalCancelDeductions" },
    { header: "Total Paid Amount ", field: "totalCancelPaid" },
    { header: "Remaining Amount", field: "totalCancelBalanceAmount" },
    {
      header: "State",
      field: "cancelledStatus",
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
  ];

  const onClickPrintBooking = async (data) => {
    const response = await httpService.get(
      `/booking/getDetailById/${data?.id}`
    );

    const unit = response?.data?.unit;
    const customer = response?.data?.customer;

    let orgName = "";
    const organization =
      JSON.parse(localStorage.getItem("organization")) || null;
    if (organization) {
      orgName = organization.name;
    }

    const formattedData = {
      orgName: orgName,
      projectName: data?.project,
      bookingNo: data?.id,
      customerNo: data?.customerId,
      serial: data?.unitSerial,
      type: unit?.unitType,
      floor: getOrdinal(data?.floorNo),
      size: unit?.squareFoot + " sqft",
      name: data?.customerName,
      guardianName: customer?.guardianName,
      postalAddress: customer?.address,
      residentialAddress: customer?.address,
      phone: customer?.contactNow9,
      email: customer?.email,
      age: customer?.age,
      nationality: "Pakistani",
      cnic: customer?.nationalId,
      nominee: customer?.nextOFKinName,
      nomineeRelation: customer?.relationShipWithKin,
      amount: unit?.amount,
      payOrderNo: "",
      bank: "",
      date: data?.createdDate?.split("T")[0],
    };

    const win = window.open("", "_blank");
    const printContent = generateBookingHtml(formattedData);
    win.document.write(printContent);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  const onClickPayback = async (data) => {
    try {
      setSelectedBooking(data);
      onClickToggleModal();
    } catch (err) {
      notifyError(err?.message, err?.data, 4000);
    }
  };

  const actions = [
    {
      icon: MdSchedule,
      onClick: handleSchedule,
      title: "Payment Schedule",
      className: "text-blue-600",
    },
    {
      icon: FaDownload,
      onClick: onClickPayback,
      title: "Pay back",
      className: "text-emerald-500",
    },
  ];

  const changePaybackRequest = (e) => {
    const { name, value } = e.target;
    setPaybackRequest((prev) => ({ ...prev, [name]: value }));
  };

  const onClickToggleModal = () => {
    setBackdrop(!backdrop);
    setIsOpen(!isOpen);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      //  paybackRequest
      let requestBody = {
        details: [
          {
            customerPayableId: selectedBooking?.customerPayableId,
            paymentType: paybackRequest.paymentType,
            amount: paybackRequest.amountPaid,
            organizationAccountId: paybackRequest.organizationAccountId,
            chequeNo: paybackRequest.paymentDocNo,
            chequeDate: paybackRequest.paymentDocDate,
            comments: "",
          },
        ],
      };
      console.log("requestBody :: ", requestBody);
      const data = await httpService.post(
        `/booking/${selectedBooking?.customerPayableId}/addPaymentDetails`,
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
      <div className="container mx-auto p-4">
        <div className="w-full">
          <div className="bg-white rounded-12 shadow-lg flex flex-wrap py-3 md:justify-content-between">
            <div className=" p-5 rounded-12 lg:w-4/12 md:w-6/12 sm:w-12/12">
              <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                PROJECT
              </label>
              <select
                value={projectId}
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

            <div className="p-5 rounded-12 lg:w-4/12 md:w-6/12 sm:w-12/12">
              <div className="relative w-full mb-3">
                <label
                  className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                  htmlFor="name"
                >
                  CUSTOMER NAME
                </label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter customer name"
                  onChange={(e) => changeCustomer(e.target.value)}
                  className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                  value={customerName}
                />
              </div>
            </div>
            <div className=" p-5 rounded-12  lg:w-4/12 md:w-6/12 sm:w-12/12 md:mx-0 sm:mt-5">
              <button
                onClick={fetchCancelBookingList}
                type="submit"
                className="mt-7 ml-1 bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
              >
                <GoSearch
                  className="w-5 h-5 inline-block "
                  style={{ paddingBottom: "3px", paddingRight: "5px" }}
                />
                Search
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        {isOpen ? (
          <div>
            <div className="payback-modal inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
              <div className="bg-white rounded shadow-lg  w-full max-w-xl">
                <div className="flex justify-between items-center mb-4 p-4">
                  <h2 className="text-xl font-bold uppercase">Pay Back Form</h2>
                  <button onClick={onClickToggleModal}>
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
                          value={paybackRequest.amountPaid}
                          onChange={changePaybackRequest}
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
                          value={paybackRequest.organizationAccountId}
                          onChange={changePaybackRequest}
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
                          value={paybackRequest.paymentType}
                          onChange={changePaybackRequest}
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
                    {paybackRequest.paymentType == "CHEQUE" ||
                    paybackRequest.paymentType == "PAY_ORDER" ? (
                      <>
                        <div className="w-full lg:w-3/12 px-2 mb-2">
                          <div className="relative w-full mb-2">
                            <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                              {paybackRequest.paymentType == "CHEQUE"
                                ? "Cheque"
                                : "Pay Order"}{" "}
                              No
                            </label>
                            <input
                              name="paymentDocNo"
                              type="text"
                              value={paybackRequest.paymentDocNo}
                              onChange={changePaybackRequest}
                              className="border rounded px-3 py-2 w-full"
                              placeholder="Enter amount"
                            />
                          </div>
                        </div>
                        <div className="w-full lg:w-3/12 px-2 mb-2">
                          <div className="relative w-full mb-2">
                            <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                              {paybackRequest.paymentType == "CHEQUE"
                                ? "Cheque"
                                : "Pay Order"}{" "}
                              Date
                            </label>
                            <input
                              type="datetime-local"
                              name="paymentDocDate"
                              value={paybackRequest.paymentDocDate}
                              onChange={changePaybackRequest}
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
                          value={paybackRequest.createdDate}
                          onChange={changePaybackRequest}
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
      </div>
      <div className="container mx-auto p-4">
        <DynamicTableComponent
          fetchDataFunction={fetchCancelBookingList}
          setPage={setPage}
          page={page}
          data={bookingList}
          columns={tableColumns}
          pageSize={pageSize}
          totalPages={totalPages}
          totalElements={totalElements}
          loading={loading}
          title="Cancelled Booking List"
          actions={actions}
        />
      </div>
    </>
  );
}
