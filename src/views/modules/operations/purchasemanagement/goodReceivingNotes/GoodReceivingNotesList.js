import React, { useEffect, useState, useContext } from "react";
import httpService from "../../../../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import { RxCross2 } from "react-icons/rx";
import {
  FaEye,
  FaPen,
  FaSearch,
  FaTrashAlt,
  FaFileInvoiceDollar,
  FaFileAlt,
  FaBuilding,
  FaFilter,
  FaWarehouse,
  FaBan,
} from "react-icons/fa";
import {
  useHistory,
  useLocation,
} from "react-router-dom/cjs/react-router-dom.min.js";
import DynamicTableComponentDateRange from "components/table/DynamicTableComponentDateRange.js";
import { TbFileExport } from "react-icons/tb";
import { getAllWarehousesForDropdown } from "service/WarehouseService";
import "../../../../../assets/styles/projects/project.css";
import {
  GRN_RECEIPT_TYPE_OPTIONS,
  GRN_RECEIPT_TYPES,
  getGrnReceiptTypeLabel,
  normalizeGrnReceiptType,
} from "utility/GrnReceiptType";

export default function GoodReceivingNotesList() {
  const { loading, setLoading, notifyError, notifySuccess } =
    useContext(MainContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [grnList, setGrnList] = useState([]);
  const [grnItems, setGrnItems] = useState({
    grn: {},
    grnItems: [],
  });
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDateObj, endDateObj] = dateRange;
  const [formattedDate, setFormattedDate] = useState({
    startDate: null,
    endDate: null,
  });
  const [payloadData, setPayloadData] = useState({
    poId: null,
    vendorId: null,
    status: "RECEIVED",
    invoiceStatus: null,
    receiptType: null,
    warehouseId: null,
  });
  const [selectedPo, setSelectedPo] = useState(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelGrnId, setCancelGrnId] = useState(null);
  const [dropdowns, setDropdowns] = useState({
    purchaseOrders: [],
    vendors: [],
    warehouses: [],
    status: ["RECEIVED", "CANCELLED"],
    receiptTypes: GRN_RECEIPT_TYPE_OPTIONS.map((option) => ({
      id: option.id,
      name: option.name,
    })),
    invoiceStatus: [
      { id: "NOT_INVOICED", name: "Not Invoiced" },
      { id: "PARTIALLY_INVOICED", name: "Partially Invoiced" },
      { id: "FULLY_INVOICED", name: "Fully Invoiced" },
    ],
  });

  const history = useHistory();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const poId = queryParams.get("poId");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPayloadData((prev) => ({
      ...prev,
      [name]: value === "" ? null : value,
    }));
  };

  // Fetch Grn List
  const fetchGrnList = async (overrides = {}) => {
    try {
      const org = JSON.parse(localStorage.getItem("organization")) || null;
      if (!org) return;

      const activePayloadData = overrides.payloadData || payloadData;
      const activeFormattedDate = overrides.formattedDate || formattedDate;
      const activePage = overrides.page !== undefined ? overrides.page : page;
      const activePageSize =
        overrides.pageSize !== undefined ? overrides.pageSize : pageSize;

      setLoading(true);

      let payload = {
        ...activePayloadData,
        receiptType: normalizeGrnReceiptType(activePayloadData.receiptType),
        startDate: activeFormattedDate.startDate,
        endDate: activeFormattedDate.endDate,
        orgId: org.organizationId,
        page: activePage,
        size: activePageSize,
        sortBy: "createdDate",
        sortDir: "desc",
      };

      if (poId) {
        payload = {
          page: activePage,
          size: activePageSize,
          sortBy: "createdDate",
          sortDir: "asc",
        };
      }

      const response = poId
        ? await httpService.post(`/grn/getByPoId/${poId}`, payload)
        : await httpService.post(`/grn/getByStatusAndDateRange`, payload);

      const items = response?.data?.content || response?.data || [];
      setGrnList(items);
      setTotalPages(response?.data?.totalPages || 0);
      setTotalElements(response?.data?.totalElements || 0);

      if (poId && items.length > 0) {
        const firstGrn = items[0];
        setSelectedPo({
          poNumber: firstGrn.poNumber,
          vendorName: firstGrn.vendorName,
          projectName: firstGrn.projectName,
          vendorId: firstGrn.vendorId,
          status: firstGrn.status,
          poStatus: firstGrn.poStatus,
        });
        setPayloadData((prev) => ({
          ...prev,
          poId: firstGrn.poId,
          vendorId: firstGrn.vendorId,
          status: firstGrn.status,
        }));
      } else if (poId) {
        setPayloadData((prev) => ({
          ...prev,
          poId: response?.data?.[0]?.poId || null,
          vendorId: response?.data?.[0]?.vendorId || null,
          status: response?.data?.[0]?.status || null,
        }));
      }
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  // Fetch Dropdowns Data
  const fetchDropdownData = async () => {
    try {
      const org = JSON.parse(localStorage.getItem("organization")) || null;
      if (!org) return;

      if (poId) return; // Skip dropdowns if filtering by PO

      setLoading(true);

      const [purchaseOrders, vendors, warehouseResponse] = await Promise.all([
        httpService.get(`/purchaseOrder/${org.organizationId}/listBasic`),
        httpService.get(`/vendorAccount/getVendorByOrg/${org.organizationId}`),
        getAllWarehousesForDropdown(org.organizationId),
      ]);

      const purchaseOrdersList =
        purchaseOrders?.data?.data || purchaseOrders?.data || [];

      setDropdowns((prev) => ({
        ...prev,
        purchaseOrders: purchaseOrdersList,
        vendors: vendors.data || [],
        warehouses:
          warehouseResponse?.data?.content || warehouseResponse?.data || [],
      }));
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  //   Fetch GRN Details
  const fetchGrnDetails = async (id) => {
    setLoading(true);
    try {
      const response = await httpService.get(`/grn/getById/${id}`);

      console.log("response :: ", response);

      setGrnItems({
        grn: response?.data || {},
        grnItems: response?.data?.grnItemsList || [],
      });
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  useEffect(() => {
    fetchGrnList();
  }, [page, pageSize]);

  const tableColumns = [
    { header: "GRN Number", field: "grnNumber" },
    { header: "Status", field: "status" },
    {
      header: "Receipt Type",
      field: "receiptType",
      render: (value) => {
        const normalizedType = normalizeGrnReceiptType(value);

        if (normalizedType === GRN_RECEIPT_TYPES.STOCK) {
          return (
            <span
              className="px-2 py-1 rounded-full text-xs font-bold uppercase"
              style={{ backgroundColor: "#eef2ff", color: "#4f46e5" }}
            >
              Stock
            </span>
          );
        }

        if (normalizedType === GRN_RECEIPT_TYPES.DIRECT) {
          return (
            <span
              className="px-2 py-1 rounded-full text-xs font-bold uppercase"
              style={{ backgroundColor: "#fff7ed", color: "#c2410c" }}
            >
              Direct
            </span>
          );
        }
        return (
          <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-500">
            —
          </span>
        );
      },
    },
    {
      header: "Warehouse / Project",
      field: "warehouseName",
      render: (value, item) => {
        const normalizedType = normalizeGrnReceiptType(item.receiptType);

        if (normalizedType === GRN_RECEIPT_TYPES.STOCK) {
          return value || "—";
        }

        if (normalizedType === GRN_RECEIPT_TYPES.DIRECT) {
          return item.directProjectName || item.directConsumeProjectName || "—";
        }

        return "—";
      },
    },
    {
      header: "Invoice Status",
      field: "invoiceStatus",
      render: (status) => {
        const statusConfig = {
          NOT_INVOICED: {
            label: "Not Invoiced",
            className: "bg-gray-200 text-gray-700",
          },
          PARTIALLY_INVOICED: {
            label: "Partial",
            className: "bg-yellow-200 text-yellow-800",
          },
          FULLY_INVOICED: {
            label: "Fully Invoiced",
            className: "bg-green-200 text-green-800",
          },
        };
        const config = statusConfig[status] || {
          label: status || "N/A",
          className: "bg-gray-100 text-gray-600",
        };
        return (
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${config.className}`}
          >
            {config.label}
          </span>
        );
      },
    },
    { header: "Created By", field: "createdBy" },
    { header: "Created Date", field: "createdDate" },
  ];

  const grnItemsTableColumn = [
    { header: "Item Name", field: "itemName" },
    { header: "Qty Received", field: "quantityReceived" },
    { header: "Qty Invoiced", field: "quantityInvoiced" },
    { header: "Qty Pending", field: "quantityPending" },
    { header: "Invoice Progress", field: "invoiceProgress" },
  ];

  // Handle View GRN Details
  const handleView = ({ id }) => {
    fetchGrnDetails(id);
    setIsModalOpen(true);
  };

  // Handle Edit GRN
  const handleEdit = ({ id }) => {
    history.push(`/dashboard/update-good-receiving-notes/${id}`);
  };

  const handleDelete = ({ id }) => {
    // Implement delete logic
  };

  // Handle Cancel GRN
  const handleCancelGrn = async () => {
    if (!cancelGrnId) return;
    setLoading(true);
    try {
      const response = await httpService.post(`/grn/cancel/${cancelGrnId}`);
      notifySuccess(
        response?.responseMessage || "GRN cancelled successfully",
        4000,
      );
      fetchGrnList();
    } catch (err) {
      notifyError(err.message, err.data || "Failed to cancel GRN", 4000);
    } finally {
      setLoading(false);
      setShowCancelModal(false);
      setCancelGrnId(null);
    }
  };

  // Handle Create Invoice - redirect to create invoice page with GRN pre-selected
  const handleCreateInvoice = ({ grnNumber }) => {
    history.push(
      `/dashboard/create-vendor-invoice?grnNumber=${encodeURIComponent(grnNumber || "")}`,
    );
  };

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
      className: "yellow",
    },
    {
      icon: FaFileInvoiceDollar,
      onClick: handleCreateInvoice,
      title: "Create Invoice",
      className: "text-emerald-600",
      condition: (data) =>
        data.invoiceStatus === "NOT_INVOICED" ||
        data.invoiceStatus === "PARTIALLY_INVOICED",
    },
    {
      icon: FaTrashAlt,
      onClick: handleDelete,
      title: "Delete",
      className: "text-red-600",
    },
  ];

  const handleDateRangeChange = (update) => {
    setDateRange(update);

    if (update[0] && update[1]) {
      const startingDate = update[0].toISOString().split("T")[0];
      const endingDate = update[1].toISOString().split("T")[0];

      setFormattedDate({
        startDate: startingDate,
        endDate: endingDate,
      });
    } else {
      setFormattedDate({
        startDate: null,
        endDate: null,
      });
    }
  };

  const handleAddGrn = () => {
    if (poId) {
      history.push(`/dashboard/add-good-receiving-notes/?poId=${poId}`);
    } else {
      history.push(`/dashboard/add-good-receiving-notes`);
    }
  };

  const handleClearFilters = () => {
    const resetPayload = {
      poId: null,
      vendorId: null,
      status: "RECEIVED",
      invoiceStatus: null,
      receiptType: null,
      warehouseId: null,
    };
    const resetDateRange = [null, null];
    const resetFormattedDate = {
      startDate: null,
      endDate: null,
    };

    setPayloadData(resetPayload);
    setDateRange(resetDateRange);
    setFormattedDate(resetFormattedDate);
    setPage(0);
    fetchGrnList({
      payloadData: resetPayload,
      formattedDate: resetFormattedDate,
      page: 0,
    });
  };

  const hasActiveFilters = Boolean(
    payloadData.poId ||
    payloadData.vendorId ||
    payloadData.invoiceStatus ||
    payloadData.receiptType ||
    (payloadData.status && payloadData.status !== "RECEIVED") ||
    formattedDate.startDate ||
    formattedDate.endDate,
  );

  const getReceiptTargetLabel = (grn) => {
    const normalizedType = normalizeGrnReceiptType(grn?.receiptType);
    if (normalizedType === GRN_RECEIPT_TYPES.STOCK) {
      return grn?.warehouseName || "N/A";
    }
    if (normalizedType === GRN_RECEIPT_TYPES.DIRECT) {
      return grn?.directProjectName || grn?.directConsumeProjectName || "N/A";
    }
    return "N/A";
  };

  return (
    <>
      <div className="container">
        {poId && grnList.length === 0 ? (
          ""
        ) : (
          <div className="w-full mb-6  rounded">
            <div className=" flex max-lg-flex-col items-center">
              {poId ? (
                <div className="w-full">
                  <div className="flex flex-col md:flex-row gap-4 mb-4">
                    <div className="w-full lg:w-6/12 xl:w-4/12 px-2">
                      <div className="relative flex flex-col min-w-0 break-words bg-white shadow-lg rounded-lg p-4">
                        <div className="flex items-center">
                          <div
                            className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full"
                            style={{ background: "#3b82f6" }}
                          >
                            <FaFileAlt className="w-5 h-5" />
                          </div>
                          <div className="ml-4">
                            <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                              Purchase Order
                            </h5>
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-lg text-blueGray-700">
                                {selectedPo?.poNumber ||
                                  dropdowns.purchaseOrders.find(
                                    (p) =>
                                      String(p.id) === String(payloadData.poId),
                                  )?.poNumber ||
                                  payloadData.poId}
                              </span>
                              {selectedPo?.poStatus && (
                                <span
                                  className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                                    selectedPo.poStatus === "CLOSED"
                                      ? "bg-red-100 text-red-700"
                                      : selectedPo.poStatus === "PARTIAL"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : selectedPo.poStatus === "OPEN"
                                          ? "bg-green-100 text-green-700"
                                          : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  ({selectedPo.poStatus})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full lg:w-6/12 xl:w-4/12 px-2">
                      <div className="relative flex flex-col min-w-0 break-words bg-white shadow-lg rounded-lg p-4">
                        <div className="flex items-center">
                          <div
                            className="text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full"
                            style={{ background: "#10b981" }}
                          >
                            <FaBuilding className="w-5 h-5" />
                          </div>
                          <div className="ml-4">
                            <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                              Vendor
                            </h5>
                            <span className="font-semibold text-lg text-blueGray-700">
                              {selectedPo?.vendorName ||
                                dropdowns.vendors.find(
                                  (v) =>
                                    String(v.id) ===
                                    String(payloadData.vendorId),
                                )?.name ||
                                payloadData.vendorId}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="w-full booking-filter-shell">
                  <div className="booking-filter-header">
                    <div>
                      <h4 className="booking-filter-title">
                        <FaFilter className="booking-filter-title-icon" />
                        Filter Good Receiving Notes
                      </h4>
                      <p className="booking-filter-subtitle">
                        Search GRNs by purchase order, vendor, status, invoice
                        status, or receipt type.
                      </p>
                    </div>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={handleClearFilters}
                        className="booking-filter-clear-btn"
                      >
                        <RxCross2 className="booking-filter-clear-icon" />
                        Clear Filters
                      </button>
                    )}
                  </div>

                  <div className="booking-filter-grid">
                    <div className="booking-filter-field">
                      <SelectField
                        label="Select Purchase Order"
                        name="poId"
                        value={payloadData.poId}
                        disabled={false}
                        onChange={handleChange}
                        options={dropdowns.purchaseOrders}
                        labelClassName="booking-filter-label"
                        selectClassName="booking-filter-select"
                      />
                    </div>

                    <div className="booking-filter-field">
                      <SelectField
                        label="Select Vendor"
                        name="vendorId"
                        value={payloadData.vendorId}
                        disabled={false}
                        onChange={handleChange}
                        options={dropdowns.vendors}
                        labelClassName="booking-filter-label"
                        selectClassName="booking-filter-select"
                      />
                    </div>

                    <div className="booking-filter-field">
                      <SelectField
                        label="Select Status"
                        name="status"
                        value={payloadData.status}
                        disabled={false}
                        onChange={handleChange}
                        options={dropdowns.status}
                        labelClassName="booking-filter-label"
                        selectClassName="booking-filter-select"
                      />
                    </div>

                    <div className="booking-filter-field">
                      <SelectField
                        label="Invoice Status"
                        name="invoiceStatus"
                        value={payloadData.invoiceStatus || ""}
                        disabled={false}
                        onChange={handleChange}
                        options={dropdowns.invoiceStatus}
                        labelClassName="booking-filter-label"
                        selectClassName="booking-filter-select"
                      />
                    </div>

                    <div className="booking-filter-field">
                      <SelectField
                        label="Receipt Type"
                        name="receiptType"
                        value={payloadData.receiptType || ""}
                        disabled={false}
                        onChange={handleChange}
                        options={dropdowns.receiptTypes}
                        labelClassName="booking-filter-label"
                        selectClassName="booking-filter-select"
                      />
                    </div>
                  </div>

                  <div className="w-full flex justify-end mt-4">
                    <button
                      onClick={() => !poId && fetchGrnList()}
                      type="button"
                      className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none"
                    >
                      <FaSearch className="w-4 h-4 inline-block mr-1" />
                      Search
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* {!poId && (
              <div className="w-full flex justify-center mt-2 pb-4">
                <button
                  onClick={() => !poId && fetchGrnList()}
                  type="button"
                  className="bg-emerald-500 text-white font-bold uppercase text-xs px-6 py-2.5 rounded shadow hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
                >
                  <FaSearch className="w-4 h-4 inline-block mr-2" />
                  Search
                </button>
              </div>
            )} */}
          </div>
        )}

        {/* TABLE  */}
        <div>
          <DynamicTableComponentDateRange
            fetchDataFunction={fetchGrnList}
            setPage={setPage}
            setPageSize={setPageSize}
            page={page}
            data={grnList}
            columns={tableColumns}
            pageSize={pageSize}
            totalPages={totalPages}
            totalElements={totalElements}
            loading={loading}
            title="Good Receiving Notes List"
            actions={actions}
            onChangeDate={handleDateRangeChange}
            startDate={startDateObj}
            endDate={endDateObj}
            firstButton={{
              title: "ADD GRN",
              onClick: handleAddGrn,
              icon: TbFileExport,
              className: "bg-emerald-500",
            }}
          />
        </div>
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
                Good Receiving Notes Details
              </h2>

              <button
                onClick={() => setIsModalOpen(false)}
                className="text-red-500 outline-none focus:outline-none"
              >
                <RxCross2 className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 max-h-65-vh overflow-y-auto">
              {/* GRN INFO */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 m-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">GRN Number:</span>{" "}
                    <span className="font-medium">
                      {grnItems.grn.grnNumber || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>{" "}
                    <span className="font-medium">
                      {grnItems.grn.status || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Receipt Type:</span>{" "}
                    <span className="font-medium">
                      {getGrnReceiptTypeLabel(grnItems.grn.receiptType)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Warehouse / Project:</span>{" "}
                    <span className="font-medium">
                      {getReceiptTargetLabel(grnItems.grn)}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Invoice Status:</span>{" "}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        grnItems.grn.invoiceStatus === "NOT_INVOICED"
                          ? "bg-gray-200 text-gray-700"
                          : grnItems.grn.invoiceStatus === "PARTIALLY_INVOICED"
                            ? "bg-yellow-200 text-yellow-800"
                            : grnItems.grn.invoiceStatus === "FULLY_INVOICED"
                              ? "bg-green-200 text-green-800"
                              : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {grnItems.grn.invoiceStatus === "NOT_INVOICED"
                        ? "Not Invoiced"
                        : grnItems.grn.invoiceStatus === "PARTIALLY_INVOICED"
                          ? "Partially Invoiced"
                          : grnItems.grn.invoiceStatus === "FULLY_INVOICED"
                            ? "Fully Invoiced"
                            : grnItems.grn.invoiceStatus || "N/A"}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Vendor:</span>{" "}
                    <span className="font-medium">
                      {grnItems.grn.vendorName || "N/A"}
                    </span>
                  </div>
                </div>
              </div>

              {/* GRN ITEMS SECTION */}
              <div className="bg-gray-50 border rounded-lg p-4 m-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  GRN Item Listing
                </h3>

                <ItemTable
                  data={grnItems.grnItems}
                  column={grnItemsTableColumn}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

const SelectField = ({
  label,
  name,
  value,
  onChange,
  options,
  disabled,
  labelClassName = "block text-xs font-small mb-1",
  selectClassName = "border rounded-lg px-3 py-2 w-full disabled-styles",
}) => (
  <div>
    <label className={labelClassName}>{label}</label>
    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      disabled={disabled}
      className={selectClassName}
    >
      <option value="">Select</option>
      {options.map((opt) => (
        <option key={opt.id || opt} value={opt.id || opt}>
          {opt.name || opt.poNumber || opt}
        </option>
      ))}
    </select>
  </div>
);

function formatDate(dateString) {
  if (!dateString) return "___";
  return new Date(dateString).toISOString().split("T")[0];
}

const ItemTable = ({ data, column }) => {
  // helper
  const getValue = (obj, path) => {
    return path.split(".").reduce((acc, key) => acc?.[key], obj);
  };

  data = Array.isArray(data) && data.length > 0 ? data : [{}];

  const getCellValue = (item, col) => {
    if (col.field === "createdDate") {
      return formatDate(item[col.field]);
    }
    if (col.field === "quantityPending") {
      const received = item.quantityReceived || 0;
      const invoiced = item.quantityInvoiced || 0;
      return (received - invoiced).toFixed(2);
    }
    if (col.field === "invoiceProgress") {
      const received = item.quantityReceived || 0;
      const invoiced = item.quantityInvoiced || 0;
      const progress = received > 0 ? (invoiced / received) * 100 : 0;
      return (
        <div className="flex items-center gap-2">
          <div className="w-24 bg-gray-200 rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full ${
                progress === 100
                  ? "bg-green-500"
                  : progress > 0
                    ? "bg-yellow-500"
                    : "bg-gray-400"
              }`}
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <span className="text-xs text-gray-600">{progress.toFixed(0)}%</span>
        </div>
      );
    }
    return getValue(item, col.field) ?? "___";
  };

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
                const value = getCellValue(item, col);
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
