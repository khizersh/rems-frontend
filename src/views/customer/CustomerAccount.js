import React, { useEffect, useState, useContext, useRef } from "react";
import httpService from "../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../components/table/DynamicTableComponent.js";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min.js";
import { FaEye, FaPen, FaTrashAlt } from "react-icons/fa";
import DynamicDetailsModal from "components/CustomerComponents/DynamicModal.js";
import { MdOutlinePayments } from "react-icons/md";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min.js";

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

      console.log("responseArray :: ",responseArray);
      
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

      console.log("response?.data?.content :: ",response?.data?.content);
      

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
    if (projectId) {
      setFilteredId(projectId);
      setFilteredBy("project");
      setFilterProject(projectId);
      fetchFloors(projectId);
    }
  };

  const changeSelectedFloor = (floorId) => {
    if (floorId) {
      setFilteredId(floorId);
      setFilteredBy("floor");
      setFilterFloor(floorId);
    }
  };

  const tableColumns = [
    { header: "Customer Name", field: "customer.name" },
    { header: "Project Name", field: "project.name" },
    { header: "Unit Serial No", field: "unit.serialNo" },
    { header: "Floor No", field: "unit.floorNo" },
    { header: "Payment Type", field: "unit.paymentPlanType" },
    { header: "Customer Amount", field: "totalAmount" },
  ];

  const handleViewDetails = async (account) => {
    try {
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
            "Total Amount": account.totalAmount,
          },

          "Payment Breakdown": {
            "Down Payment": account.downPayment,
            "Quarterly Payment": account.quarterlyPayment,
            "Half Yearly": account.halfYearly,
            Yearly: account.yearly,
            "On Possession Amount": account.onPosessionAmount,
          },
          "Monthly Payments": monthWisePaymentList,
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

  return (
    <>
      <DynamicDetailsModal
        isOpen={isModalOpen}
        onClose={toggleModal}
        data={selectedCustomerAccount}
        title="Customer Account Details"
      />
      <div className="container mx-auto p-4">
        <div className="w-full">
          <div className="flex flex-wrap py-3 md:justify-content-between">
            <div className=" bg-white shadow-lg p-5 rounded-12 lg:w-4/12 md:w-6/12 sm:w-12/12">
              <label className="block text-sm font-medium mb-1">
                Select Project
              </label>
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

            <div className=" bg-white shadow-lg p-5 mx-4 rounded-12 lg:w-4/12 md:w-6/12 sm:w-12/12 md:mx-0 sm:mt-5">
              <label className="block text-sm font-medium mb-1">
                Select Floor
              </label>
              <select
                value={filterFloor}
                onChange={(e) => changeSelectedFloor(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full"
              >
                <option value="">All Floors</option>
                {floorOptions.map((floor) => (
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
