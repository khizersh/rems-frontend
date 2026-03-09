import { MainContext } from "context/MainContext";
import React, { useContext, useState } from "react";
import { IoArrowBackOutline } from "react-icons/io5";
import { FaTruck, FaCreditCard } from "react-icons/fa";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
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
        totalAmount:
          Number(formData.totalAmountPaid) + Number(formData.totalCreditAmount),
      };

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

  const history = useHistory();

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 border-0">
      {/* Header */}
      <div className="mb-4 py-4">
        <h6 className="text-blueGray-700 text-lg font-bold uppercase flex items-center">
          <button type="button" onClick={() => history.goBack()} className="mr-2">
            <IoArrowBackOutline className="text-xl" style={{ color: "#64748b" }} />
          </button>
          <FaTruck className="mr-2" style={{ color: "#10b981" }} />
          Add Vendor
        </h6>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 space-y-6">
          {/* Vendor Details Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
              <FaTruck className="mr-2" style={{ fontSize: "14px", color: "#10b981" }} />
              Vendor Details
            </h3>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-6/12 px-2 mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Account Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Financial Details Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
              <FaCreditCard className="mr-2" style={{ fontSize: "14px", color: "#8b5cf6" }} />
              Financial Details
            </h3>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-6/12 px-2 mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Total Amount Paid
                </label>
                <input
                  type="number"
                  name="totalAmountPaid"
                  value={formData.totalAmountPaid}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg text-sm"
                />
              </div>
              <div className="w-full lg:w-6/12 px-2 mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Total Credit Amount
                </label>
                <input
                  type="number"
                  name="totalCreditAmount"
                  value={formData.totalCreditAmount}
                  onChange={handleChange}
                  className="w-full p-2 border rounded-lg text-sm"
                />
              </div>
              <div className="w-full lg:w-6/12 px-2 mb-3">
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Total Amount
                </label>
                <input
                  type="number"
                  name="totalAmount"
                  value={
                    Number(formData.totalAmountPaid) +
                    Number(formData.totalCreditAmount)
                  }
                  readOnly
                  className="w-full p-2 border rounded-lg text-sm bg-gray-100 cursor-not-allowed"
                />
              </div>
            </div>
          </div>

          {responseMessage && (
            <p className="text-sm text-gray-700">{responseMessage}</p>
          )}

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
              <FaTruck className="mr-1" style={{ color: "white" }} />
              {loading ? "Saving..." : "Add Vendor"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default AddVendorComponent;
