import { MainContext } from "context/MainContext";
import React, { useContext, useState } from "react";
import httpService from "utility/httpService";
import { RiFolderReceivedFill } from "react-icons/ri";

const AddOrganizationComponent = () => {
  const { notifySuccess, notifyError } = useContext(MainContext);

  const [formData, setFormData] = useState({
    organizationId: "",
    name: "",
    bankName: "",
    accountNo: "",
    iban: "",
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
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg border-0">
      <div className="rounded-t bg-white mb-0 px-6 py-6">
        <div className="flex justify-between">
          <h6 className="text-blueGray-700 text-xl font-bold uppercase">
            Add Organization Account
          </h6>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-wrap bg-white">
          <div className="w-full lg:w-6/12 px-4 mb-3">
            <InputField
              label="Account Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
          <div className="w-full lg:w-6/12 px-4 mb-3">
            <InputField
              label="Bank Name"
              name="bankName"
              value={formData.bankName}
              onChange={handleChange}
            />
          </div>

          <div className="w-full lg:w-6/12 px-4 mb-3">
            <InputField
              label="Account No"
              name="accountNo"
              value={formData.accountNo}
              onChange={handleChange}
            />
          </div>

          <div className="w-full lg:w-6/12 px-4 mb-3">
            <InputField
              label="IBAN"
              name="iban"
              value={formData.iban}
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
              className="px-4 mt-4 bg-emerald-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
            >
              <RiFolderReceivedFill
                className="w-5 h-5 inline-block "
                style={{ paddingBottom: "3px", paddingRight: "5px" }}
              />

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

export default AddOrganizationComponent;
