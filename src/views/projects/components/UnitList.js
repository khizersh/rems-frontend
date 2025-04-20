import React, { useEffect, useState, useContext } from "react";
import httpService from "../../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../../components/table/DynamicTableComponent.js";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min.js";

export default function UnitList() {
  const { loading, setLoading, notifyError } = useContext(MainContext);
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
    { header: "Created By", field: "createdBy" },
    { header: "Updated By", field: "updatedBy" },
    { header: "Created Date", field: "createdDate" },
    { header: "Updated Date", field: "updatedDate" },
  ];

  const handleView = (floor) => {
    if (!floorId) {
      return notifyError("Invalid Project!", 4000);
    }
    history.push(`/dashboard/unit/${floorId}`);
  };

  const handleEdit = (floor) => {
    console.log("Edit Floor:", floor);
    // Implement edit functionality
  };

  const handleDelete = (floor) => {
    console.log("Delete Floor:", floor);
    // Implement delete logic
  };

  const actions = {
    onView: handleView,
    onEdit: handleEdit,
    onDelete: handleDelete,
  };

  return (
    <div className="container mx-auto p-4">
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
