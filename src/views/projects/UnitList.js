import React, { useEffect, useState, useContext } from "react";
import httpService from "../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../components/table/DynamicTableComponent.js";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min.js";
import { FaEye, FaPen, FaTrashAlt } from "react-icons/fa";
import DynamicDetailsModal from "components/CustomerComponents/DynamicModal.js";

export default function UnitList() {
  const { loading, setLoading, notifyError, backdrop, setBackdrop } =
    useContext(MainContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const { floorId } = useParams();
  const history = useHistory();

  const [units, setUnits] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const fetchUnitList = async () => {
    setLoading(true);
    try {
      const requestBody = {
        floorId,
        page,
        size: pageSize,
        sortBy: "id",
        sortDir: "asc",
      };

      const response = await httpService.post(
        `/unit/getByFloorId`,
        requestBody
      );

      setUnits(response?.data?.content || []);
      setTotalPages(response?.data?.totalPages || 0);
      setTotalElements(response?.data?.totalElements || 0);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnitList();
  }, [page]);

  const tableColumns = [
    { header: "Serial No", field: "serialNo" },
    { header: "Square Yards", field: "squareYards" },
    { header: "Room Count", field: "roomCount" },
    { header: "Bathroom Count", field: "bathroomCount" },
    { header: "Amount", field: "amount" },
    { header: "Additional Amount", field: "additionalAmount" },
    { header: "Unit Type", field: "unitType" },
    { header: "Floor Number", field: "floorNo" },
    { header: "Project Name", field: "projectName" },
  ];

  const handleView = (data) => {
    console.log("unit :: ", data);

    const formattedUnitDetails = {
      "Unit Details": {
        "Serial No": data?.serialNo,
        "Square Yards": data?.squareYards,
        "Room Count": data?.roomCount,
        "Bathroom Count": data?.bathroomCount,
        Amount: data?.amount,
        "Additional Amount": data?.additionalAmount,
        "Total Amount": Number(data?.amount) + Number(data?.additionalAmount),
        "Unit Type": data?.unitType,
        "Floor No": data?.floorNo,
        "Project Name": data?.projectName,
        Booked: data?.booked ? "Yes" : "No",
      },
      "Audit Info": {
        "Created By": data?.createdBy,
        "Created Date": data?.createdDate,
        "Updated By": data?.updatedBy,
        "Updated Date": data?.updatedDate,
      },
    };
    setSelectedUnit(formattedUnitDetails);
    toggleModal()
  };

  const handleEdit = (floor) => {
    console.log("Edit Floor:", floor);
    // Implement edit functionality
  };

  const handleDelete = (floor) => {
    console.log("Delete Floor:", floor);
    // Implement delete logic
  };

  const actions = [
    {
      icon: FaEye,
      onClick: handleView,
      title: "Customer Detail",
      className: "text-green-600",
    },
    { icon: FaPen, onClick: handleEdit, title: "Edit", className: "yellow" },
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
    <div className="container mx-auto p-4">
      <DynamicDetailsModal
        isOpen={isModalOpen}
        onClose={toggleModal}
        data={selectedUnit}
        title="Customer Details"
      />
      <DynamicTableComponent
        fetchDataFunction={fetchUnitList}
        setPage={setPage}
        page={page}
        data={units}
        columns={tableColumns}
        pageSize={pageSize}
        totalPages={totalPages}
        totalElements={totalElements}
        loading={loading}
        title="Unit Details"
        actions={actions}
      />
    </div>
  );
}
