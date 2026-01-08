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
        <div>
          <div className="payback-modal inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
            <div className="bg-white rounded shadow-lg  w-full max-w-xl">
              <div className="flex justify-between items-center mb-4 p-4">
                <h2 className="text-xl font-bold uppercase">Add Floor Form</h2>
                <button onClick={toggleAdd}>
                  <RxCross2 className="w-5 h-5 text-red-500" />
                </button>
              </div>

              <div className="grid grid-cols-12 gap-4 payback-form">
                <div className="flex flex-wrap bg-white">
                  <div className="w-full lg:w-6/12 px-4 mb-3">
                    <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                      Floor No
                    </label>
                    <input
                      type="number"
                      value={floor.floor}
                      onChange={(e) =>
                        setFloor({ ...floor, floor: e.target.value })
                      }
                      className="border rounded px-3 py-2 w-full"
                      placeholder="Enter Floor No"
                    />
                  </div>
                  <div className="w-full lg:w-6/12 px-4 mb-3">
                    <button
                      type="submit"
                      onClick={onClickAddFloor}
                      className="w-full mt-7 ml-4 bg-emerald-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
                    >
                      <FaLayerGroup
                        className="w-5 h-5 inline-block "
                        style={{ paddingBottom: "3px", paddingRight: "7px" }}
                      />
                      Add Floor
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
