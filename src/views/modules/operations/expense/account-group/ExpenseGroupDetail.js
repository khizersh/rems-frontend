import React, { useEffect, useState, useContext } from "react";
import httpService from "../../../../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../../../../components/table/DynamicTableComponent.js";
import { useHistory, useParams } from "react-router-dom/cjs/react-router-dom.min.js";
import { FaDownload } from "react-icons/fa6";
import { RxCross2 } from "react-icons/rx";
import { FaEye, FaLayerGroup, FaPen, FaTrashAlt, FaUserPlus } from "react-icons/fa";
import { EXPENSE_TYPE_ID } from "utility/Utility.js";

export default function ExpenseGroupDetail() {
    const {
        loading,
        setLoading,
        notifyError,
        notifySuccess,
        backdrop,
        setBackdrop,
    } = useContext(MainContext);
    const [expenseGroupDetail, setExpenseGroupDetail] = useState([]);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [totalElements, setTotalElements] = useState(0);
    const pageSize = 10;
    const [expenseGroupName, setExpenseGroupName] = useState('');
    const { expenseGroupId } = useParams();
    const [submitting, setSubmitting] = useState(false);
    const [update, setUpdate] = useState(false);
    const [expenseTypeId, setExpenseTypeId] = useState(null);
    const [formData, setFormData] = useState({
        accountGroupId: expenseGroupId,
        name: "",
    });

    const history = useHistory();

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, name: e.target.value }));
    };

    // Form Submit Add & Update
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitting(true);

        try {
            let data = { ...formData, name: formData.name.trim() };

            const organization =
                JSON.parse(localStorage.getItem("organization")) || null;

            let url = `/accounting/${organization.organizationId}/expenseChartOfAccount`;
            if (update == true) {
                url = `/accounting/1/expenseChartOfAccount?coaId=${expenseTypeId}`
            }

            const response = update ? (await httpService.put(url, { name: data.name })) : (await httpService.post(url, data));

            notifySuccess(response.responseMessage, 4000);

            setFormData((prev) => ({ ...prev, name: "" }));

            await fetchExpenseGroupDetail();
            setUpdate(false);
            setExpenseTypeId(null);
        } catch (err) {
            notifyError(err.message, err.data, 4000);
        } finally {
            setLoading(false);
            setSubmitting(false);
        }
    };

    // Fetching Expense Group Details By Id 
    const fetchExpenseGroupDetail = async () => {
        setLoading(true);
        try {
            const organization =
                JSON.parse(localStorage.getItem("organization")) || null;

            const response = await httpService.get(
                `/accounting/${organization?.organizationId}/allChartOfAccounts?accountType=${EXPENSE_TYPE_ID}&accountGroup=${expenseGroupId}`
            );

            setExpenseGroupDetail(response?.data?.data || []);
        } catch (err) {
            notifyError(err.message, err.data, 4000);
        } finally {
            setLoading(false);
        }
    };

    // Fetch Expense Group Name 
    const fetchExpenseGroupName = async () => {
        if (expenseGroupId) {
            try {
                const organization =
                    JSON.parse(localStorage.getItem("organization")) || null;
                const response = await httpService.get(
                    `/accounting/getAccountGroupById/${expenseGroupId}`
                );

                setExpenseGroupName(response?.data?.name);
            } catch (err) {
                notifyError(err.message, err.data, 4000);
            } finally {
                setLoading(false);
            }
        }
    };

    // Fetch Edit Details 
    const fetchEditDetails = async () => {
        if (expenseTypeId) {
            setUpdate(true);
            setLoading(true);
            try {
                const response = await httpService.get(
                    `/accounting/chartOfAccount/getById/${expenseTypeId}`
                );

                setFormData((prev) => ({ ...prev, name: response.data.name }));
            } catch (err) {
                notifyError(err.message, err.data, 4000);
            } finally {
                setLoading(false);
            }
        }
    };


    useEffect(() => {
        fetchExpenseGroupDetail();
        fetchExpenseGroupName();
    }, []);

    useEffect(() => {
        fetchEditDetails();
    }, [expenseTypeId]);

    const tableColumns = [
        { header: "Expense Group Detail", field: "name" },
        { header: "Created Date", field: "createdDate" },
    ];

    const handleEdit = ({ id }) => {
        setExpenseTypeId(id);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = () => {
        // Implement delete logic
    };

    const handleView = ({ id }) => {
        // history.push(`/dashboard/expense-group-detail/${id}`)
    };

    const actions = [
        // {
        //     icon: FaEye,
        //     onClick: handleView,
        //     title: "View Detail",
        //     className: "text-green-600",
        // },
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

    return (
        <>
            <div>
                {/* Form  */}
                <div className="my-4">
                    <form
                        onSubmit={handleSubmit}
                        className="py-4 bg-white rounded-12 shadow-lg"
                    >
                        <div className="flex flex-wrap bg-white">
                            <div className="w-full lg:w-6/12 px-4 mb-3">
                                <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                                    {expenseGroupName} Group
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full"
                                    placeholder={`Enter ${expenseGroupName}`}
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
                        fetchDataFunction={fetchExpenseGroupDetail}
                        setPage={setPage}
                        page={page}
                        data={expenseGroupDetail}
                        columns={tableColumns}
                        pageSize={pageSize}
                        totalPages={totalPages}
                        totalElements={totalElements}
                        loading={loading}
                        title="Expense Group Detail"
                        actions={actions}
                    />
                </div>
            </div>
        </>
    );
}
