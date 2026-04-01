import React, { useEffect, useState, useContext } from "react";
import httpService from "../../../../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../../../../components/table/DynamicTableComponent.js";
import DynamicDetailsModal from "../../../../../components/CustomerComponents/DynamicModal.js";
import { RxCross2 } from "react-icons/rx";
import {
  FaCheckCircle,
  FaEye,
  FaPen,
  FaTimesCircle,
  FaTrashAlt,
} from "react-icons/fa";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min.js";
import { RiFileAddFill, RiFileListFill } from "react-icons/ri";

export default function PurchaseOrderList() {
  const { loading, setLoading, notifyError, notifySuccess } =
    useContext(MainContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [purchaseOrderList, setPurchaseOrderList] = useState([]);
  const [purchaseOrderItem, setPurchaseOrderItem] = useState(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const history = useHistory();

  // Fetch Po List
  const fetchPurchaseOrderList = async () => {
    try {
      const organization =
        JSON.parse(localStorage.getItem("organization")) || null;
      if (!organization) return;

      setLoading(true);

      const payload = {
        page: page,
        size: pageSize,
        sortBy: "createdDate",
        sortDir: "dsc",
      };

      const response = await httpService.post(
        `/purchaseOrder/${organization.organizationId}/getAll`,
        payload,
      );

      console.log("response :: ", response);

      const resData = response?.data?.data || response?.data || {};
      const content = resData?.content || resData || [];

      setPurchaseOrderList(content);
      setTotalPages(resData?.totalPages ?? 0);
      setTotalElements(resData?.totalElements ?? 0);
      setPage(resData?.page ?? page);
      setPageSize(resData?.size ?? pageSize);
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
      setPurchaseOrderItem(response?.data || response || null);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPurchaseOrderList();
  }, [page, pageSize]);

  const tableColumns = [
    { header: "Po No", field: "poNumber" },
    { header: "Total Amount", field: "totalAmount" },
    {
      header: "Status",
      field: "status",
      render: (status) => {
        return (
          <span
            className={
              status === "OPEN"
                ? "text-gray-600"
                : status === "PARTIAL"
                  ? "text-blue-600"
                  : status === "CLOSED"
                    ? "text-green-600"
                    : status === "CANCELLED" && "text-red-600"
            }
          >
            {status}
          </span>
        );
      },
    },
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
    { header: "Qty", field: "quantity" },
    { header: "Rec. Qty", field: "receivedQuantity" },
    { header: "Inv. Qty", field: "invoicedQuantity" },
    { header: "Amount", field: "amount" },
  ];

  const itemPoColumn = [
    { header: "PoNumber", field: "poNumber" },
    { header: "ProjectId", field: "projectId" },
    { header: "VendorId", field: "vendorId" },
    { header: "TotalAmount", field: "totalAmount" },
    {
      header: "Status",
      field: "status",
      render: (status) => {
        return (
          <span
            className={
              status === "OPEN"
                ? "text-gray-600"
                : status === "PARTIAL"
                  ? "text-blue-600"
                  : status === "CLOSED"
                    ? "text-green-600"
                    : status === "CANCELLED" && "text-red-600"
            }
          >
            {status}
          </span>
        );
      },
    },
  ];

  // Handle View Po Details
  const handleView = (data) => {
    // Format purchase order items for display
    const formattedItems = (
      data?.items ||
      data?.purchaseOrderItemList ||
      []
    ).map((item) => ({
      "Item Name": item.items?.name || item.itemName || "N/A",
      Code: item.items?.code || "N/A",
      Quantity: item.quantity,
      "Received Qty": item.receivedQuantity || 0,
      "Invoiced Qty": item.invoicedQuantity || 0,
      Rate: `Rs. ${item.rate?.toLocaleString() || 0}`,
      Amount: `Rs. ${item.amount?.toLocaleString() || 0}`,
    }));

    const formattedDetails = {
      "PO Information": {
        "PO Number": data?.poNumber || data?.po?.poNumber,
        Status: data?.status || data?.po?.status,
        "Total Amount": `Rs. ${(data?.totalAmount || data?.po?.totalAmount)?.toLocaleString() || 0}`,
      },
      "Reference Info": {
        Project: data?.projectName || data?.po?.projectName || `Project #${data?.projectId || data?.po?.projectId}`,
        Vendor: data?.vendorName || data?.po?.vendorName || `Vendor #${data?.vendorId || data?.po?.vendorId}`,
      },
      "Audit Info": {
        "Created By": data?.createdBy || data?.po?.createdBy,
        "Created Date": data?.createdDate || data?.po?.createdDate,
        "Updated By": data?.updatedBy || data?.po?.updatedBy,
        "Updated Date": data?.updatedDate || data?.po?.updatedDate,
      },
      "Items List": formattedItems,
    };

    setPurchaseOrderItem(formattedDetails);
    setIsModalOpen(true);
  };

  // Handle Edit Po
  const handleEdit = ({ id, status }) => {
    if (status !== "OPEN") {
      return notifyError(
        "Edit Not Allowed",
        "Only open purchase orders can be edited",
        4000,
      );
    }
    history.push(`/dashboard/purchase-order-update/${id}`);
  };

  // Handle Delete Po
  const handleDelete = ({ id }) => {
    // Implement delete logic
  };

  // Handle Approve PO
  const handleApprove = async ({ id, status }) => {
    if (status !== "OPEN") {
      return notifyError(
        "Approve Not Allowed",
        "Only open purchase orders can be approved",
        4000,
      );
    }
    let confirm = window.confirm(
      "Are you sure you want to approve this purchase order?",
    );
    if (!confirm) return;
    setLoading(true);
    try {
      const response = await httpService.post(`/purchaseOrder/approve/${id}`);
      await notifySuccess(response.responseMessage, 4000);
      fetchPurchaseOrderList();
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  // Handle Cancel Po
  const handleCancel = async ({ id, status }) => {
    if (status !== "OPEN") {
      return notifyError(
        "Cancel Not Allowed",
        "Only open purchase orders can be cancelled",
        4000,
      );
    }
    let confirm = window.confirm(
      "Are you sure you want to cancel this purchase order?",
    );
    if (!confirm) return;
    setLoading(true);
    try {
      const response = await httpService.post(`/purchaseOrder/cancel/${id}`);
      await notifySuccess(response.responseMessage, 4000);
      fetchPurchaseOrderList();
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  // Handle Add Grn
  const handleAddGrn = ({ id, status }) => {
    if (status !== "PARTIAL") {
      return notifyError(
        "Add GRN Not Allowed",
        "GRN can only be added for partial purchase orders",
        4000,
      );
    }
    history.push(`/dashboard/add-good-receiving-notes/?poId=${id}`);
  };

  // Handle View Grn
  const handleViewGrn = ({ id, status }) => {
    // if (status !== "PARTIAL") {
    //   return notifyError(
    //     "View GRN Not Allowed",
    //     "GRN can only be viewed for partial purchase orders",
    //     4000,
    //   );
    // }
    history.push(`/dashboard/good-receiving-notes-list/?poId=${id}`);
  };

  const actions = [
    {
      icon: FaEye,
      onClick: handleView,
      title: "View",
      className: "text-blue-600",
    },
    {
      icon: FaCheckCircle,
      onClick: handleApprove,
      title: "Approve",
      className: "text-green-600",
    },
    {
      icon: FaTimesCircle,
      onClick: handleCancel,
      title: "Cancel",
      className: "text-red-600",
    },
    {
      icon: RiFileListFill,
      onClick: handleViewGrn,
      title: "View GRN",
      className: "text-blue-600",
    },
    {
      icon: RiFileAddFill,
      onClick: handleAddGrn,
      title: "Add GRN",
      className: "text-green-600",
    },
    {
      icon: FaPen,
      onClick: handleEdit,
      title: "Edit",
      className: "yellow",
    },
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
        <DynamicDetailsModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          data={purchaseOrderItem}
          title="Purchase Order Detail"
        />

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
                    {col.render ? col.render(value, item) : value}
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
