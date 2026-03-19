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
  FaEllipsisV,
  FaChevronDown,
} from "react-icons/fa";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
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

  const getPaginationRange = (currentPage, totalPages, delta = 1) => {
    const range = [];
    const rangeWithDots = [];
    let lastPage;

    for (let i = 0; i < totalPages; i++) {
      if (
        i === 0 ||
        i === totalPages - 1 ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    for (const visiblePage of range) {
      if (lastPage !== undefined) {
        if (visiblePage - lastPage === 2) {
          rangeWithDots.push(lastPage + 1);
        } else if (visiblePage - lastPage > 2) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(visiblePage);
      lastPage = visiblePage;
    }

    return rangeWithDots;
  };

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

  const startItem = totalElements === 0 ? 0 : page * pageSize + 1;
  const endItem =
    totalElements === 0 ? 0 : Math.min((page + 1) * pageSize, totalElements);
  const currentPage = totalPages === 0 ? 0 : page + 1;

  return (
    <>
      <DynamicDetailsModal
        isOpen={isModalOpen}
        onClose={toggleModal}
        data={selectedProject}
        title="Project Details"
      />
      <div className="relative flex flex-col min-w-0 break-words bg-white border border-gray-200 w-full mb-6 shadow-lg rounded-12">
        <div className="rounded-t mb-0 px-4 py-3 border-0">
          <div className="flex flex-wrap items-center justify-between max-sm-flex-col max-sm-items-stretch g-2">
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
            <div className="flex flex-wrap items-center justify-end max-sm-flex-col max-sm-items-stretch g-2">
              <button
                onClick={addProject}
                className="bg-emerald-500 text-white text-xs font-bold uppercase px-3 py-1 rounded"
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
                      <Tippy
                        trigger="click"
                        interactive
                        hideOnClick={true}
                        placement="bottom-end"
                        animation="shift-away"
                        duration={[180, 120]}
                        offset={[0, 6]}
                        theme="custom"
                        content={
                          <div className="action-menu-panel">
                            <button
                              type="button"
                              onClick={() => handleClickDetails(project)}
                              className="action-menu-item"
                            >
                              <FaEye className="action-menu-item-icon text-green-600" />
                              <span>View Details</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleClickFloor(project.projectId)}
                              className="action-menu-item"
                            >
                              <FaLayerGroup className="action-menu-item-icon text-blue-500" />
                              <span>View Floors</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleEdit(project.projectId)}
                              className="action-menu-item"
                            >
                              <FaPen className="action-menu-item-icon text-yellow-500" />
                              <span>Edit</span>
                            </button>
                            <button
                              type="button"
                              className="action-menu-item"
                            >
                              <FaTrashAlt className="action-menu-item-icon text-red-500" />
                              <span>Delete</span>
                            </button>
                          </div>
                        }
                      >
                        <button type="button" className="action-trigger-btn">
                          <FaEllipsisV className="action-trigger-icon" />
                          <span>Actions</span>
                          <FaChevronDown className="action-trigger-caret" />
                        </button>
                      </Tippy>
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
            <div className="flex items-center gap-2 table-footer-info">
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

            <div className="text-gray-600 table-footer-summary">
              <span>
                Showing <span className="font-medium">{startItem}</span> -{" "}
                <span className="font-medium">{endItem}</span> of{" "}
                <span className="font-medium">{totalElements}</span> results
              </span>
              <span className="table-footer-page-badge">
                Page {currentPage} / {totalPages}
              </span>
            </div>
          </div>

          {/* Pagination controls */}
          <div className="table-footer-right pagination-shell">
            <button
              onClick={() => setPage(0)}
              disabled={page === 0}
              className="pagination-nav-btn"
              title="First"
            >
              <FaAngleDoubleLeft />
            </button>
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 0}
              className="pagination-nav-btn"
              title="Previous"
            >
              <FaAngleLeft />
            </button>

            {getPaginationRange(page, totalPages).map((item, idx) =>
              item === "..." ? (
                <span key={idx} className="pagination-dots">
                  ...
                </span>
              ) : (
                <button
                  key={idx}
                  onClick={() => setPage(item)}
                  className={`pagination-page-btn ${
                    item === page ? "is-active" : ""
                  }`}
                >
                  {item + 1}
                </button>
              )
            )}

            <button
              onClick={() => setPage(page + 1)}
              disabled={page + 1 >= totalPages}
              className="pagination-nav-btn"
              title="Next"
            >
              <FaAngleRight />
            </button>
            <button
              onClick={() => setPage(totalPages - 1)}
              disabled={page + 1 >= totalPages}
              className="pagination-nav-btn"
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
