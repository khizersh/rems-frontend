import { MainContext } from "context/MainContext";
import React, { useContext, useEffect, useState } from "react";
import httpService from "utility/httpService";
import { TbFileExport } from "react-icons/tb";
import { EXPENSE_TYPE } from "utility/Utility";
import { IoArrowBackOutline } from "react-icons/io5";
import { FaTools, FaReceipt, FaMoneyBillAlt, FaSitemap } from "react-icons/fa";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { paymentTypes } from "utility/Utility";
import { EXPENSE_TYPE_ID } from "utility/Utility";
import { MdDeleteForever } from "react-icons/md";

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
  const [purchaseOrderItemList, setPurchaseOrderItemList] = useState([
    {
      itemsId: "",
      rate: 0,
      quantity: 0,
    },
  ]);
  const [dropdowns, setDropdowns] = useState({
    projects: [],
    vendors: [],
    accounts: [],
    expenseTypes: [],
    expenseAccountGroups: [],
    itemList: [],
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
    setPurchaseOrderItemList([
      {
        itemsId: 0,
        rate: 0,
        quantity: 0,
      },
    ]);
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

  const handleTabChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      expenseType: type,
      // reset expenseCOAId for construction to match existing submit logic
      expenseCOAId: type === "CONSTRUCTION" ? 0 : prev.expenseCOAId,
    }));
  };

  const getIconForType = (type) => {
    if (type === "CONSTRUCTION") return FaTools;
    if (type === "MISCELLANEOUS") return FaReceipt;
    return FaMoneyBillAlt;
  };

  useEffect(() => {
    if (formData.expenseType === "CONSTRUCTION") {
      const paid = parseFloat(formData.amountPaid) || 0;
      const credit = parseFloat(formData.creditAmount) || 0;
      const total = paid + credit;

      setFormData((prev) => ({
        ...prev,
        totalAmount: total.toFixed(2),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        totalAmount: prev.totalAmount,
      }));
    }
  }, [formData.amountPaid, formData.creditAmount, formData.expenseType]);

  const fetchDropdownData = async () => {
    try {
      const org = JSON.parse(localStorage.getItem("organization")) || null;
      if (!org) return;

      setLoading(true);

      const [
        projects,
        vendors,
        accounts,
        expenseTypes,
        expenseAccountGroups,
        itemList,
      ] = await Promise.all([
        httpService.get(`/project/getAllProjectByOrg/${org.organizationId}`),
        httpService.get(`/vendorAccount/getVendorByOrg/${org.organizationId}`),
        httpService.get(
          `/organizationAccount/getAccountByOrgId/${org.organizationId}`,
        ),
        httpService.get(
          `/expense/getAllExpenseTypeByOrgId/${org.organizationId}`,
        ),
        httpService.get(
          `/accounting/${org.organizationId}/getAccountGroups?accountType=${EXPENSE_TYPE_ID}`,
        ),
        httpService.get(`/items/${org.organizationId}/list`),
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
        itemList: itemList.data || [],
      });
      setLoading(false);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const organization =
        JSON.parse(localStorage.getItem("organization")) || null;
        if (!organization) return;

      setSubmitting(true);
      setResponseMessage("");
      setLoading(true);

      if (formData.expenseType === "CONSTRUCTION") {
        formData.expenseCOAId = 0;
      }

      let requestBody = {
        ...formData,
        organizationId: Number(organization?.organizationId),
        amountPaid: parseFloat(formData.amountPaid || 0),
        creditAmount: parseFloat(formData.creditAmount || 0),
        totalAmount: parseFloat(formData.totalAmount || 0),
      };

      if (requestBody.totalAmount <= 0) {
        setSubmitting(false);
        setLoading(false);
        return notifyError(
          "Expense is empty!",
          "Please enter any amount",
          4000,
        );
      }

      let itemsSelected = purchaseOrderItemList.every((item) => item.itemsId);

      if (
        (formData.expenseType === "CONSTRUCTION" ||
          formData.expenseType === "PURCHASE_ORDER") &&
        (!formData.vendorAccountId || !formData.projectId || !itemsSelected)
      ) {
        setSubmitting(false);
        setLoading(false);
        return notifyError(
          "Missing fields",
          "Please select project, vendor and items",
          4000,
        );
      }

      if (formData.expenseType === "PURCHASE_ORDER") {
        requestBody = {
          orgId: Number(organization?.organizationId),
          projectId: formData.projectId,
          vendorId: formData.vendorAccountId,
          totalAmount: formData.totalAmount,
          purchaseOrderItemList,
        };
      }

      const response =
        formData.expenseType !== "PURCHASE_ORDER"
          ? await httpService.post("/expense/addExpense", requestBody)
          : await httpService.post("/purchaseOrder/createPO", requestBody);
      await notifySuccess(response.responseMessage, 4000);
      // setSubmitting(false);
      resetForm();
      // setLoading(false);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
      setSubmitting(false);
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

  useEffect(() => {
    if (formData.expenseType === "PURCHASE_ORDER") {
      const poTotal = purchaseOrderItemList.reduce(
        (sum, item) => sum + item.rate * item.quantity,
        0,
      );
      setFormData((prev) => ({
        ...prev,
        totalAmount: poTotal,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        totalAmount: prev.totalAmount,
      }));
    }
  }, [purchaseOrderItemList, formData.expenseType]);

  const handleItemChange = (e, index) => {
    const { name, value } = e.target;

    setPurchaseOrderItemList((prev) => {
      let updated = [...prev];
      updated[index] = { ...updated[index], [name]: Number(value) };
      return updated;
    });
  };

  const handleAddMoreItem = () => {
    setPurchaseOrderItemList((prev) => [
      ...prev,
      {
        itemsId: "",
        quantity: 0,
        rate: 0,
      },
    ]);
  };

  const handleItemDelete = (index) => {
    setPurchaseOrderItemList((prev) => prev.filter((_, i) => i !== index));
  };

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
                <div>
                  <label className="block text-xs font-small mb-1">
                    Expense Type
                  </label>
                  <div className="flex space-x-3 max-sm-flex-col g-2">
                    {EXPENSE_TYPE.map((type) => {
                      const Icon = getIconForType(type);
                      return (
                        <button
                          key={type}
                          type="button"
                          onClick={() => handleTabChange(type)}
                          className={`w-36 flex items-center justify-center space-x-2 px-3 py-2 mx-2 rounded-lg border transform hover:-translate-y-1 transition-all duration-200 ${
                            formData.expenseType === type
                              ? "bg-lightBlue-500 text-white border-lightBlue-600 scale-105 shadow-md"
                              : "bg-white text-gray-700"
                          }`}
                        >
                          <Icon
                            className={`w-4 h-4 ${formData.expenseType === type ? "text-white" : "text-gray-600"}`}
                          />
                          <span className="text-sm font-medium">{type}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
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
          ) : formData.expenseType == "MISCELLANEOUS" ? (
            <>
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
          ) : (
            formData.expenseType == "PURCHASE_ORDER" && (
              <>
                {/* PURCHASE ORDER FORM */}

                {/* Project */}
                <div className="w-full lg:w-4/12 px-4 mt-3">
                  <SelectField
                    label="Select Project"
                    name="projectId"
                    value={formData.projectId}
                    onChange={handleChange}
                    options={dropdowns.projects}
                  />
                </div>

                {/* Vendor */}
                <div className="w-full lg:w-4/12 px-4 mt-3">
                  <SelectField
                    label="Select Vendor"
                    name="vendorAccountId"
                    value={formData.vendorAccountId}
                    onChange={handleChange}
                    options={dropdowns.vendors}
                  />
                </div>

                {/* Total Amount */}
                <div className="w-full lg:w-4/12 px-4 mt-3">
                  <InputField
                    readOnly={true}
                    label="Total Amount"
                    name="totalAmount"
                    type="number"
                    value={formData.totalAmount}
                    onChange={handleChange}
                  />
                </div>

                {/* Item Form Listing  */}
                <div className="w-full">
                  <hr className="mt-6 border-b-1 border-blueGray-300 w-95-p mx-auto" />
                  <div className="w-full lg:w-12/12 px-12 mb-5 flex justify-end items-center">
                    <button
                      type="button"
                      onClick={handleAddMoreItem}
                      className="px-4 mt-4 ml-4 bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
                    >
                      <FaSitemap
                        className="w-5 h-5 inline-block "
                        style={{ paddingBottom: "3px", paddingRight: "5px" }}
                      />
                      Add Item
                    </button>
                  </div>

                  <div className="px-4 w-full">
                    {purchaseOrderItemList.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-end justify-between items-center max-lg-flex-col"
                      >
                        {/* ITEM DROPDOWN */}
                        <div className="w-full lg:w-3/12 px-4 mb-4">
                          <SelectField
                            label="Select Item"
                            name="itemsId"
                            value={item.itemsId}
                            onChange={(e) => handleItemChange(e, index)}
                            options={dropdowns.itemList}
                          />
                        </div>

                        {/* RATE */}
                        <div className="w-full lg:w-3/12 px-4 mb-4">
                          <label className="block text-blueGray-500 text-xs font-bold mb-1">
                            Rate
                          </label>
                          <input
                            onChange={(e) => handleItemChange(e, index)}
                            name="rate"
                            value={item.rate}
                            type="number"
                            placeholder="0"
                            className="w-full p-2 border rounded-lg bg-gray-100"
                          />
                        </div>

                        {/* QUANTITY */}
                        <div className="w-full lg:w-3/12 px-4 mb-4">
                          <label className="block text-blueGray-500 text-xs font-bold mb-1">
                            Quantity
                          </label>
                          <input
                            onChange={(e) => handleItemChange(e, index)}
                            name="quantity"
                            value={item.quantity}
                            type="number"
                            placeholder="0"
                            className="w-full p-2 border rounded-lg bg-gray-100"
                          />
                        </div>

                        {/* Delete Item  */}
                        <div className="">
                          <button
                            onClick={() => handleItemDelete(index)}
                            type="button"
                            className=" text-red-500 outline-none focus:outline-none ease-linear transition-all duration-150"
                          >
                            <MdDeleteForever
                              style={{ fontSize: "25px", marginTop: "7px" }}
                            />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
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
