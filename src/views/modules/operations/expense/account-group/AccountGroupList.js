import React, { useEffect, useState, useContext } from "react";
import httpService from "../../../../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../../../../components/table/DynamicTableComponent.js";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min.js";
import { FaEye, FaPen, FaUserPlus } from "react-icons/fa";
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
  const [submitting, setSubmitting] = useState(false);
  const [update, setUpdate] = useState(false);
  const [expenseGroupId, setExpenseGroupId] = useState(null);
  const [formData, setFormData] = useState({
    accountTypeId: EXPENSE_TYPE_ID,
    name: "",
  });

  const history = useHistory();

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, name: e.target.value }));
  };

  // Form Submit Add & Update
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      let data = { ...formData, name: formData.name.trim() };

      const organization =
        JSON.parse(localStorage.getItem("organization")) || null;
      if (!organization) return;
      setLoading(true);
      setSubmitting(true);

      let url = `/accounting/${organization.organizationId}/accountGroup?accountType=${EXPENSE_TYPE_ID}`;
      if (update) {
        url = `/accounting/${organization?.organizationId}/accountGroup?groupId=${expenseGroupId}`;
      }

      const response = update ? (await httpService.put(url, data)) : (await httpService.post(url, data));

      notifySuccess(response.responseMessage, 4000);

      setFormData((prev) => ({ ...prev, name: "" }));

      await fetchAccountGroup();
      setUpdate(false);
      setExpenseGroupId(null);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  // Fetch Expense Group List
  const fetchAccountGroup = async () => {
    try {
      const organization =
        JSON.parse(localStorage.getItem("organization")) || null;
      if (!organization) return;
      setLoading(true);

      const response = await httpService.get(
        `/accounting/${organization.organizationId}/getAccountGroups?accountType=${EXPENSE_TYPE_ID}`,
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

  // Fetch Expense Group Type Name for Edit
  const fetchExpenseGroupTypeName = async () => {
    if (expenseGroupId) {
      setUpdate(true);
      try {
        const organization =
          JSON.parse(localStorage.getItem("organization")) || null;
        if (!organization) return;
        setLoading(true);

        const response = await httpService.get(
          `/accounting/getAccountGroupById/${expenseGroupId}`
        );

        setFormData((prev) => ({ ...prev, name: response?.data?.name }));
      } catch (err) {
        notifyError(err.message, err.data, 4000);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchExpenseGroupTypeName();
  }, [expenseGroupId]);

  const tableColumns = [
    { header: "Expense Group", field: "name" },
    { header: "Created Date", field: "createdDate" },
  ];

  const handleEdit = ({ id }) => {
    setExpenseGroupId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = () => {
    // Implement delete logic
  };

  const handleView = ({ id }) => {
    history.push(`/dashboard/expense-group-detail/${id}`);
  };

  const actions = [
    {
      icon: FaEye,
      onClick: handleView,
      title: "Expense Accounts",
      className: "text-green-600",
    },
    {
      icon: FaPen,
      onClick: handleEdit,
      title: "Edit",
      className: "yellow",
    },
  ];

  return (
    <>
      <div>
        {/* Form  */}
        <div className="relative flex flex-col min-w-0 break-words w-full mb-6 my-4 border-0">
          <form
            onSubmit={handleSubmit}
            className="py-4 bg-white rounded-12 shadow-lg"
          >
            <div className="flex flex-wrap bg-white">
              <div className="w-full lg:w-6/12 px-4 mb-3">
                <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                  Expense Group Type
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full"
                  placeholder="Enter Expense Group Type"
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
                  {update ?
                    (submitting ? "Updating..." : "Update") : (submitting ? "Saving..." : "Add")}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Table  */}
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
          />
        </div>
      </div>
    </>
  );
}
