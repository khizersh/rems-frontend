import React, { useEffect, useState, useContext } from "react";
import httpService from "../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../components/table/DynamicTableComponent.js";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min.js";

export default function CustomerAccount() {
  const { loading, setLoading, notifyError } = useContext(MainContext);
  const history = useHistory();

  const [floors, setFloors] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filterProject, setFilterProject] = useState(""); // For filtering by project
  const [filterFloor, setFilterFloor] = useState(""); // For filtering by floor
  const [filteredId, setFilteredId] = useState(""); // The ID of the selected project or floor
  const [filteredBy, setFilteredBy] = useState("organization"); // Keep track of whether we're filtering by project or floor
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [floorOptions, setFloorOptions] = useState([]);
  const [customerAccountList, setCustomerAccountList] = useState([]);
  const pageSize = 10;

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchCustomerDetails();
  }, [page, filteredId, filteredBy]);

  const fetchProjects = async () => {
    try {
      const organization =
        JSON.parse(localStorage.getItem("organization")) || null;
      if (organization) {
        const response = await httpService.get(
          `/project/getAllProjectByOrg/${organization.organizationId}`
        );
        console.log("response :: ", response);

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

      console.log("requestBody :: ", requestBody);

      const response = await httpService.post(
        "/customerAccount/getByIds",
        requestBody
      );

      console.log("response :: ", response);
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
    { header: "Country", field: "customer.country" },
    { header: "City", field: "customer.city" },
    { header: "Address", field: "customer.address" },
    { header: "National ID", field: "customer.nationalId" },
    { header: "Next of Kin Name", field: "customer.nextOFKinName" },
    {
      header: "Next of Kin National ID",
      field: "customer.nextOFKinNationalId",
    },
    { header: "Relationship with Kin", field: "customer.relationShipWithKin" },
    { header: "Organization ID", field: "customer.organizationId" },
    { header: "Project Name", field: "project.name" },
    { header: "Project Address", field: "project.address" },
    { header: "Project Type", field: "project.projectType" },
    { header: "Unit Serial No", field: "unit.serialNo" },
    { header: "Floor No", field: "unit.floorNo" },
    { header: "Unit Amount", field: "unit.amount" },
    { header: "Payment Schedule Duration", field: "durationInMonths" },
    { header: "Total Amount", field: "totalAmount" },
    { header: "Quarterly Payment", field: "quarterlyPayment" },
    { header: "Half Yearly Payment", field: "halfYearly" },
    { header: "Down Payment", field: "downPayment" },
    { header: "On Possession Amount", field: "onPosessionAmount" },
    { header: "Created By", field: "createdBy" },
    { header: "Updated By", field: "updatedBy" },
    { header: "Created Date", field: "createdDate" },
    { header: "Updated Date", field: "updatedDate" },
  ];

  const handleView = (account) => {
    if (!account) {
      return notifyError("Invalid Account!", 4000);
    }
    console.log("account :: ",account);
    let cName = account?.customer?.name;
    history.push(`/dashboard/customer-payment/${account.id}?cName=${cName}`);
  };

  const handleEdit = (floor) => {
    console.log("Edit Floor:", floor);
  };

  const handleDelete = (floor) => {
    console.log("Delete Floor:", floor);
  };

  const actions = {
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
  };

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="relative flex flex-row min-w-0 bg-white w-full mb-6 shadow-lg rounded p-4">
          <div className="flex flex-nowrap gap-4">
            <div className="w-50">
              <label className="block text-sm font-medium mb-1">Project</label>
              <select
                value={filterProject}
                onChange={(e) => changeSelectedProjected(e.target.value)}
                className="border rounded px-3 py-2"
              >
                <option value="">All Projects</option>
                {projects.map((project) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Floor</label>
              <select
                value={filterFloor}
                onChange={(e) => changeSelectedFloor(e.target.value)}
                className="border rounded px-3 py-2"
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
          title="Customer List"
        />
      </div>
    </>
  );
}
