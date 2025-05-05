import React, { useEffect, useState, useContext } from "react";
import httpService from "../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../components/table/DynamicTableComponent.js";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min.js";

export default function FloorList() {
  const { loading, setLoading, notifyError } = useContext(MainContext);
  const { projectId } = useParams();
  const history = useHistory();

  const [floors, setFloors] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const fetchProjectDetails = async () => {
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
    fetchProjectDetails();
  }, [page]);

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
        fetchDataFunction={fetchProjectDetails}
        setPage={setPage}
        page={page}
        data={floors}
        columns={tableColumns}
        pageSize={pageSize}
        totalPages={totalPages}
        totalElements={totalElements}
        loading={loading}
        title="Floor Details"
        actions={actions}
      />
    </div>
  );
}
