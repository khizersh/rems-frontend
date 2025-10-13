import { MainContext } from "context/MainContext";
import React, { useContext, useEffect, useState } from "react";
import httpService from "utility/httpService";
import { TbFileExport } from "react-icons/tb";
import { EXPENSE_TYPE } from "utility/Utility";
import { comment } from "postcss";

const AddExpense = () => {
  const { notifySuccess, notifyError } = useContext(MainContext);

  const [formData, setFormData] = useState({
    amountPaid: 0,
    creditAmount: 0,
    totalAmount: "",
    vendorAccountId: 0,
    organizationAccountId: "",
    expenseTypeId: 0,
    organizationId: "",
    projectId: 0,
    expenseType: "MISCELLANEOUS",
    comments: "",
  });

  const [loading, setLoading] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [dropdowns, setDropdowns] = useState({
    projects: [],
    vendors: [],
    accounts: [],
    expenseTypes: [],
  });

  const resetForm = () => {
    setFormData({
      amountPaid: 0,
      creditAmount: 0,
      totalAmount: "",
      vendorAccountId: 0,
      organizationAccountId: "",
      expenseTypeId: 0,
      organizationId: "",
      projectId: 0,
      expenseType: "",
      comments: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  useEffect(() => {
    const paid = parseFloat(formData.amountPaid) || 0;
    const credit = parseFloat(formData.creditAmount) || 0;
    const total = paid + credit;

    setFormData((prev) => ({
      ...prev,
      totalAmount: total.toFixed(2),
    }));
  }, [formData.amountPaid, formData.creditAmount]);

  const fetchDropdownData = async () => {
    try {
      const org = JSON.parse(localStorage.getItem("organization")) || null;
      if (!org) return;

      setLoading(true);
      const [projects, vendors, accounts, expenseTypes] = await Promise.all([
        httpService.get(`/project/getAllProjectByOrg/${org.organizationId}`),
        httpService.get(`/vendorAccount/getVendorByOrg/${org.organizationId}`),
        httpService.get(
          `/organizationAccount/getAccountByOrgId/${org.organizationId}`
        ),
        httpService.get(
          `/expense/getAllExpenseTypeByOrgId/${org.organizationId}`
        ),
      ]);

      setDropdowns({
        projects: projects.data || [],
        vendors: vendors.data || [],
        accounts: accounts.data || [],
        expenseTypes: expenseTypes.data || [],
      });
      setLoading(false);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
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

      const requestBody = {
        ...formData,
        organizationId: Number(organization?.organizationId),
        amountPaid: parseFloat(formData.amountPaid || 0),
        creditAmount: parseFloat(formData.creditAmount || 0),
        totalAmount: parseFloat(formData.totalAmount || 0),
      };

      const response = await httpService.post(
        "/expense/addExpense",
        requestBody
      );
      setLoading(false);
      await notifySuccess(response.responseMessage, 4000);
      resetForm();
    } catch (err) {
      notifyError(err.message, err.data, 4000);
      setLoading(false);
    } finally {
    }
  };

  useEffect(() => {
    fetchDropdownData();
  }, []);

  const selectFields = [
    {
      label: "Select Project",
      name: "projectId",
      options: dropdowns.projects,
    },
    {
      label: "Select Vendor",
      name: "vendorAccountId",
      options: dropdowns.vendors,
    },
    {
      label: "Select Account",
      name: "organizationAccountId",
      options: dropdowns.accounts,
    },
    {
      label: "Expense Type",
      name: "expenseTypeId",
      options: dropdowns.expenseTypes,
    },
  ];

  const inputFields = [
    { label: "Amount Paid", name: "amountPaid", type: "number" },
    { label: "Credit Amount", name: "creditAmount", type: "number" },
    {
      label: "Total Amount",
      name: "totalAmount",
      type: "number",
      readOnly: true,
    },
  ];

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6  border-0">
      <div className="mb-0 px-6 py-6">
        <h6 className="text-blueGray-700 text-xl font-bold uppercase">
          Add Expense
        </h6>
      </div>

      <form
        onSubmit={handleSubmit}
        className="py-4 bg-white rounded-12 shadow-lg"
      >
        <div className="flex flex-wrap bg-white">
          <div className="w-full lg:w-12/12 mb-8">
            <div className="flex flex-wrap">
              <div className="w-full lg:w-3/12 "></div>
              <div className="w-full lg:w-6/12 px-5">
                {" "}
                <SelectField
                  label={"Select Expense Type"}
                  name={"expenseType"}
                  value={formData["expenseType"]}
                  onChange={handleChange}
                  options={EXPENSE_TYPE.map((type) => {
                    return {
                      id: type,
                      name: type,
                    };
                  })}
                />
              </div>
              <div className="w-full lg:w-3/12 "></div>
            </div>
          </div>
          {formData.expenseType == "CONSTRUCTION" ? (
            <>
              <div className="w-full lg:w-6/12 px-4 mb-3 border-right-grey">
                <div className="px-4 mb-5">
                  <h2>Expense Detail</h2>
                </div>

                <div className="flex flex-wrap bg-white">
                  {selectFields.map(({ label, name, options }) => (
                    <div key={name} className="w-full lg:w-6/12 px-4 mb-3">
                      <SelectField
                        label={label}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        options={options}
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="w-full lg:w-6/12 px-4 mb-3">
                <div className="px-4 mb-5">
                  <h2>Payment Detail</h2>
                </div>
                <div className="flex flex-wrap bg-white">
                  {inputFields.map(({ label, name, type, readOnly }) => (
                    <div key={name} className="w-full lg:w-4/12 px-4 mb-3">
                      <InputField
                        label={label}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        type={type}
                        readOnly={readOnly}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            formData.expenseType == "MISCELLANEOUS" && (
              <>
                {" "}
                <div className="w-full lg:w-6/12 px-4 mt-3 border-right-grey">
                  <SelectField
                    label={"Select Account"}
                    name={"organizationAccountId"}
                    value={formData["organizationAccountId"]}
                    onChange={handleChange}
                    options={dropdowns.accounts}
                  />
                </div>
                <div className="w-full lg:w-6/12 px-4 mt-3 border-right-grey">
                  <InputField
                    label={"Amount"}
                    name={"amountPaid"}
                    value={formData["amountPaid"]}
                    onChange={handleChange}
                    type={"number"}
                    readOnly={false}
                  />
                </div>
                <div className="w-full lg:w-12/12 px-4 mt-3 border-right-grey">
                  <InputField
                    label={"Comments"}
                    name={"comments"}
                    value={formData["comments"]}
                    onChange={handleChange}
                    type={"text"}
                    readOnly={false}
                  />
                </div>
              </>
            )
          )}

          <div className="w-full lg:w-12/12 px-4 text-right">
            <button
              type="submit"
              disabled={loading}
              className="px-4 mt-4 ml-4 bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
            >
              <TbFileExport
                className="w-5 h-5 inline-block "
                style={{ paddingBottom: "3px", paddingRight: "5px" }}
              />
              {loading ? "Submitting..." : "Add Expense"}
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

const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  readOnly = false,
}) => (
  <div>
    <label className="block text-xs font-medium text-gray-700 mb-1">
      {label}
    </label>
    <input
      type={type}
      name={name}
      value={value}
      onChange={onChange}
      readOnly={readOnly}
      className={`w-full p-2 border rounded-lg ${
        readOnly ? "bg-gray-100 cursor-not-allowed" : ""
      }`}
    />
  </div>
);

const SelectField = ({ label, name, value, onChange, options }) => (
  <div>
    <label className="block text-xs font-small mb-1">{label}</label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className="border rounded-lg px-3 py-2 w-full"
    >
      <option value="">Select</option>
      {options.map((opt) => (
        <option key={opt.id} value={opt.id}>
          {opt.name || opt.title}
        </option>
      ))}
    </select>
  </div>
);

export default AddExpense;
