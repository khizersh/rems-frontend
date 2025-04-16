import React, { useEffect, useState, useContext } from "react";
import httpService from "../../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../../components/table/DynamicTableComponent.js"; // Make sure to import the DynamicTableComponent
import { FaEye, FaPen, FaTrashAlt } from "react-icons/fa";
import { useParams } from "react-router-dom"; // Assuming you're using React Router to handle dynamic routes

export default function ProjectDetail() {
  const { loading, setLoading, notifyError } = useContext(MainContext);
  const { projectId } = useParams(); // Assuming you use projectId in URL params
  const [project, setProject] = useState(null);

  // Fetch project details based on the projectId
  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const response = await httpService.get(`/project/${projectId}`);
      setProject(response.data);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!project) {
    return <div>Project not found.</div>;
  }

  // Assuming floorList is part of the project details
  const { floorList = [] } = project;

  const tableColumns = [
    { header: "Floor Number", field: "floorNumber" },
    { header: "Units", field: "units" },
    { header: "Total Area", field: "totalArea" },
    { header: "Construction Status", field: "status" },
    // Add any other columns you want to display for the floors
  ];

  const handleView = (floor) => {
    console.log("View Floor:", floor);
    // Add logic to show floor details in a modal or navigate to a detailed view page
  };

  const handleEdit = (floor) => {
    console.log("Edit Floor:", floor);
    // Add logic to redirect to an edit page or open an edit modal
  };

  const handleDelete = (floor) => {
    console.log("Delete Floor:", floor);
    // Add delete logic here
  };

  // Actions for each row
  const actions = [
    {
      name: "View",
      type: "view",
      icon: <FaEye />,
      handler: handleView,
    },
    {
      name: "Edit",
      type: "edit",
      icon: <FaPen />,
      handler: handleEdit,
    },
    {
      name: "Delete",
      type: "delete",
      icon: <FaTrashAlt />,
      handler: handleDelete,
    },
  ];

  return (
    <div className="container mx-auto p-4">
      <h2 className="text-xl font-semibold mb-4">{project.name} Details</h2>

      {/* Render dynamic table for floorList with actions */}
      <DynamicTableComponent
        data={floorList}
        columns={tableColumns}
        title="Floor Details"
        actions={actions}
      />
    </div>
  );
}
