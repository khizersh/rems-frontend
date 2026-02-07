import React, { useEffect, useState, useContext } from "react";
import { MainContext } from "context/MainContext.js";
import { getAllItems } from "service/ItemsService.js";
import { FaPlus, FaPen, FaEye } from "react-icons/fa";
import DynamicTableComponent from "components/table/DynamicTableComponent.js";
import ItemForm from "./ItemForm.js";

export default function ItemsList() {
  const { loading, setLoading, notifyError, notifySuccess, backdrop, setBackdrop } =
    useContext(MainContext);

  const [items, setItems] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);

  const organizationLocal = JSON.parse(localStorage.getItem("organization")) || {};

  const fetchItems = async () => {
    if (!organizationLocal.organizationId) return;
    setLoading(true);
    try {
      const response = await getAllItems(organizationLocal.organizationId, {
        page,
        size: pageSize,
        sortBy: "createdDate",
        sortDir: "desc",
      });
      setItems(response?.content || []);
      setTotalPages(response?.totalPages || 0);
      setTotalElements(response?.totalElements || 0);
    } catch (err) {
      notifyError(err.message || "Failed to fetch items", err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const handleAddNew = () => {
    setSelectedItem(null);
    setIsViewMode(false);
    setIsFormOpen(true);
    setBackdrop(true);
  };

  const handleEdit = (item) => {
    setSelectedItem(item);
    setIsViewMode(false);
    setIsFormOpen(true);
    setBackdrop(true);
  };

  const handleView = (item) => {
    setSelectedItem(item);
    setIsViewMode(true);
    setIsFormOpen(true);
    setBackdrop(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedItem(null);
    setIsViewMode(false);
    setBackdrop(false);
  };

  const handleFormSuccess = () => {
    handleCloseForm();
    fetchItems();
  };

  const tableColumns = [
    {
      header: "Code",
      field: "code",
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value || "-"}
        </span>
      ),
    },
    { header: "Name", field: "name" },
    {
      header: "Unit",
      field: "itemsUnit.symbol",
      render: (value, item) => (
        <span>
          {value || item.unit?.name || "-"}
          {(item.unitSymbol || item.unit?.symbol) && (
            <span className="text-gray-400 ml-1">
              ({item.unitSymbol || item.unit?.symbol})
            </span>
          )}
        </span>
      ),
    },
    { header: "Description", field: "description" },
  ];

  const actions = [
    {
      icon: FaEye,
      onClick: handleView,
      title: "View",
      className: "text-blue-600",
    },
    {
      icon: FaPen,
      onClick: handleEdit,
      title: "Edit",
      className: "text-emerald-600",
    },
  ];

  return (
    <>
      {/* Item Form Modal */}
      {isFormOpen && (
        <ItemForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
          item={selectedItem}
          isViewMode={isViewMode}
        />
      )}

      <div className="container mx-auto p-4">
        <DynamicTableComponent
          fetchDataFunction={fetchItems}
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          pageSize={pageSize}
          data={items}
          columns={tableColumns}
          totalPages={totalPages}
          totalElements={totalElements}
          loading={loading}
          title="Items Management"
          actions={actions}
          firstButton={{
            title: "Add Item",
            onClick: handleAddNew,
            icon: FaPlus,
            className: "bg-emerald-500",
          }}
        />
      </div>
    </>
  );
}

