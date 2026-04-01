import React, { useEffect, useState, useContext } from "react";
import httpService from "../../../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../../../components/table/DynamicTableComponent.js";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min.js";
import { FaEye, FaLayerGroup, FaPen, FaTrashAlt } from "react-icons/fa";
import DynamicDetailsModal from "components/CustomerComponents/DynamicModal.js";
import { HiMiniBuildingStorefront } from "react-icons/hi2";
import { RxCross2 } from "react-icons/rx";

export default function FloorList() {
  const {
    loading,
    setLoading,
    notifyError,
    notifySuccess,
    backdrop,
    setBackdrop,
    isSidebarCollapsed,
  } = useContext(MainContext);
  const { projectId } = useParams();
  const history = useHistory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [floors, setFloors] = useState([]);
  const [selectedFloor, setSelectedFloor] = useState(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [addFloorModal, setAddFloorModal] = useState(false);
  const [floor, setFloor] = useState({
    projectId: projectId,
    floor: 0,
  });

  const fetchFloorList = async () => {
    setLoading(true);
    try {
      const requestBody = {
        projectId,
        page,
        size: pageSize,
        sortBy: "floor",
        sortDir: "asc",
      };

      const response = await httpService.post(
        `/floor/getByProjectId`,
        requestBody
      );

      setFloors(response?.data?.content || []);
      setTotalPages(response?.data?.totalPages || 0);
      setTotalElements(response?.data?.totalElements || 0);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFloorList();
  }, [page, pageSize]);

  const tableColumns = [
    { header: "Project Name", field: "projectName" },
    { header: "Floor Number", field: "floor" },
    { header: "Unit Count", field: "unitCount" },
    { header: "Created By", field: "createdBy" },
    { header: "Updated By", field: "updatedBy" },
  ];

  const handleView = (floor) => {
    if (!floor) {
      return notifyError("Invalid Project!", 4000);
    }
    history.push(`/dashboard/unit/${floor.id}`);
  };
  const handleViewFloor = (floor) => {
    const transformedData = {
      "Unit Info": {
        Floor: floor.floor,
        "Project Name": floor.projectName,
        "Unit Count": floor.unitCount,
      },
      "Audit Info": {
        "Created By": floor.createdBy,
        "Updated By": floor.updatedBy,
        "Created Date": floor.createdDate,
        "Updated Date": floor.updatedDate,
      },
    };
    setSelectedFloor(transformedData);
    toggleModal();
  };

  const handleEdit = (floor) => {
    console.log("Edit Floor:", floor);
    // Implement edit functionality
  };

  const handleDelete = async (floor) => {
    console.log("Delete Floor:", floor);
    const confirmed = window.confirm("Are you sure you want to this Floor?");
    if (!confirmed) return;

    setLoading(true);
    try {
      const response = await httpService.get(`/floor/deleteById/${floor.id}`);
      let updatedFloors = [...floors];
      updatedFloors = updatedFloors.filter((m) => m.id != floor.id); // make a shallow copy
      setFloors(updatedFloors); // update the state
      notifySuccess(response.responseMessage, 4000);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const actions = [
    {
      icon: FaEye,
      onClick: handleViewFloor,
      title: "View Detail",
      className: "text-green-600",
    },
    {
      icon: HiMiniBuildingStorefront,
      onClick: handleView,
      title: "View Units",
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
  const toggleAdd = () => {
    setBackdrop(!backdrop);
    setAddFloorModal(!addFloorModal);
  };

  const onClickAddFloor = async () => {
    console.log("floor : ", floor);

    setLoading(true);
    try {
      const response = await httpService.post(`/floor/addorUpdateFloor`, floor);
      await fetchFloorList();
      notifySuccess(response.responseMessage, 4000);
      toggleAdd();
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      {addFloorModal ? (
        <div
          className={`fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/30 px-4 py-6 ${
            isSidebarCollapsed ? "md:ml-20" : "md:ml-64"
          }`}
        >
          <div className="w-full max-w-xl overflow-hidden rounded-xl border border-gray-200 bg-white shadow-lg">
            <div className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
              <h2 className="text-blueGray-700 text-lg font-bold uppercase">
                Add Floor
              </h2>
              <button
                onClick={toggleAdd}
                type="button"
                className="text-gray-500 transition-colors hover:text-red-500"
              >
                <RxCross2 className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                onClickAddFloor();
              }}
              className="p-6"
            >
              <div className="mb-4 rounded-lg border border-gray-200 bg-gray-50 p-4">
                <h3 className="mb-4 border-b border-gray-200 pb-2 text-sm font-bold text-gray-700">
                  Floor Information
                </h3>

                <div className="w-full">
                  <label className="mb-1 block text-xs font-medium text-gray-700">
                    Floor No
                  </label>
                  <input
                    type="number"
                    value={floor.floor}
                    onChange={(e) => setFloor({ ...floor, floor: e.target.value })}
                    className="w-full rounded-lg border border-gray-300 p-2 text-sm"
                    placeholder="Enter Floor No"
                  />
                </div>
              </div>

              <div className="mt-6 flex justify-end border-t border-gray-200 pt-4">
                <button
                  type="button"
                  onClick={toggleAdd}
                  className="mr-3 inline-flex items-center rounded bg-gray-100 px-5 py-2 text-xs font-bold uppercase text-gray-700 shadow-sm transition-all hover:bg-gray-200 hover:shadow-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex items-center rounded bg-lightBlue-500 px-5 py-2 text-xs font-bold uppercase text-white shadow-sm outline-none transition-all duration-150 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <FaLayerGroup
                    className="mr-1 inline-block h-4 w-4"
                    style={{ paddingBottom: "1px" }}
                  />
                  {loading ? "Saving..." : "Add Floor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <></>
      )}

      <DynamicDetailsModal
        isOpen={isModalOpen}
        onClose={toggleModal}
        data={selectedFloor}
        title="Customer Details"
      />
      <DynamicTableComponent
        fetchDataFunction={fetchFloorList}
        setPage={setPage}
        setPageSize={setPageSize}
        page={page}
        data={floors}
        columns={tableColumns}
        pageSize={pageSize}
        totalPages={totalPages}
        totalElements={totalElements}
        loading={loading}
        title="Floor Details"
        actions={actions}
        firstButton={{
          title: "Add Floor",
          onClick: toggleAdd,
          icon: FaLayerGroup,
          className: "bg-emerald-500",
        }}
      />
    </div>
  );
}
