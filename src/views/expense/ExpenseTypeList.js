import React, { useEffect, useState, useContext } from "react";
import httpService from "../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../components/table/DynamicTableComponent.js";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min.js";
import { FaDownload } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { FaLayerGroup, FaPen, FaTrashAlt } from "react-icons/fa";

export default function ExpenseTypeList() {
  const {
    loading,
    setLoading,
    notifyError,
    notifySuccess,
    backdrop,
    setBackdrop,
  } = useContext(MainContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseTypeList, setExpenseTypeList] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const history = useHistory();

  const fetchExpenseTypeList = async () => {
    setLoading(true);
    try {
      const organization =
        JSON.parse(localStorage.getItem("organization")) || null;
      const response = await httpService.get(
        `/expense/getAllExpenseTypeByOrgId/${organization.organizationId}`
      );

      setExpenseTypeList(response?.data || []);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenseTypeList();
  }, []);

  const tableColumns = [
    { header: "Expense Type", field: "name" },
    { header: "Created By", field: "createdBy" },
    { header: "Updated By", field: "updatedBy" },
    { header: "Created Date", field: "createdDate" },
    { header: "Updated Date", field: "updatedDate" },
  ];

  const handleEdit = (expenseType) => {
    history.push("/dashboard/expense-type-add?eId=" + expenseType.id);
  };

  const handleDelete = (floor) => {
    console.log("Delete Floor:", floor);
    // Implement delete logic
  };

  const actions = [
    { icon: FaPen, onClick: handleEdit, title: "Edit", className: "yellow" },
    {
      icon: FaTrashAlt,
      onClick: handleDelete,
      title: "Delete",
      className: "text-red-600",
    },
  ];

  const addClick = () => {
    history.push("/dashboard/expense-type-add");
  };

  return (
    <>
      <div>
        <DynamicTableComponent
          fetchDataFunction={fetchExpenseTypeList}
          setPage={setPage}
          page={page}
          data={expenseTypeList}
          columns={tableColumns}
          pageSize={pageSize}
          totalPages={totalPages}
          totalElements={totalElements}
          loading={loading}
          title="Expense Type"
          actions={actions}
          firstButton={{
            title: "Add Type",
            onClick: addClick,
            icon: FaLayerGroup,
            className: "bg-emerald-500",
          }}
        />
      </div>
    </>
  );
}
