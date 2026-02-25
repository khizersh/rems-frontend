import React, { useEffect, useState, useContext } from "react";
import httpService from "../../../../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import { RxCross2 } from "react-icons/rx";
import { FaEye, FaPen, FaSearch, FaTrashAlt } from "react-icons/fa";
import {
  useHistory,
  useLocation,
} from "react-router-dom/cjs/react-router-dom.min.js";
import DynamicTableComponentDateRange from "components/table/DynamicTableComponentDateRange.js";

export default function GoodReceivingNotesList() {
  const { loading, setLoading, notifyError, notifySuccess } =
    useContext(MainContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [grnList, setGrnList] = useState([]);
  const [grnItems, setGrnItems] = useState([
    {
      grn: {},
      grnItems: [],
    },
  ]);
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
  });
  const [dropdowns, setDropdowns] = useState({
    purchaseOrders: [],
    vendors: [],
    status: ["RECEIVED", "CANCELLED"],
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
  const fetchGrnList = async () => {
    try {
      const org = JSON.parse(localStorage.getItem("organization")) || null;
      if (!org) return;

      setLoading(true);

      let payload = {
        ...payloadData,
        startDate: formattedDate.startDate,
        endDate: formattedDate.endDate,
        orgId: org.organizationId,
        page: page,
        size: pageSize,
        sortBy: "createdDate",
        sortDir: "asc",
      };

      if (poId) {
        payload = {
          page: page,
          size: pageSize,
          sortBy: "createdDate",
          sortDir: "asc",
        };
      }

      const response = poId
        ? await httpService.post(`/grn/getByPoId/${poId}`, payload)
        : await httpService.post(`/grn/getByStatusAndDateRange`, payload);

      setGrnList(response?.data?.content || response?.data || []);
      setTotalPages(response?.data?.totalPages || 0);
      setTotalElements(response?.data?.totalElements || 0);

      if (poId) {
        setPayloadData({
          poId: response?.data?.[0]?.poId || null,
          vendorId: response?.data?.[0]?.vendorId || null,
          status: response?.data?.[0]?.status || null,
        });
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

      setLoading(true);

      const [purchaseOrders, vendors] = await Promise.all([
        httpService.get(
          `/purchaseOrder/${org.organizationId}/getByStatus?status=PARTIAL`,
        ),
        httpService.get(`/vendorAccount/getVendorByOrg/${org.organizationId}`),
      ]);

      setDropdowns((prev) => ({
        ...prev,
        purchaseOrders: purchaseOrders.data || [],
        vendors: vendors.data || [],
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
    // { header: "Received Date", field: "receivedDate" },
    { header: "Created By", field: "createdBy" },
    // { header: "Updated By", field: "updatedBy" },
    { header: "Created Date", field: "createdDate" },
    // { header: "Updated Date", field: "updatedDate" },
  ];

  const grnTableColumn = [
    { header: "GRN Number", field: "grnNumber" },
    { header: "Status", field: "status" },
    { header: "ProjectId", field: "projectId" },
    { header: "VendorId", field: "vendorId" },
    { header: "PoId", field: "poId" },
  ];

  const grnItemsTableColumn = [
    { header: "poItemId", field: "poItemId" },
    { header: "quantityReceived", field: "quantityReceived" },
    { header: "quantityInvoiced", field: "quantityInvoiced" },
    { header: "createdDate", field: "createdDate" },
    { header: "createdBy", field: "createdBy" },
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

  return (
    <>
      <div className="container mx-auto p-4">
        <div className="w-full mb-6 bg-white shadow-lg rounded p-4">
          <div className=" flex max-lg-flex-col items-center">
            <div className="p-5 rounded w-47 max-lg-w-full">
              <SelectField
                label="Select Purchase Order"
                name="poId"
                value={payloadData.poId}
                disabled={poId}
                onChange={handleChange}
                options={dropdowns.purchaseOrders}
              />
            </div>

            <div className="p-5 rounded w-47 max-lg-w-full">
              <SelectField
                label="Select Vendor"
                name="vendorId"
                value={payloadData.vendorId}
                disabled={poId}
                onChange={handleChange}
                options={dropdowns.vendors}
              />
            </div>

            <div className="p-5 rounded w-47 max-lg-w-full">
              <SelectField
                label="Select Status"
                name="status"
                value={payloadData.status}
                disabled={poId}
                onChange={handleChange}
                options={dropdowns.status}
              />
            </div>
          </div>

          <div className="w-full flex items-center justify-between gap-4">
            <div className="w-full flex justify-center my-2">
              <div className="space-x-3">
                <button
                  onClick={() => !poId && fetchGrnList()}
                  type="button"
                  className="bg-emerald-500 text-white font-bold uppercase text-xs px-4 py-2 rounded shadow-sm hover:shadow-lg"
                >
                  <FaSearch className="w-4 h-4 inline-block mr-2" />
                  Search
                </button>
              </div>
            </div>
          </div>
        </div>

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
              {/* GRN SUMMARY */}
              {/* <div className="bg-gray-50 border rounded-lg p-4 m-4">
                <h3 className="text-sm font-semibold text-gray-700 mb-3">
                  GRN Summary
                </h3>

                <ItemTable data={[grnItems.grn]} column={grnTableColumn} />
              </div> */}

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

const SelectField = ({ label, name, value, onChange, options, disabled }) => (
  <div>
    <label className="block text-xs font-small mb-1">{label}</label>
    <select
      name={name}
      value={value || ""}
      onChange={onChange}
      disabled={disabled}
      className="border rounded-lg px-3 py-2 w-full disabled-styles"
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
                const value =
                  col.field === "createdDate"
                    ? formatDate(item[col.field])
                    : (getValue(item, col.field) ?? "___");
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
