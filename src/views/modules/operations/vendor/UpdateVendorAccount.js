import { MainContext } from "context/MainContext";
import React, { useContext, useEffect, useState } from "react";
import { IoArrowBackCircleOutline, IoArrowBackOutline } from "react-icons/io5";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min";
import httpService from "utility/httpService";

const UpdateVendorComponent = () => {
  const { notifySuccess, notifyError } = useContext(MainContext);

  const { accountId } = useParams();

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

  useEffect(() => {
    if (accountId) fetchDetailById(accountId);
  }, []);

  const fetchDetailById = async (id) => {
    setLoading(true);

    try {
      const response = await httpService.get(`/vendorAccount/getById/${id}`);
      setFormData(response?.data);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
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
        totalAmount: parseFloat(
          Number(formData.totalAmountPaid) + Number(formData.totalCreditAmount)
        ),
      };

      const response = await httpService.post(
        "/vendorAccount/updateAccount",
        requestBody
      );

      if (response.data) {
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
      <div className="mb-0 py-6">
        <div className="flex justify-between">
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
            Update Vendor
          </h6>
        </div>
      </div>

      <div className="rounded-12 flex-auto px-4 bg-white shadow-md py-6 mt-4">
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
                label="Total Amount"
                name="totalAmount"
                type="number"
                value={
                  Number(formData.totalAmountPaid) +
                  Number(formData.totalCreditAmount)
                }
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
                {loading ? "Submitting..." : "Update Account"}
              </button>
              {responseMessage && (
                <p className="mt-2 text-sm text-gray-700">{responseMessage}</p>
              )}
            </div>
          </div>
        </form>
      </div>
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

export default UpdateVendorComponent;
