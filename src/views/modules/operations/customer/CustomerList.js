import React, { useEffect, useState, useContext } from "react";
import httpService from "../../../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../../../components/table/DynamicTableComponent.js";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min.js";
import DynamicDetailsModal from "components/CustomerComponents/DynamicModal.js";
import { FaEye, FaFilter, FaPen, FaTrashAlt } from "react-icons/fa";
import { RiAccountPinBoxFill } from "react-icons/ri";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min.js";
import { IoShareSocial } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import "../../../../assets/styles/custom/uploadImage.css";
import "../../../../assets/styles/projects/project.css";

export default function CustomerList() {
  const {
    loading,
    backdrop,
    setBackdrop,
    setLoading,
    notifyError,
    notifySuccess,
  } = useContext(MainContext);
  const location = useLocation();

  const history = useHistory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cId, setCId] = useState(null);
  const [isModalOpenAccount, setIsModalOpenAccount] = useState(false);
  const [customerList, setCustomerList] = useState([]);
  const [selectedCustomer, setSelectedCustomer] = useState({});
  const [selectedCustomerAccount, setSelectedCustomerAccount] = useState({});
  const [projects, setProjects] = useState([]);
  const [filterProject, setFilterProject] = useState("");
  const [filterFloor, setFilterFloor] = useState("");
  const [fileteredId, setFileteredId] = useState("");
  const [filteredBy, setFilteredBy] = useState("organization");
  const [floorOptions, setFloorOptions] = useState([]);
  const [paymentSchedule, setPaymentSchedule] = useState({
    durationInMonths: 0,
    actualAmount: 0,
    miscellaneousAmount: 0,
    totalAmount: 0,
    downPayment: 0,
    quarterlyPayment: 0,
    halfYearlyPayment: 0,
    yearlyPayment: 0,
    onPossessionPayment: 0,
    monthWisePaymentList: [{ fromMonth: 0, toMonth: 0, amount: 0 }],
  });

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const cid = queryParams.get("cId");
    setCId(cid);
    fetchCustomerDetails(cid);
  }, [page, filterProject, filterFloor, pageSize]);

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
      if (!cId) notifyError(err.message, err.data, 4000);
    }
  };

  const fetchFloors = async (projectId) => {
    try {
      const response = await httpService.get(
        `/floor/getAllFloorsByProject/${projectId}`
      );
      setFloorOptions(response.data || []);
    } catch (err) {
      if (!cId) notifyError(err.message, err.data, 4000);
    }
  };

  const fetchCustomerDetails = async (cid) => {
    setLoading(true);

    try {
      const requestBody = {
        id: fileteredId,
        filteredBy: filteredBy,
        page,
        size: pageSize,
        sortBy: "customerId",
        sortDir: "asc",
        filters: {
          projectId: filterProject || null,
          floorId: filterFloor || null,
        },
      };

      if (!fileteredId) {
        let organizationLocal = JSON.parse(
          localStorage.getItem("organization")
        );
        if (organizationLocal) {
          requestBody.id = organizationLocal.organizationId;
        }
        requestBody.filteredBy = "organization";
      }

      var response = null;
      var dataList = [];

      if (cid && typeof cid == "object") {
        const queryParams = new URLSearchParams(location.search);
        const querycid = queryParams.get("cId");
        if (querycid) {
          response = await httpService.get(`/customer/${querycid}`);
          dataList = [response?.data];
        } else {
          response = await httpService.post(`/customer/getByIds`, requestBody);
          dataList = response?.data?.content;
        }
      } else if (cid && typeof cid == "string") {
        response = await httpService.get(`/customer/${cid}`);
        dataList = [response?.data];
      } else {
        response = await httpService.post(`/customer/getByIds`, requestBody);
        dataList = response?.data?.content;
      }

      setCustomerList(dataList || []);
      setTotalPages(response?.data?.totalPages || 0);
      setTotalElements(response?.data?.totalElements || 0);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const changeSelectedProjected = (projectId) => {
    setPage(0);
    setFilterProject(projectId);
    setFilterFloor("");

    if (projectId) {
      setFileteredId(projectId);
      setFilteredBy("project");
      fetchFloors(projectId);
    } else {
      setFileteredId("");
      setFilteredBy("organization");
      setFloorOptions([]);
    }
  };

  const changeSelectedFloor = (floorId) => {
    setPage(0);
    setFilterFloor(floorId);

    if (floorId) {
      setFileteredId(floorId);
      setFilteredBy("floor");
    } else if (filterProject) {
      setFileteredId(filterProject);
      setFilteredBy("project");
    } else {
      setFileteredId("");
      setFilteredBy("organization");
    }
  };

  const handleClearFilters = () => {
    setPage(0);
    setFilterProject("");
    setFilterFloor("");
    setFileteredId("");
    setFilteredBy("organization");
    setFloorOptions([]);
  };

  const tableColumns = [
    {
      header: "Image",
      field: "profileImageUrl",
      render: (value) => {
        let baseURL = httpService.BASE_URL.replace("/api", "");
        let preview = value && value !== "—" ? `${baseURL}${value}` : null;

        return (
          <div className="avatar-wrapper">
            {value != "—" ? (
              <img
                src={preview}
                alt="Customer"
                className="avatar-img"
                onError={(e) => {
                  // Prevent infinite loop
                  e.target.onerror = null;

                  // Hide broken image
                  e.target.style.display = "none";

                  // Show icon placeholder
                  const placeholder =
                    e.target.nextSibling || document.createElement("div");

                  placeholder.className = "avatar-placeholder";
                  placeholder.innerHTML =
                    '<i class="fas fa-user avatar-customer"></i>';

                  e.target.parentNode.appendChild(placeholder);
                }}
              />
            ) : (
              <div className="avatar-placeholder">
                <i className="fas fa-user avatar-customer"></i>
              </div>
            )}
          </div>
        );
      },
    },
    { header: "Name", field: "name" },
    { header: "Email", field: "email" },
    { header: "Country", field: "country" },
    { header: "City", field: "city" },
    { header: "Units Count", field: "unitCount" },
    { header: "Contact", field: "contactNo" },
  ];

  const handleView = async (customer) => {
    const unitDetailsList = [];
    try {
      const response = await httpService.get(
        `/customer/getUnitListDetailsByCustomerId/${customer.customerId}`
      );

      unitDetailsList = response.data;
    } catch (err) {}

    const formattedCustomer = {
      "Basic Details": {
        Name: customer.name,
        "National Id": customer.nationalId,
        Email: customer.email,
        Username: customer.username,
        Password: customer.password,
      },
      "Next of Kin Details": {
        "Next Of Kin Name": customer.nextOFKinName,
        "Next Of Kin National Id": customer.nextOFKinNationalId,
        "Relationship With Kin": customer.relationShipWithKin,
      },
      "Property Details": {
        "Total Unit": customer.unitCount,
        "Unit Details": unitDetailsList,
      },
      "Location Details": {
        Country: customer.country,
        City: customer.city,
        Address: customer.address,
      },
      "Audit Info": {
        "Created By": customer.createdBy,
        "Updated By": customer.updatedBy,
        "Created Date": customer.createdDate,
        "Updated Date": customer.updatedDate,
      },
    };

    setSelectedCustomer(formattedCustomer);
    toggleModal();
  };

  const handleSendEmail = async (customer) => {
    setLoading(true);
    try {
      const response = await httpService.post(
        `/customer/sendCredentialEmail`,
        customer
      );

      notifySuccess(response?.data, 4000);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerAccount = async (customer) => {
    try {
      history.push(`/dashboard/customer-account?cId=${customer.customerId}`);

      // const requestBody = {
      //   customerId: customer.customerId
      // };

      // const response = await httpService.post(
      //   `/customerAccount/getByCustomerId`,
      //   requestBody
      // );
      // const data = response?.data.content;

      // let paymentRequest = {
      //   id: customer.unitId,
      //   paymentScheduleType: "CUSTOMER",
      // };
      // const responsePayment = await httpService.post(
      //   `/paymentSchedule/getByUnit`,
      //   paymentRequest
      // );

      // const monthWisePaymentList =
      //   responsePayment?.data?.monthWisePaymentList?.map((month) => {
      //     return {
      //       "From Month": month.fromMonth,
      //       "To Month": month.toMonth,
      //       "Monthly Amount": month.amount,
      //     };
      //   });

      // const formattedCustomerAccount = {
      //   "Unit Details": {
      //     "Serial No": data?.unit?.serialNo,
      //     "Square Foot": data?.unit?.squareFoot,
      //     "Room Count": data?.unit?.roomCount,
      //     "Bathroom Count": data?.unit?.bathroomCount,
      //     Amount: data?.unit?.amount,
      //     "Additional Amount": data?.unit?.additionalAmount,
      //     "Total Amount":
      //       Number(data?.unit?.additionalAmount) + Number(data?.unit?.amount),
      //     "Unit Type": data?.unit?.unitType,
      //     Booked: data?.unit?.booked,
      //   },
      //   "Customer Account Agreement": {
      //     "Payment Structure": {
      //       "Duration In Months": responsePayment.data?.durationInMonths,
      //       "Actual Amount": responsePayment.data?.actualAmount,
      //       "Miscellaneous Amount": responsePayment.data?.miscellaneousAmount,
      //       "Total Amount": responsePayment.data?.totalAmount,
      //     },

      //     "Payment Breakdown": {
      //       "Down Payment": responsePayment.data?.downPayment,
      //       "Quarterly Payment": responsePayment.data?.quarterlyPayment,
      //       "Half Yearly": responsePayment.data?.halfYearlyPayment,
      //       Yearly: responsePayment.data?.yearlyPayment,
      //       "On Possession Amount": responsePayment.data?.onPossessionPayment,
      //     },
      //     "Monthly Payments": monthWisePaymentList,
      //   },
      //   "Audit Info": {
      //     "Created By": data?.createdBy,
      //     "Updated By": data?.updatedBy,
      //     "Created Date": data?.createdDate,
      //     "Updated Date": data?.updatedDate,
      //   },
      // };

      // setSelectedCustomerAccount(formattedCustomerAccount);
      // toggleModalAccount();
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    }
  };

  const handleEdit = (customer) => {
    history.push(`/dashboard/update-customer/${customer.customerId}`);
  };

  const actions = [
    {
      icon: FaEye,
      onClick: handleView,
      title: "Customer Detail",
      className: "text-green-600",
    },
    {
      icon: RiAccountPinBoxFill,
      onClick: handleCustomerAccount,
      title: "Account Details",
      className: "text-green-600",
    },
    { icon: FaPen, onClick: handleEdit, title: "Edit", className: "yellow" },
    {
      icon: IoShareSocial,
      onClick: handleSendEmail,
      title: "Send Credential Email",
      className: "text-green-600",
    },
  ];

  const toggleModal = () => {
    setBackdrop(!backdrop);
    setIsModalOpen(!isModalOpen);
  };
  const toggleModalAccount = () => {
    setBackdrop(!backdrop);
    setIsModalOpenAccount(!isModalOpenAccount);
  };

  const hasActiveFilters = Boolean(filterProject || filterFloor);

  return (
    <>
      <DynamicDetailsModal
        isOpen={isModalOpen}
        onClose={toggleModal}
        data={selectedCustomer}
        title="Customer Details"
      />
      <DynamicDetailsModal
        isOpen={isModalOpenAccount}
        onClose={toggleModalAccount}
        data={selectedCustomerAccount}
        title="Account Details"
      />
      <div className="container mx-auto p-4">
        <div className="booking-filter-shell">
          <div className="booking-filter-header">
            <div>
              <h4 className="booking-filter-title">
                <FaFilter className="booking-filter-title-icon" />
                Filter Customers
              </h4>
              <p className="booking-filter-subtitle">
                Use project and floor filters to find customers quickly.
              </p>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="booking-filter-clear-btn"
              >
                <RxCross2 className="booking-filter-clear-icon" />
                Clear Filters
              </button>
            )}
          </div>

          <div className="booking-filter-grid">
            <div className="booking-filter-field">
              <label className="booking-filter-label">Project</label>
              <select
                value={filterProject}
                onChange={(e) => changeSelectedProjected(e.target.value)}
                className="booking-filter-select"
              >
                <option value="">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="booking-filter-field">
              <label className="booking-filter-label">Floor</label>
              <select
                value={filterFloor}
                onChange={(e) => changeSelectedFloor(e.target.value)}
                className="booking-filter-select"
                disabled={!filterProject}
              >
                <option value="">
                  {filterProject ? "All Floors" : "Select a project first"}
                </option>
                {filterProject &&
                  floorOptions.map((floor) => (
                    <option key={floor.id} value={floor.id}>
                      {floor.floorNo}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>
      </div>
      <div className="container mx-auto p-4">
        <DynamicTableComponent
          fetchDataFunction={fetchCustomerDetails}
          setPage={setPage}
          page={page}
          data={customerList}
          columns={tableColumns}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalPages={totalPages}
          totalElements={totalElements}
          loading={loading}
          title="Customer List"
          actions={actions}
        />
      </div>
    </>
  );
}
