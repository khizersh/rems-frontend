import React, { useEffect, useState, useContext } from "react";
import httpService from "../../../../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../../../../components/table/DynamicTableComponent.js";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min.js";
import { FaDownload } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { FaEye, FaLayerGroup, FaPen, FaTrashAlt } from "react-icons/fa";
import { EXPENSE_TYPE_ID } from "utility/Utility.js";

export default function AccountGroupList() {
  const {
    loading,
    setLoading,
    notifyError,
    notifySuccess,
    backdrop,
    setBackdrop,
  } = useContext(MainContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [accountGroup, setAccountGroup] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const history = useHistory();

  const fetchAccountGroup = async () => {
    setLoading(true);
    try {
      const organization =
        JSON.parse(localStorage.getItem("organization")) || null;

      const response = await httpService.get(
        `/accounting/${organization.organizationId}/getAccountGroups?accountType=${EXPENSE_TYPE_ID}`
      );

      setAccountGroup(response?.data?.data || []);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccountGroup();
  }, []);

  const tableColumns = [
    { header: "Expense Group", field: "name" },
    { header: "Created Date", field: "createdDate" },
  ];

  const handleEdit = ({ id }) => {
    history.push(`/dashboard/update-expense-group/${id}`)
  };

  const handleDelete = () => {
    // Implement delete logic
  };

  const handleView = ({id}) => {
    history.push(`/dashboard/expense-group-detail/${id}`)
  };

  const actions = [
    {
      icon: FaEye,
      onClick: handleView,
      title: "View Detail",
      className: "text-green-600",
    },
    {
      icon: FaPen,
      onClick: handleEdit,
      title: "Edit",
      className: "yellow"
    },
    {
      icon: FaTrashAlt,
      onClick: handleDelete,
      title: "Delete",
      className: "text-red-600",
    },
  ];

  const addClick = () => {
    history.push("/dashboard/expense-group-add");
  };

  return (
    <>
      <div>
        <DynamicTableComponent
          fetchDataFunction={fetchAccountGroup}
          setPage={setPage}
          page={page}
          data={accountGroup}
          columns={tableColumns}
          pageSize={pageSize}
          totalPages={totalPages}
          totalElements={totalElements}
          loading={loading}
          title="Expense Group"
          actions={actions}
          firstButton={{
            title: "Add Expense Group",
            onClick: addClick,
            icon: FaLayerGroup,
            className: "bg-emerald-500",
          }}
        />
      </div>
    </>
  );
}
