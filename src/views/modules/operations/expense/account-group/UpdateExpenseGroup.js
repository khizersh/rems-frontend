import { MainContext } from "context/MainContext";
import React, { useContext, useEffect, useState } from "react";
import httpService from "utility/httpService";
import { FaUserPlus } from "react-icons/fa";
import {
    useHistory,
    useParams,
} from "react-router-dom/cjs/react-router-dom.min.js";
import { IoArrowBackOutline } from "react-icons/io5";
import { EXPENSE_TYPE_ID } from "utility/Utility";

const UpdateExpenseGroup = () => {
    const { notifySuccess, notifyError, setLoading, loading } =
        useContext(MainContext);
    const [formData, setFormData] = useState({
        accountTypeId: EXPENSE_TYPE_ID,
        name: "",
    });

    const { expenseGroupId } = useParams()

    const handleChange = (e) => {
        setFormData((prev) => ({ ...prev, name: e.target.value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            let data = {...formData, name: formData.name.trim()};
            const organization =
                JSON.parse(localStorage.getItem("organization")) || null;

            let url = `/accounting/${organization?.organizationId}/accountGroup?groupId=${expenseGroupId}`;

            const response = await httpService.put(url, data);

            notifySuccess(response.responseMessage, 4000);

            setFormData((prev) => ({ ...prev, name: "" }));
        } catch (err) {
            notifyError(err.message, err.data, 4000);
        } finally {
            setLoading(false);
        }
    };

    const fetchEditDetails = async () => {
        if (expenseGroupId) {
            setLoading(true);
            try {
                const organization =
                    JSON.parse(localStorage.getItem("organization")) || null;
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
        fetchEditDetails();
    }, []);

    const history = useHistory();
    return (
        <div className="relative flex flex-col min-w-0 break-words w-full mb-6  border-0">
            <div className="mb-0 py-6">
                <h6 className="text-blueGray-700 text-xl font-bold uppercase">
                    <span>
                        <button className="">
                            <IoArrowBackOutline
                                onClick={() => history.goBack()}
                                className="back-button-icon inline-block back-button"
                                style={{
                                    paddingBottom: "3px",
                                    paddingRight: "7px",
                                    marginBottom: "3px",
                                }}
                            />
                        </button>
                    </span>
                    Update Expense Group
                </h6>
            </div>

            <form
                onSubmit={handleSubmit}
                className="py-4 bg-white rounded-12 shadow-lg"
            >
                <div className="flex flex-wrap bg-white">
                    <div className="w-full lg:w-6/12 px-4 mb-3">
                        <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                            Update Expense Group Type
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
                            {loading ? "Saving..." : "Add"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default UpdateExpenseGroup;
