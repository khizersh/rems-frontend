import { MainContext } from "context/MainContext";
import React, { useContext, useState } from "react";
import httpService from "utility/httpService";

const AddVendorComponent = () => {
  const { notifySuccess, notifyError } = useContext(MainContext);

  const [formData, setFormData] = useState({
    organizationId: "",
    name: "",
    totalAmountPaid: "",
    totalCreditAmount: "",
    totalBalanceAmount: "",
    totalAmount: "",
  });

  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");

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
    setResponseMessage("");

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
        "/vendorAccount/createAccount",
        requestBody
      );

      if (response.data) {
        setFormData({
          organizationId: "",
          name: "",
          totalAmountPaid: "",
          totalCreditAmount: "",
          totalBalanceAmount: "",
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
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg border-0">
      <div className="rounded-t bg-white mb-0 px-6 py-6">
        <div className="flex justify-between">
          <h6 className="text-blueGray-700 text-xl font-bold uppercase">
            Add Vendor Account
          </h6>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap bg-white">
          <div className="w-full lg:w-6/12 px-4 mb-3">
            <InputField
              type="text"
              label="Account Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="w-full lg:w-6/12 px-4 mb-3">
            <InputField
              type="number"
              label="Total Amount Paid"
              name="totalAmountPaid"
              value={formData.totalAmountPaid}
              onChange={handleChange}
            />
          </div>

          <div className="w-full lg:w-6/12 px-4 mb-3">
            <InputField
              type="number"
              label="Total Credit Amount"
              name="totalCreditAmount"
              value={formData.totalCreditAmount}
              onChange={handleChange}
            />
          </div>

          <div className="w-full lg:w-6/12 px-4 mb-3">
            <InputField
              type="number"
              label="Total Balance Amount"
              name="totalBalanceAmount"
              value={formData.totalBalanceAmount}
              onChange={handleChange}
            />
          </div>
          <div className="w-full lg:w-6/12 px-4 mb-3">
            <InputField
              label="Total Amount"
              name="totalAmount"
              type="number"
              value={formData.totalAmount}
              onChange={handleChange}
            />
          </div>
        </div>
        <div className="flex flex-wrap bg-white">
          <div className="w-full lg:w-6/12 px-4 mb-3">
            <button
              type="submit"
              disabled={loading}
              className="px-4 mt-4 bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
            >
              {loading ? "Submitting..." : "Add Account"}
            </button>
            {responseMessage && (
              <p className="mt-2 text-sm text-gray-700">{responseMessage}</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

const InputField = ({ label, name, value, onChange, type = "text" }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      className="w-full p-2 border rounded"
    />
  </div>
);

export default AddVendorComponent;
