import React, { useEffect, useState, useContext } from "react";
import { MainContext } from "context/MainContext.js";
import { getAllUnits } from "service/ItemsService.js";
import { FaPlus, FaPen, FaSearch } from "react-icons/fa";
import UnitForm from "./UnitForm.js";
import DynamicTableComponent from "components/table/DynamicTableComponent";

export default function UnitsList() {
  const {
    loading,
    setLoading,
    notifyError,
    notifySuccess,
    backdrop,
    setBackdrop,
  } = useContext(MainContext);

  const [units, setUnits] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);

  const organizationLocal =
    JSON.parse(localStorage.getItem("organization")) || {};

  const fetchUnits = async () => {
    if (!organizationLocal.organizationId) return;
    setLoading(true);
    try {
      const response = await getAllUnits(organizationLocal.organizationId, {
        page,
        size: pageSize,
        sortBy: "createdDate",
        sortDir: "desc",
      });
      setUnits(response?.content || []);
      setTotalPages(response?.totalPages || 0);
      setTotalElements(response?.totalElements || 0);
    } catch (err) {
      notifyError(err.message || "Failed to fetch units", err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnits();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize]);

  const handleAddNew = () => {
    setSelectedUnit(null);
    setIsFormOpen(true);
    setBackdrop(true);
  };

  const handleEdit = (unit) => {
    setSelectedUnit(unit);
    setIsFormOpen(true);
    setBackdrop(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedUnit(null);
    setBackdrop(false);
  };

  const handleFormSuccess = () => {
    handleCloseForm();
    fetchUnits();
  };

  const filteredUnits = units.filter(
    (unit) =>
      unit.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      unit.symbol?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const tableColumns = [
    { header: "Name", field: "name" },
    {
      header: "Symbol",
      field: "symbol",
      render: (value) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {value}
        </span>
      ),
    },
    {
      header: "Created Date",
      field: "createdDate",
      render: (value) => (value ? new Date(value).toLocaleDateString() : "-"),
    },
  ];

  const handlePrevPage = () => {
    if (page > 0) setPage(page - 1);
  };

  const handleNextPage = () => {
    if (page < totalPages - 1) setPage(page + 1);
  };

  return (
    <>
      {/* Unit Form Modal */}
      {isFormOpen && (
        <UnitForm
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          onSuccess={handleFormSuccess}
          unit={selectedUnit}
        />
      )}

      <div className="container mx-auto p-4">
        {/* Table */}
        <DynamicTableComponent
          fetchDataFunction={fetchUnits}
          setPage={setPage}
          setPageSize={setPageSize}
          page={page}
          pageSize={pageSize}
          data={filteredUnits}
          columns={tableColumns}
          totalPages={totalPages}
          totalElements={totalElements}
          loading={loading}
          title="Material Units"
          actions={[
            {
              icon: FaPen,
              onClick: handleEdit,
              title: "Edit",
              className: "text-emerald-600",
            },
          ]}
          firstButton={{
            title: "Add Unit",
            onClick: handleAddNew,
            icon: FaPlus,
            className: "bg-emerald-500",
          }}
        />
      </div>
    </>
  );
}
