import React, { useEffect, useState, useContext } from "react";
import httpService from "../../../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../../../components/table/DynamicTableComponent.js";
import { RxCross2 } from "react-icons/rx";
import { FaEye, FaPen, FaTrashAlt } from "react-icons/fa";

export default function PurchaseOrderList() {
  const { loading, setLoading, notifyError, notifySuccess } =
    useContext(MainContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [purchaseOrderList, setPurchaseOrderList] = useState([]);
  const [purchaseOrderId, setPurchaseOrderId] = useState(null);
  const [purchaseOrderItem, setPurchaseOrderItem] = useState({
    item: [],
    po: {},
  });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  // Fetch Po List
  const fetchPurchaseOrderList = async () => {
    setLoading(true);
    try {
      const organization =
        JSON.parse(localStorage.getItem("organization")) || null;

      const payload = {
        page: page,
        size: pageSize,
        sortBy: "createdDate",
        sortDir: "asc",
      };

      const response = await httpService.post(
        `/purchaseOrder/${organization.organizationId}/getAll`,
        payload,
      );

      setPurchaseOrderList(response?.data || []);
      // setTotalPages(response?.data?.totalPages || 0);
      // setTotalElements(response?.data?.totalElements || 0);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Po Details
  const fetchPoDetails = async (id) => {
    setLoading(true);
    try {
      const response = await httpService.get(`/purchaseOrder/getById/${id}`);

      setPurchaseOrderItem({
        item: response?.data?.items || [],
        po: response?.data?.po || {},
      });
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (purchaseOrderId) {
      setPurchaseOrderItem({ item: [], po: {} });
      fetchPoDetails(purchaseOrderId);
    }
  }, [purchaseOrderId]);

  useEffect(() => {
    fetchPurchaseOrderList();
  }, [page, pageSize]);

  const tableColumns = [
    { header: "Po No", field: "poNumber" },
    { header: "Total Amount", field: "totalAmount" },
    { header: "Status", field: "status" },
    { header: "Created By", field: "createdBy" },
    { header: "Updated By", field: "updatedBy" },
    { header: "Created Date", field: "createdDate" },
    { header: "Updated Date", field: "updatedDate" },
  ];

  const itemTableColumn = [
    { header: "Name", field: "items.name" },
    { header: "Code", field: "items.code" },
    { header: "Description", field: "items.description" },
    { header: "Rate", field: "rate" },
    { header: "Quantity", field: "quantity" },
    { header: "Amount", field: "amount" },
  ];

  const itemPoColumn = [
    { header: "PoNumber", field: "poNumber" },
    { header: "ProjectId", field: "projectId" },
    { header: "VendorId", field: "vendorId" },
    { header: "TotalAmount", field: "totalAmount" },
    { header: "Status", field: "status" },
  ];

  const handleView = ({ id }) => {
    setPurchaseOrderId(id);
    setIsModalOpen(true);
  };

  const handleEdit = ({ id }) => {
    // setExpenseTypeId(id);
  };

  const handleDelete = () => {
    // Implement delete logic
  };

  const actions = [
    {
      icon: FaEye,
      onClick: handleView,
      title: "View",
      className: "text-blue-600",
    },
    { icon: FaPen, onClick: handleEdit, title: "Edit", className: "yellow" },
    {
      icon: FaTrashAlt,
      onClick: handleDelete,
      title: "Delete",
      className: "text-red-600",
    },
  ];

  return (
    <>
      <div>
        <DynamicTableComponent
          fetchDataFunction={fetchPurchaseOrderList}
          setPage={setPage}
          page={page}
          data={purchaseOrderList}
          columns={tableColumns}
          pageSize={pageSize}
          setPageSize={setPageSize}
          totalPages={totalPages}
          totalElements={totalElements}
          loading={loading}
          title="Purchase Order List"
          actions={actions}
        />
      </div>

      {/* Item MODAL  */}
      {isModalOpen && (
        <>
          <div className="backdrop-class"></div>

          <div
            role="dialog"
            aria-modal="true"
            className="bg-white rounded cancel-booking-modal inset-0 z-50 mx-auto modal-width shadow-xl"
          >
            {/* HEADER */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-semibold text-gray-800">
                Purchase Order Details
              </h2>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-red-500 outline-none focus:outline-none"
              >
                <RxCross2 className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-860-px overflow-y-auto">
              {/* PO SUMMARY */}
              <div className="bg-gray-50 border rounded-lg p-4 m-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  PO Summary
                </h3>

                <ItemTable
                  data={[purchaseOrderItem.po]}
                  column={itemPoColumn}
                />
              </div>

              {/* ITEMS SECTION */}
              <div className="bg-gray-50 border rounded-lg p-4 m-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  Item Listing
                </h3>

                <ItemTable
                  data={purchaseOrderItem.item}
                  column={itemTableColumn}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

const ItemTable = ({ data, column }) => {
  // helper
  const getValue = (obj, path) => {
    return path.split(".").reduce((acc, key) => acc?.[key], obj);
  };

  data = data.length === 0 ? [{}] : data;

  return (
    <div className="w-full border border-gray-200 rounded overflow-x-auto">
      <table className="w-full border-collapse border border-gray-200">
        {/* Table Header */}
        <thead className="bg-gray-100 border-b border-gray-200">
          <tr>
            {column.map((col, idx) => (
              <th
                key={idx}
                className="px-6 py-3 text-xs font-semibold text-left text-gray-600 uppercase"
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>

        {/* Table Body */}
        <tbody className="divide-y divide-gray-200">
          {data.map((item, rowIndex) => (
            <tr key={rowIndex} className="bg-white">
              {column.map((col, colIndex) => {
                const value = getValue(item, col.field) || "___";
                return (
                  <td
                    key={colIndex}
                    className="px-6 py-3 text-sm text-gray-900"
                  >
                    {value}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
