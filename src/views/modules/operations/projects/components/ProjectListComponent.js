import React, { useContext, useEffect, useState } from "react";
import httpService from "../../../../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import {
  FaEye,
  FaEdit,
  FaTrash,
  FaAngleDoubleLeft,
  FaAngleLeft,
  FaAngleRight,
  FaAngleDoubleRight,
  FaPen,
  FaTrashAlt,
  FaLayerGroup,
} from "react-icons/fa";
import "../../../../../assets/styles/projects/project.css";
import "../../../../../assets/styles/responsive.css";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min.js";
import DynamicDetailsModal from "components/CustomerComponents/DynamicModal.js";
import { RxReload } from "react-icons/rx";
import { BsBuildingFillAdd } from "react-icons/bs";
import { IoArrowBackOutline } from "react-icons/io5";

export default function ProjectListComponent() {
  const history = useHistory();

  const [projects, setProjects] = useState([]);
  const { loading, setLoading, notifyError, backdrop, setBackdrop } =
    useContext(MainContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [selectedProject, setSelectedProject] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

  const fetchProjects = async () => {
    const organization =
      JSON.parse(localStorage.getItem("organization")) || null;
    setLoading(true);
    try {
      const requestBody = {
        organizationId: organization.organizationId,
        page,
        size: pageSize,
        sortBy: "createdDate",
        sortDir: "desc",
      };

      const res = await httpService.post(
        "/project/getByOrganization",
        requestBody
      );

      setProjects(res.data.content || []);
      setTotalPages(res.data.totalPages || 0);
      setTotalElements(res.data.totalElements || 0);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setPage(0);
  };

  const handleClickFloor = (projectId) => {
    if (!projectId) {
      return notifyError("Invalid Project!", 4000);
    }
    history.push(`/dashboard/floor/${projectId}`);
  };

  const handleClickDetails = (project) => {
    const formattedProject = {
      "Project Details": {
        "Project ID": project.projectId,
        "Project Name": project.name,
        "Project Type": project.projectType,
        Description: project.information,
        Address: project.address,
        "Number of Floors": project.floors,
        "Organization ID": project.organizationId,
        Active: project.active,
      },
      "Financial Details": {
        "Purchasing Amount": project.purchasingAmount,
        "Registration Amount": project.registrationAmount,
        "Additional Amount": project.additionalAmount,
        "Construction Amount": project.constructionAmount,
        "Total Amount": project.totalAmount,
      },
      "Duration Details": {
        "Month Duration": project.monthDuration,
      },
      "Audit Info": {
        "Created By": project.createdBy,
        "Updated By": project.updatedBy,
        "Created Date": project.createdDate,
        "Updated Date": project.updatedDate,
      },
    };
    setSelectedProject(formattedProject);
    toggleModal();
  };

  const handleEdit = (projectId) => {
    if (!projectId) {
      notifyError("Invalid Project!", 4000);
    }
    history.push(`/dashboard/update-project/${projectId}`);
  };

  const handleDelete = (projectId) => {
    // if (confirm("Are you sure you want to delete this project?")) {
    //   console.log("Delete Project:", projectId);
    //   // You can add delete API call here
    // }
  };

  useEffect(() => {
    fetchProjects();
  }, [page, pageSize]);

  const toggleModal = () => {
    setBackdrop(!backdrop);
    setIsModalOpen(!isModalOpen);
  };

  const addProject = () => {
    history.push("/dashboard/add-project");
  };

  return (
    <>
      <DynamicDetailsModal
        isOpen={isModalOpen}
        onClose={toggleModal}
        data={selectedProject}
        title="Project Details"
      />
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-12">
        <div className="rounded-t mb-0 px-4 py-3 border-0">
          <div className="flex flex-wrap items-center justify-between">
            <h3 className="font-semibold text-base text-blueGray-700">
              <span>
                <button className="">
                  <IoArrowBackOutline
                    onClick={() => history.goBack()}
                    className="back-button-icon inline-block back-button"
                    style={{ paddingBottom: "3px", paddingRight: "7px" }}
                  />
                </button>
              </span>
              Project List
            </h3>
            <div className="flex flex-wrap items-center justify-end">
              <button
                onClick={addProject}
                className="bg-emerald-500 text-white text-xs font-bold uppercase mr-4 px-3 py-1 rounded"
              >
                <BsBuildingFillAdd
                  className="w-5 h-5 inline-block "
                  style={{ paddingBottom: "3px", paddingRight: "5px" }}
                />
                Add Project
              </button>
              <button
                onClick={fetchProjects}
                className="bg-indigo-500 text-white text-xs font-bold uppercase px-3 py-1 rounded"
              >
                <RxReload
                  className="w-5 h-5 inline-block"
                  style={{ paddingBottom: "3px", paddingRight: "5px" }}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="block w-full overflow-x-auto min-half-screen">
          <table className="items-center w-full bg-transparent border-collapse">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-left">
                  S.No
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-left">
                  Name
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-left">
                  Address
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-left">
                  Apartment Type
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-left">
                  Floors
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-left">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-xs font-semibold text-left">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    Loading...
                  </td>
                </tr>
              ) : projects.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    No projects found.
                  </td>
                </tr>
              ) : (
                projects.map((project, index) => (
                  <tr
                    key={project.projectId}
                    className={`${
                      index % 2 === 0 ? "bg-gray-50" : "bg-white"
                    } transition-colors  project-table-rows `}
                  >
                    <td className="px-6 py-4">{index + 1}</td>
                    <td className="px-6 py-4">{project.name}</td>
                    <td className="px-6 py-4">{project.address}</td>
                    <td className="px-6 py-4">{project.projectType}</td>
                    <td className="px-6 py-4">{project.floors}</td>
                    <td className="px-6 py-4">{project.totalAmount}</td>
                    <td className="px-6 py-4">
                      <div className="flex gap-4 items-center">
                        <button
                          className="text-green-600 hover:shadow-md transition-shadow shadow-hover hover:text-blue-700 transition-colors duration-150"
                          title="View Details"
                          onClick={() => handleClickDetails(project)}
                        >
                          <FaEye />
                        </button>
                        <button
                          className="grey hover:shadow-md transition-shadow shadow-hover hover:text-blue-700 transition-colors duration-150"
                          title="View Floor"
                          onClick={() => handleClickFloor(project.projectId)}
                        >
                          <FaLayerGroup
                            className="w-5 h-5 inline-block"
                            style={{
                              paddingBottom: "3px",
                              paddingRight: "7px",
                            }}
                          />
                        </button>
                        <button
                          className=" blue hover:shadow-md transition-shadow text-yellow-500 hover:text-yellow-600 transition-colors duration-150"
                          title="Edit"
                          onClick={() => handleEdit(project.projectId)}
                        >
                          <FaPen />
                        </button>
                        <button
                          className=" red hover:shadow-md transition-shadow text-red-500 hover:text-red-600 transition-colors duration-150"
                          title="Delete"
                        >
                          <FaTrashAlt />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="table-footer px-6 py-4 text-xs">
          {/* Left side - Page size selector & info */}
          <div className="table-footer-left">
            <div className="flex items-center gap-2">
              <label className="text-gray-600">Show</label>
              <select
                value={pageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="px-2 py-1 text-sm border border-gray-300 rounded bg-white text-gray-700 pagesize-selector ml-2"
              >
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>

            <div className="text-gray-600">
              Showing <span className="font-medium">{page * pageSize + 1}</span> –{" "}
              <span className="font-medium">
                {Math.min((page + 1) * pageSize, totalElements)}
              </span>{" "}
              of <span className="font-medium">{totalElements}</span> results
            </div>
          </div>

          {/* Pagination controls */}
          <div className="table-footer-right">
            <button
              onClick={() => setPage(0)}
              disabled={page === 0}
              className="p-2 rounded bg-gray-200 disabled:opacity-50"
              title="First"
            >
              <FaAngleDoubleLeft />
            </button>
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
              className="p-2 rounded bg-gray-200 disabled:opacity-50"
              title="Previous"
            >
              <FaAngleLeft />
            </button>

            {[...Array(totalPages)].map((_, idx) => (
              <button
                key={idx}
                onClick={() => setPage(idx)}
                className={`px-3 py-1 text-sm font-medium rounded-full ${
                  idx === page
                    ? "bg-indigo-500 text-white border-indigo-500"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-transparent"
                }`}
              >
                {idx + 1}
              </button>
            ))}

            <button
              onClick={() => setPage(page + 1)}
              disabled={page + 1 >= totalPages}
              className="p-2 rounded bg-gray-200 disabled:opacity-50"
              title="Next"
            >
              <FaAngleRight />
            </button>
            <button
              onClick={() => setPage(totalPages - 1)}
              disabled={page + 1 >= totalPages}
              className="p-2 rounded bg-gray-200 disabled:opacity-50"
              title="Last"
            >
              <FaAngleDoubleRight />
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
