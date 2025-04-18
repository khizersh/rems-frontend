import React, { useContext, useEffect, useState } from "react";
import httpService from "../../../utility/httpService.js";
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
} from "react-icons/fa";
import "../../../assets/styles/projects/project.css";

export default function ProjectListComponent() {
  const [projects, setProjects] = useState([]);
  const { loading, setLoading, notifySuccess, notifyError, notifyWarning } =
    useContext(MainContext);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [size, setSize] = useState(0);

  const pageSize = 10;
  const organizationId = 1;

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const requestBody = {
        organizationId,
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
      setTotalPages(res.data.totalPages || 0); // <-- this is crucial
      setTotalElements(res.data.totalElements || 0); // <-- this is crucial
      setSize(res.data.size || 0); // <-- this is crucial
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (projectId) => {
    console.log("View Project:", projectId);
    // You can use a router.push or modal
  };

  const handleEdit = (projectId) => {
    console.log("Edit Project:", projectId);
    // Redirect to edit page or open modal
  };

  const handleDelete = (projectId) => {
    // if (confirm("Are you sure you want to delete this project?")) {
    //   console.log("Delete Project:", projectId);
    //   // You can add delete API call here
    // }
  };

  useEffect(() => {
    fetchProjects();
  }, [page]);

  const handleNextPage = () => {
    if (page + 1 < totalPages) setPage(page + 1);
  };

  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
        <div className="rounded-t mb-0 px-4 py-3 border-0">
          <div className="flex flex-wrap items-center justify-between">
            <h3 className="font-semibold text-base text-blueGray-700">
              Project List
            </h3>
            <button
              onClick={fetchProjects}
              className="bg-indigo-500 text-white text-xs font-bold uppercase px-3 py-1 rounded"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="block w-full overflow-x-auto">
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
                          className="green hover:shadow-md transition-shadow shadow-hover hover:text-blue-700 transition-colors duration-150"
                          title="View"
                        >
                          <FaEye />
                        </button>
                        <button
                          className=" blue hover:shadow-md transition-shadow text-yellow-500 hover:text-yellow-600 transition-colors duration-150"
                          title="Edit"
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
        <div className="flex items-center justify-between px-6 py-4 text-sm">
          {/* Left side: Page info */}
          <div className="text-gray-600">
            Showing <span className="font-medium">{page * size + 1}</span> –{" "}
            <span className="font-medium">
              {Math.min((page + 1) * size, totalElements)}
            </span>{" "}
            of <span className="font-medium">{totalElements}</span> results
          </div>

          {/* Right side: Pagination controls */}
          <div className="flex gap-2">
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
                className={`px-3 py-1 text-sm font-medium rounded-full  ${
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
