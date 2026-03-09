import { MainContext } from "context/MainContext";
import React, { useContext, useState } from "react";
import { useHistory } from "react-router-dom";
import httpService from "utility/httpService";
import { IoArrowBackOutline } from "react-icons/io5";
import { FaUniversity, FaMoneyBillWave } from "react-icons/fa";

const AddOrganizationComponent = () => {
  const { notifySuccess, notifyError } = useContext(MainContext);
  const history = useHistory();

  const [formData, setFormData] = useState({
    organizationId: "",
    name: "",
    bankName: "",
    accountNo: "",
    iban: "",
    totalAmount: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const organization =
        JSON.parse(localStorage.getItem("organization")) || null;
      let requestBody = {
        ...formData,
        organizationId: Number(organization.organizationId),
        totalAmount: parseFloat(formData.totalAmount),
      };

      console.log("requestBody :: ", requestBody);

      const response = await httpService.post(
        "/organizationAccount/createAccount",
        requestBody
      );

      if (response.data) {
        setFormData({
          organizationId: "",
          name: "",
          bankName: "",
          accountNo: "",
          iban: "",
          totalAmount: "",
        });
        notifySuccess(response.responseMessage, 4000);
      }
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6">
      {/* Header */}
      <div className="mb-4 py-4">
        <h6 className="text-blueGray-700 text-lg font-bold uppercase flex items-center">
          <button
            type="button"
            onClick={() => history.goBack()}
            className="mr-3 bg-transparent"
          >
            <IoArrowBackOutline className="text-xl" style={{ color: "#64748b" }} />
          </button>
          <FaUniversity className="mr-2" style={{ color: "#6366f1" }} />
          Add Organization Account
        </h6>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 space-y-6">
          {/* Account Details Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
              <FaUniversity className="mr-2" style={{ fontSize: "14px", color: "#6366f1" }} />
              Account Details
            </h3>
            <div className="flex flex-wrap -mx-2">
              <div className="w-full lg:w-6/12 px-2 mb-3">
                <InputField
                  label="Account Name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="w-full lg:w-6/12 px-2 mb-3">
                <InputField
                  label="Bank Name"
                  name="bankName"
                  value={formData.bankName}
                  onChange={handleChange}
                />
              </div>
              <div className="w-full lg:w-6/12 px-2 mb-3">
                <InputField
                  label="Account No"
                  name="accountNo"
                  value={formData.accountNo}
                  onChange={handleChange}
                />
              </div>
              <div className="w-full lg:w-6/12 px-2 mb-3">
                <InputField
                  label="IBAN"
                  name="iban"
                  value={formData.iban}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Financial Info Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
              <FaMoneyBillWave className="mr-2" style={{ fontSize: "14px", color: "#10b981" }} />
              Financial Info
            </h3>
            <div className="flex flex-wrap -mx-2">
              <div className="w-full lg:w-6/12 px-2 mb-3">
                <InputField
                  label="Total Amount"
                  name="totalAmount"
                  type="number"
                  value={formData.totalAmount}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => history.goBack()}
              className="bg-gray-100 text-gray-700 font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-md hover:bg-gray-200 transition-all mr-3 inline-flex items-center"
            >
              <IoArrowBackOutline className="mr-1" style={{ color: "#64748b" }} />
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              <FaUniversity className="mr-1" style={{ color: "white" }} />
              {loading ? "Saving..." : "Add Account"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, type = "text" }) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full p-2 border rounded-lg text-sm"
    />
  </div>
);

export default AddOrganizationComponent;
