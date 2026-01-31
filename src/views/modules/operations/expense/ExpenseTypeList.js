import React, { useEffect, useState, useContext } from "react";
import httpService from "../../../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../../../components/table/DynamicTableComponent.js";
import {
  useHistory,
  useLocation,
} from "react-router-dom/cjs/react-router-dom.min.js";
import { FaDownload } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { FaLayerGroup, FaPen, FaTrashAlt, FaUserPlus } from "react-icons/fa";
import { IoArrowBackOutline } from "react-icons/io5";

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
  const [pageSize, setPageSize] = useState(10);
  const [formData, setFormData] = useState({
    organizationId: 0,
    name: "",
  });

  const [update, setUpdate] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expenseTypeId, setExpenseTypeId] = useState(null);

  const history = useHistory();

  const fetchExpenseTypeList = async (pageNo = page) => {
    setLoading(true);
    try {
      const organization =
        JSON.parse(localStorage.getItem("organization")) || null;

      const payload = {
        id: organization.organizationId,
        page: page,
        size: pageSize,
        sortBy: "createdDate",
        sortDir: "asc",
      };

      const response = await httpService.post(
        "/expense/getAllExpenseTypeByOrgId",
        payload,
      );

      setExpenseTypeList(response?.data?.content || []);
      setTotalPages(response?.data?.totalPages || 0);
      setTotalElements(response?.data?.totalElements || 0);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, name: e.target.value });
  };

  // Form Submit Add & Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSubmitting(true);

    try {
      const organization =
        JSON.parse(localStorage.getItem("organization")) || null;

      formData.organizationId = Number(organization?.organizationId);
      let data = { ...formData, name: formData.name.trim() };

      let url = "/expense/addExpenseType";
      if (update == true) {
        url = "/expense/updateExpenseType";
      }
      const response = await httpService.post(url, data);

      notifySuccess(response.responseMessage, 4000);

      setFormData({
        organizationId: 0,
        name: "",
      });
      await fetchExpenseTypeList();
      setUpdate(false);
      setExpenseTypeId(null);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Fetch Edit Details
  const fetchEditDetails = async () => {
    if (expenseTypeId) {
      setUpdate(true);
      setLoading(true);
      try {
        const response = await httpService.get(
          `/expense/getExpenseTypeById/${expenseTypeId}`,
        );

        setFormData({ name: response.data.name, id: response.data.id });
      } catch (err) {
        notifyError(err.message, err.data, 4000);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchExpenseTypeList();
  }, [page, pageSize]);

  useEffect(() => {
    fetchEditDetails();
  }, [expenseTypeId]);

  const tableColumns = [
    { header: "Expense Type", field: "name" },
    { header: "Created By", field: "createdBy" },
    { header: "Updated By", field: "updatedBy" },
    { header: "Created Date", field: "createdDate" },
    { header: "Updated Date", field: "updatedDate" },
  ];

  const handleEdit = ({ id }) => {
    setExpenseTypeId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = () => {
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

  return (
    <>
      <div>
        {/* Add Form  */}
        <div className="relative flex flex-col min-w-0 break-words w-full mb-6  border-0 my-4">
          <form
            onSubmit={handleSubmit}
            className="py-4 bg-white rounded-12 shadow-lg"
          >
            <div className="flex flex-wrap bg-white">
              <div className="w-full lg:w-6/12 px-4 mb-3">
                <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                  Expense Type
                </label>
                <input
                  type="text"
                  name="nationalId"
                  value={formData.name}
                  onChange={handleChange}
                  className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full"
                  placeholder="Enter type"
                />
              </div>
              <div className="w-full lg:w-6/12 px-4 mb-3">
                <button
                  type="submit"
                  disabled={loading || !formData.name.trim()}
                  className="px-4 mt-7 bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
                >
                  <FaUserPlus
                    className="w-5 h-5 inline-block "
                    style={{ paddingBottom: "3px", paddingRight: "5px" }}
                  />

                  {update
                    ? submitting
                      ? "Updating..."
                      : "Update"
                    : submitting
                      ? "Saving..."
                      : "Add"}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Table  */}
        <div>
          <DynamicTableComponent
            fetchDataFunction={fetchExpenseTypeList}
            setPage={setPage}
            page={page}
            data={expenseTypeList}
            columns={tableColumns}
            pageSize={pageSize}
            setPageSize={setPageSize}
            totalPages={totalPages}
            totalElements={totalElements}
            loading={loading}
            title="Expense Type"
            actions={actions}
          />
        </div>
      </div>
    </>
  );
}
