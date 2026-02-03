import { MainContext } from "context/MainContext";
import React, { useContext, useEffect, useState } from "react";
import httpService from "utility/httpService";
import { TbFileExport } from "react-icons/tb";
import { EXPENSE_TYPE } from "utility/Utility";
import { IoArrowBackOutline } from "react-icons/io5";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { paymentTypes } from "utility/Utility";
import { EXPENSE_TYPE_ID } from "utility/Utility";

const AddExpense = () => {
  const { notifySuccess, notifyError, setLoading, loading } =
    useContext(MainContext);

  const [formData, setFormData] = useState({
    amountPaid: 0,
    creditAmount: 0,
    totalAmount: "",
    vendorAccountId: 0,
    organizationAccountId: "",
    expenseTypeId: 0,
    organizationId: "",
    projectId: 0,
    paymentType: "CASH",
    paymentDocNo: "",
    expenseCOAId: 0,
    paymentDocDate: new Date().toISOString().slice(0, 16),
    expenseType: "MISCELLANEOUS",
    comments: "",
    createdDate: new Date().toISOString().slice(0, 16),
  });

  const [responseMessage, setResponseMessage] = useState("");
  const [ExpenseAccountDropdown, setExpenseAccountDropdown] = useState([]);
  const [expenseAccountGroupId, setExpenseAccountGroupId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dropdowns, setDropdowns] = useState({
    projects: [],
    vendors: [],
    accounts: [],
    expenseTypes: [],
    expenseAccountGroups: [],
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
      expenseCOAId: 0,
      createdDate: new Date().toISOString().slice(0, 16),
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "expenseAccountGroupId") {
      setExpenseAccountGroupId(value);
      return;
    }
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

      const [projects, vendors, accounts, expenseTypes, expenseAccountGroups] =
        await Promise.all([
          httpService.get(`/project/getAllProjectByOrg/${org.organizationId}`),
          httpService.get(
            `/vendorAccount/getVendorByOrg/${org.organizationId}`,
          ),
          httpService.get(
            `/organizationAccount/getAccountByOrgId/${org.organizationId}`,
          ),
          httpService.get(
            `/expense/getAllExpenseTypeByOrgId/${org.organizationId}`,
          ),
          httpService.get(
            `/accounting/${org.organizationId}/getAccountGroups?accountType=${EXPENSE_TYPE_ID}`,
          ),
        ]);

      let accountList = accounts.data?.map((account) => {
        return {
          ...account,
          name: account.name + " - " + account.bankName,
        };
      });

      setDropdowns({
        projects: projects.data || [],
        vendors: vendors.data || [],
        accounts: accountList || [],
        expenseTypes: expenseTypes.data || [],
        expenseAccountGroups: expenseAccountGroups.data.data || [],
      });
      setLoading(false);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setResponseMessage("");
    setLoading(true);

    try {
      const organization =
        JSON.parse(localStorage.getItem("organization")) || null;

      if (formData.expenseType === "CONSTRUCTION") {
        formData.expenseCOAId = 0;
      }

      const requestBody = {
        ...formData,
        organizationId: Number(organization?.organizationId),
        amountPaid: parseFloat(formData.amountPaid || 0),
        creditAmount: parseFloat(formData.creditAmount || 0),
        totalAmount: parseFloat(formData.totalAmount || 0),
      };

      if (requestBody.totalAmount <= 0) {
        setSubmitting(false);
        return notifyError(
          "Expense is empty!",
          "Please enter any amount",
          4000,
        );
      }

      const response = await httpService.post(
        "/expense/addExpense",
        requestBody,
      );
      await notifySuccess(response.responseMessage, 4000);
      setSubmitting(false);
      resetForm();
      setLoading(false);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
      setLoading(false);
    } finally {
    }
  };

  // Fetch Expense Account
  const fetchExpenseAccount = async () => {
    setFormData((prev) => ({
      ...prev,
      expenseCOAId: 0,
    }));
    setExpenseAccountDropdown([]);
    setLoading(true);

    try {
      setLoading(true);
      const org = JSON.parse(localStorage.getItem("organization")) || null;
      if (!org) return;

      const response = await httpService.get(
        `/accounting/${org?.organizationId}/allChartOfAccounts?accountType=${EXPENSE_TYPE_ID}&accountGroup=${expenseAccountGroupId}`,
      );

      setExpenseAccountDropdown(response?.data?.data || []);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenseAccount();
  }, [expenseAccountGroupId]);

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
    // { label: "Created Date", name: "createdDate", type: "datetime-local" },
  ];

  const history = useHistory();

  const getPaymentTypes = () => {
    const formattedType = paymentTypes.map((type) => {
      return { id: type, name: type };
    });

    return formattedType;
  };

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

                  <div className="w-full lg:w-12/12 px-4 mt-3 ">
                    <InputField
                      label={"Narrations"}
                      name={"comments"}
                      value={formData["comments"]}
                      onChange={handleChange}
                      type={"text"}
                      readOnly={false}
                    />
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-6/12 px-4 mb-3">
                <div className="px-4 mb-5">
                  <h2>Payment Detail</h2>
                </div>
                <div className="flex flex-wrap bg-white">
                  {inputFields.map(({ label, name, type, readOnly }) => (
                    <div key={name} className="w-full lg:w-6/12 px-4 mb-3">
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
                  <div className="w-full lg:w-6/12 px-4 mb-3">
                    <SelectField
                      label={"Payment Type"}
                      name={"paymentType"}
                      value={formData["paymentType"]}
                      onChange={handleChange}
                      options={getPaymentTypes()}
                    />
                  </div>

                  {formData.paymentType == "CHEQUE" ||
                  formData.paymentType == "PAY_ORDER" ? (
                    <>
                      <div className="w-full lg:w-6/12 px-4 mb-3">
                        <InputField
                          label={
                            formData.paymentType == "CHEQUE"
                              ? "Cheque No"
                              : formData.paymentType == "PAY_ORDER"
                                ? "Pay Order No"
                                : ""
                          }
                          name={"paymentDocNo"}
                          value={formData.paymentDocNo}
                          onChange={handleChange}
                          type={"text"}
                          readOnly={false}
                        />
                      </div>
                      <div className="w-full lg:w-6/12 px-4 mb-3">
                        <InputField
                          label={
                            formData.paymentType == "CHEQUE"
                              ? "Cheque Date"
                              : formData.paymentType == "PAY_ORDER"
                                ? "Pay Order Date"
                                : ""
                          }
                          type="datetime-local"
                          name="paymentDocDate"
                          value={formData["paymentDocDate"]}
                          onChange={handleChange}
                          readOnly={false}
                        />
                      </div>
                    </>
                  ) : (
                    ""
                  )}

                  <div className="w-full lg:w-12/12 px-4 mb-3">
                    <InputField
                      label={"Created Date"}
                      type="datetime-local"
                      name="createdDate"
                      value={formData["createdDate"]}
                      onChange={handleChange}
                      readOnly={false}
                    />
                  </div>
                </div>
              </div>
            </>
          ) : (
            formData.expenseType == "MISCELLANEOUS" && (
              <>
                {" "}
                <div className="w-full lg:w-4/12 px-4 mt-3">
                  <SelectField
                    label={"Select Account"}
                    name={"organizationAccountId"}
                    value={formData["organizationAccountId"]}
                    onChange={handleChange}
                    options={dropdowns.accounts}
                  />
                </div>
                <div className="w-full lg:w-4/12 px-4 mt-3">
                  <InputField
                    label={"Amount"}
                    name={"amountPaid"}
                    value={formData["amountPaid"]}
                    onChange={handleChange}
                    type={"number"}
                    readOnly={false}
                  />
                </div>
                <div className="w-full lg:w-4/12 px-4 mt-3">
                  <SelectField
                    label={"Payment Type"}
                    name={"paymentType"}
                    value={formData["paymentType"]}
                    onChange={handleChange}
                    options={getPaymentTypes()}
                  />
                </div>
                {formData.paymentType == "CHEQUE" ||
                formData.paymentType == "PAY_ORDER" ? (
                  <>
                    <div className="w-full lg:w-4/12 px-4 mt-3">
                      <InputField
                        label={
                          formData.paymentType == "CHEQUE"
                            ? "Cheque No"
                            : formData.paymentType == "PAY_ORDER"
                              ? "Pay Order No"
                              : ""
                        }
                        name={"paymentDocNo"}
                        value={formData.paymentDocNo}
                        onChange={handleChange}
                        type={"text"}
                        readOnly={false}
                      />
                    </div>
                    <div className="w-full lg:w-4/12 px-4 mt-3">
                      <InputField
                        label={
                          formData.paymentType == "CHEQUE"
                            ? "Cheque Date"
                            : formData.paymentType == "PAY_ORDER"
                              ? "Pay Order Date"
                              : ""
                        }
                        type="datetime-local"
                        name="paymentDocDate"
                        value={formData["paymentDocDate"]}
                        onChange={handleChange}
                        readOnly={false}
                      />
                    </div>
                  </>
                ) : (
                  ""
                )}
                <div className="w-full lg:w-4/12 px-4 mt-3">
                  <InputField
                    label={"Created Date"}
                    type="datetime-local"
                    name="createdDate"
                    value={formData["createdDate"]}
                    onChange={handleChange}
                    readOnly={false}
                  />
                </div>
                {/* Expense Account Group Dropdown */}
                <div className="w-full lg:w-4/12 px-4 mt-3">
                  <SelectField
                    label={"Select Expense Account Group"}
                    name={"expenseAccountGroupId"}
                    value={expenseAccountGroupId}
                    onChange={handleChange}
                    options={dropdowns.expenseAccountGroups}
                  />
                </div>
                {/* Expense Account Dropdown */}
                <div className="w-full lg:w-4/12 px-4 mt-3">
                  <SelectField
                    label={"Select Expense Account"}
                    name={"expenseCOAId"}
                    value={formData["expenseCOAId"]}
                    onChange={handleChange}
                    options={ExpenseAccountDropdown}
                  />
                </div>
                <div className="w-full lg:w-12/12 px-4 mt-3 ">
                  <InputField
                    label={"Narrations"}
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
              disabled={loading || submitting}
              className="px-4 mt-4 ml-4 bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
            >
              <TbFileExport
                className="w-5 h-5 inline-block "
                style={{ paddingBottom: "3px", paddingRight: "5px" }}
              />
              {submitting ? "Submitting..." : "Add Expense"}
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
