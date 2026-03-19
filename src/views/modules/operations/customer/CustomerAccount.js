import React, { useEffect, useState, useContext, useRef } from "react";
import httpService from "../../../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../../../components/table/DynamicTableComponent.js";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min.js";
import { FaEye, FaFilter, FaPen, FaTrashAlt } from "react-icons/fa";
import DynamicDetailsModal from "components/CustomerComponents/DynamicModal.js";
import { MdOutlinePayments } from "react-icons/md";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min.js";
import { RxCross2 } from "react-icons/rx";
import "../../../../assets/styles/projects/project.css";

export default function CustomerAccount() {
  const { loading, setLoading, notifyError, backdrop, setBackdrop } =
    useContext(MainContext);
  const history = useHistory();
  const location = useLocation();
  const customerIdUsedRef = useRef(false);

  const [projects, setProjects] = useState([]);
  const [filterProject, setFilterProject] = useState(""); // For filtering by project
  const [customerIdUsed, setCustomerIdUsed] = useState(false); // For filtering by project
  const [filterFloor, setFilterFloor] = useState(""); // For filtering by floor
  const [filteredId, setFilteredId] = useState(""); // The ID of the selected project or floor
  const [filteredBy, setFilteredBy] = useState("organization"); // Keep track of whether we're filtering by project or floor
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [floorOptions, setFloorOptions] = useState([]);
  const [customerAccountList, setCustomerAccountList] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomerAccount, setSelectedCustomerAccount] = useState(null);
  const pageSize = 10;

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const queryParams = new URLSearchParams(location.search);
      const myParam = queryParams.get("cId");

      if (myParam && !customerIdUsedRef.current) {
        await fetchCustomerDetailsById(myParam);
        customerIdUsedRef.current = true;
      } else {
        await fetchCustomerDetails();
      }
    };

    fetchData();
  }, [page, filteredId, filteredBy]);

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

  const fetchFloors = async (projectId) => {
    try {
      const response = await httpService.get(
        `/floor/getAllFloorsByProject/${projectId}`
      );
      setFloorOptions(response.data || []);
    } catch (err) {
      notifyError("Failed to load floors", 4000);
    }
  };

  const fetchCustomerDetailsById = async (id) => {
    setLoading(true);
    try {
      const requestBody = {
        id: id,
        filteredBy: "",
        page,
        size: pageSize,
        sortBy: "id",
        sortDir: "asc",
      };
      const response = await httpService.post(
        "/customerAccount/getByCustomerId",
        requestBody
      );

      let responseArray = response?.data?.content;

      console.log("responseArray :: ", responseArray);

      setCustomerAccountList(responseArray || []);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  // Fetch customer details based on the filter
  const fetchCustomerDetails = async () => {
    setLoading(true);
    try {
      const requestBody = {
        id: filteredId,
        filteredBy: filteredBy,
        page,
        size: pageSize,
        sortBy: "id",
        sortDir: "asc",
      };

      if (!filteredId) {
        let organizationLocal = JSON.parse(
          localStorage.getItem("organization")
        );
        if (organizationLocal) {
          requestBody.id = organizationLocal.organizationId;
        }
        requestBody.filteredBy = "organization";
      }

      const response = await httpService.post(
        "/customerAccount/getByIds",
        requestBody
      );

      console.log("response?.data?.content :: ", response?.data?.content);

      setCustomerAccountList(response?.data?.content || []);
      setTotalPages(response?.data?.totalPages || 0);
      setTotalElements(response?.data?.totalElements || 0);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  // Handle changing the selected project
  const changeSelectedProjected = (projectId) => {
    setPage(0);
    setFilterProject(projectId);
    setFilterFloor("");

    if (projectId) {
      setFilteredId(projectId);
      setFilteredBy("project");
      fetchFloors(projectId);
    } else {
      setFilteredId("");
      setFilteredBy("organization");
      setFloorOptions([]);
    }
  };

  const changeSelectedFloor = (floorId) => {
    setPage(0);
    setFilterFloor(floorId);

    if (floorId) {
      setFilteredId(floorId);
      setFilteredBy("floor");
    } else if (filterProject) {
      setFilteredId(filterProject);
      setFilteredBy("project");
    } else {
      setFilteredId("");
      setFilteredBy("organization");
    }
  };

  const handleClearFilters = () => {
    setPage(0);
    setFilterProject("");
    setFilterFloor("");
    setFilteredId("");
    setFilteredBy("organization");
    setFloorOptions([]);
  };

  const tableColumns = [
    { header: "Customer Name", field: "customer.name" },
    { header: "Project Name", field: "project.name" },
    { header: "Unit Serial No", field: "unit.serialNo" },
    { header: "Floor No", field: "unit.floorNo" },
    { header: "Received Amount", field: "totalPaidAmount" },
    { header: "Balance Amount", field: "totalBalanceAmount" },
    { header: "Total Amount", field: "totalAmount" },
  ];

  const handleViewDetails = async (account) => {
    try {
      console.log("account :: ", account);

      let paymentRequest = {
        id: account?.unit?.id,
        paymentScheduleType: "CUSTOMER",
      };
      const responsePayment = await httpService.post(
        `/paymentSchedule/getByUnit`,
        paymentRequest
      );

      const monthWisePaymentList =
        responsePayment?.data?.monthWisePaymentList?.map((month) => {
          return {
            "From Month": month.fromMonth,
            "To Month": month.toMonth,
            "Monthly Amount": month.amount,
          };
        });

      const formattedStructure = {
        "Account Details": {
          Name: account.customer?.name,
          "Payment Structure": {
            "Duration In Months": account.durationInMonths,
            "Actual Amount": account.actualAmount,
            "Miscellaneous Amount": account.miscellaneousAmount,
            "Development Amount": account.developmentAmount,
            "Total Amount": account.totalAmount,
          },

          "Payment Breakdown": {
            "Down Payment": account.downPayment,
            "Quarterly Payment": account.quarterlyPayment,
            "Half Yearly": account.halfYearly,
            Yearly: account.yearlyPayment,
            "On Possession Amount": account.onPosessionAmount,
          },
          "Monthly Payments": monthWisePaymentList,
        },
        "Payment Details": {
          "Total Paid Amount": account.totalPaidAmount,
          "Total Remaining Amount": account.totalBalanceAmount,
        },

        "Unit Details": {
          "Serial No": account.unit?.serialNo,
          "Square Foot": account.unit?.squareFoot,
          "Room Count": account.unit?.roomCount,
          "Bathroom Count": account.unit?.bathroomCount,
          Amount: account.unit?.amount,
          "Additional Amount": account.unit?.additionalAmount,
          "Payment Plan Type": account.unit?.paymentPlanType,
          "Unit Type": account.unit?.unitType,
        },
        "Project Details": {
          Name: account.project?.name,
          Address: account.project?.address,
          Floors: account.project?.floors,
        },

        "Audit Info": {
          "Created By": account.createdBy,
          "Updated By": account.updatedBy,
          "Created Date": account.createdDate,
          "Updated Date": account.updatedDate,
        },
      };

      setSelectedCustomerAccount(formattedStructure);
      toggleModal();
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    }
  };

  const handleViewPayment = (account) => {
    if (!account) {
      return notifyError("Invalid Account!", 4000);
    }
    let cName = account?.customer?.name;
    history.push(`/dashboard/customer-payment/${account.id}?cName=${cName}`);
  };

  const handleEdit = (floor) => {
    console.log("Edit Floor:", floor);
  };

  const handleDelete = (floor) => {
    console.log("Delete Floor:", floor);
  };

  const actions = [
    {
      icon: FaEye,
      onClick: handleViewDetails,
      title: "Account Detail",
      className: "text-green-600",
    },
    {
      icon: MdOutlinePayments,
      onClick: handleViewPayment,
      title: "Payment Detail",
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

  const hasActiveFilters = Boolean(filterProject || filterFloor);

  return (
    <>
      <DynamicDetailsModal
        isOpen={isModalOpen}
        onClose={toggleModal}
        data={selectedCustomerAccount}
        title="Customer Account Details"
      />
      <div className="container mx-auto p-4">
        <div className="booking-filter-shell">
          <div className="booking-filter-header">
            <div>
              <h4 className="booking-filter-title">
                <FaFilter className="booking-filter-title-icon" />
                Filter Customer Accounts
              </h4>
              <p className="booking-filter-subtitle">
                Narrow down accounts by project and floor.
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

      {/* Dynamic Table */}
      <div className="container mx-auto p-4">
        <DynamicTableComponent
          fetchDataFunction={fetchCustomerDetails}
          setPage={setPage}
          page={page}
          data={customerAccountList}
          columns={tableColumns} // You need to define the columns for the table
          pageSize={pageSize}
          totalPages={totalPages}
          totalElements={totalElements}
          loading={loading}
          actions={actions}
          title="Customer Account List"
        />
      </div>
    </>
  );
}
