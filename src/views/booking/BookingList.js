import React, { useEffect, useState, useContext } from "react";
import httpService from "../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../components/table/DynamicTableComponent.js";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min.js";

export default function BookingList() {
  const { loading, setLoading, notifyError } = useContext(MainContext);
  const history = useHistory();

  const [bookingList, setBookingList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [filterProject, setFilterProject] = useState("");
  const [filterFloor, setFilterFloor] = useState("");
  const [fileteredId, setFileteredId] = useState("");
  const [filteredBy, setFilteredBy] = useState("organization");
  const [floorOptions, setFloorOptions] = useState([]);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    console.log("reload ....");
    
    fetchBookingList();
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

  const fetchBookingList = async () => {
    setLoading(true);
    try {
      const requestBody = {
        id: fileteredId,
        filteredBy: filteredBy,
        page,
        size: pageSize,
        sortBy: "id",
        sortDir: "desc",
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

      console.log("requestBody :: ", requestBody);

      const response = await httpService.post(`/booking/getByIds`, requestBody);

      setBookingList(response?.data?.content || []);
      setTotalPages(response?.data?.totalPages || 0);
      setTotalElements(response?.data?.totalElements || 0);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const changeSelectedProjected = (projectId) => {
    console.log("projectId :: ", projectId);

    if (projectId) {
      setFileteredId(projectId);
      setFilteredBy("project");
      setFilterProject(projectId);
      fetchFloors(projectId);
    } else {
      setFileteredId("");
      setFilterProject("");
    }
  };

  const changeSelectedFloor = (floorId) => {
    if (floorId) {
      setFileteredId(floorId);
      setFilteredBy("floor");
      setFilterFloor(floorId);
    } else {
      setFileteredId(filterProject);
      setFilteredBy("project");
      setFilterFloor("")
      setFilterProject(Number(filterProject)  + Number(0));
    }
  };
  const tableColumns = [
    { header: "Customer Name", field: "customerName" },
    { header: "Unit Serial", field: "unitSerial" },
    { header: "Project", field: "project" },
    { header: "Floor No", field: "floorNo" },
    { header: "Total Amount", field: "totalAmount" },
    { header: "Created By", field: "createdBy" },
    { header: "Updated By", field: "updatedBy" },
    { header: "Created Date", field: "createdDate" },
    { header: "Updated Date", field: "updatedDate" },
  ];

  const handleView = (floor) => {
    if (!floor) {
      return notifyError("Invalid Project!", 4000);
    }
    history.push(`/dashboard/unit/${floor.id}`);
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
        <div className="relative flex flex-row min-w-0  w-full mb-6 ">
          <div className="flex flex-nowrap gap-4">
            <div className="bg-white shadow-lg p-5 rounded width-250p">
              <label className="block text-sm font-medium mb-1 w-full">Project</label>
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

            <div className="bg-white shadow-lg p-5 rounded width-250p">
              <label className="block text-sm font-medium mb-1">Floor</label>
              <select
                value={filterFloor}
                onChange={(e) => changeSelectedFloor(e.target.value)}
                className="border rounded px-3 py-2 w-full"
              >
                <option value="">All Floors</option>
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
          fetchDataFunction={fetchBookingList}
          setPage={setPage}
          page={page}
          data={bookingList}
          columns={tableColumns}
          pageSize={pageSize}
          totalPages={totalPages}
          totalElements={totalElements}
          loading={loading}
          title="Booking List"
          actions={actions}
        />
      </div>
    </>
  );
}
