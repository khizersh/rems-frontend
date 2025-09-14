import { MainContext } from "context/MainContext";
import React, { useContext, useEffect, useState } from "react";
import httpService from "utility/httpService";
import { FaUserPlus } from "react-icons/fa";
import { useLocation } from "react-router-dom/cjs/react-router-dom.min.js";

const AddExpenseType = () => {
  const { notifySuccess, notifyError, setLoading, loading } =
    useContext(MainContext);
  const location = useLocation();
  const [formData, setFormData] = useState({
    organizationId: 0,
    name: "",
  });
  const [update, setUpdate] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, name: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const organization =
        JSON.parse(localStorage.getItem("organization")) || null;

      formData.organizationId = Number(organization?.organizationId);

      let url = "/expense/addExpenseType";
      if (update == true) {
        url = "/expense/updateExpenseType";
      }
      const response = await httpService.post(url, formData);

      notifySuccess(response.responseMessage, 4000);

      console.log("formData :: ", formData);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const fetchEditDetails = async () => {
    const queryParams = new URLSearchParams(location.search);
    const myParam = queryParams.get("eId");
    if (myParam) {
      setUpdate(true);
      try {
        const response = await httpService.get(
          `/expense/getExpenseTypeById/${myParam}`
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
    fetchEditDetails();
  }, []);

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6  border-0">
      <div className="mb-0 px-6 py-6">
        <h6 className="text-blueGray-700 text-xl font-bold uppercase">
          Add Expense Type
        </h6>
      </div>

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
              disabled={loading}
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

export default AddExpenseType;
