import { MainContext } from "context/MainContext";
import React, { useContext, useEffect, useState } from "react";
import httpService from "utility/httpService";
import { TbFileExport } from "react-icons/tb";
import { EXPENSE_TYPE } from "utility/Utility";
import { IoArrowBackOutline } from "react-icons/io5";
import { FaTools, FaReceipt, FaMoneyBillAlt, FaSitemap, FaBuilding, FaTruck, FaCreditCard, FaCalendarAlt, FaBoxOpen } from "react-icons/fa";
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
        itemList: itemList.data?.data || itemList.data || [],
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
      resetForm();
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
      updated[index] = { ...updated[index], [name]: value === "" ? "" : Number(value) };
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

  const getItemUnitSymbol = (itemId) => {
    const selectedItem = dropdowns.itemList.find(
      (listItem) => Number(listItem.id) === Number(itemId),
    );
    return selectedItem?.itemsUnit?.symbol || "";
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
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 border-0">
      {/* Header */}
      <div className="mb-4 py-4">
        <h6 className="text-blueGray-700 text-lg font-bold uppercase flex items-center">
          <button onClick={() => history.goBack()} className="mr-3">
            <IoArrowBackOutline className="text-xl" style={{ color: "#64748b" }} />
          </button>
          <FaMoneyBillAlt className="mr-2" style={{ color: "#10b981" }} />
          Add Expense
        </h6>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg border border-gray-200"
      >
        {/* Expense Type Tabs */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-200">
          <div className="flex justify-center">
            <div className="bg-gray-100 p-1 rounded-lg inline-flex" style={{ gap: "0.25rem" }}>
              {EXPENSE_TYPE.map((type) => {
                const Icon = getIconForType(type);
                const isActive = formData.expenseType === type;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleTabChange(type)}
                    className={`inline-flex items-center px-4 py-2 rounded-md transition-all duration-200 text-xs font-bold uppercase tracking-wide ${
                      isActive
                        ? "bg-white text-gray-700 shadow-sm"
                        : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <Icon
                      className="mr-2"
                      style={{ fontSize: "14px", color: isActive ? "#3b82f6" : "#94a3b8" }}
                    />
                    {type.replace("_", " ")}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-6">
          {formData.expenseType == "CONSTRUCTION" ? (
            <div className="flex flex-wrap -mx-2">
              {/* Expense Detail Section */}
              <div className="w-full lg:w-6/12 px-2 mb-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 h-full">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
                    <FaBuilding className="mr-2" style={{ fontSize: "14px", color: "#6366f1" }} />
                    Expense Details
                  </h3>
                  <div className="flex flex-wrap -mx-2">
                    {selectFields.map(({ label, name, options }) => (
                      <div key={name} className="w-full lg:w-6/12 px-2 mb-3">
                        <SelectField
                          label={label}
                          name={name}
                          value={formData[name]}
                          onChange={handleChange}
                          options={options}
                        />
                      </div>
                    ))}
                    <div className="w-full px-2 mt-2">
                      <InputField
                        label="Narrations"
                        name="comments"
                        value={formData.comments}
                        onChange={handleChange}
                        type="text"
                        readOnly={false}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Detail Section */}
              <div className="w-full lg:w-6/12 px-2 mb-4">
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 h-full">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
                    <FaCreditCard className="mr-2" style={{ fontSize: "14px", color: "#10b981" }} />
                    Payment Details
                  </h3>
                  <div className="flex flex-wrap -mx-2">
                    {inputFields.map(({ label, name, type, readOnly }) => (
                      <div key={name} className="w-full lg:w-6/12 px-2 mb-3">
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
                    <div className="w-full lg:w-6/12 px-2 mb-3">
                      <SelectField
                        label="Payment Type"
                        name="paymentType"
                        value={formData.paymentType}
                        onChange={handleChange}
                        options={getPaymentTypes()}
                      />
                    </div>
                    {(formData.paymentType === "CHEQUE" || formData.paymentType === "PAY_ORDER") && (
                      <>
                        <div className="w-full lg:w-6/12 px-2 mb-3">
                          <InputField
                            label={formData.paymentType === "CHEQUE" ? "Cheque No" : "Pay Order No"}
                            name="paymentDocNo"
                            value={formData.paymentDocNo}
                            onChange={handleChange}
                            type="text"
                            readOnly={false}
                          />
                        </div>
                        <div className="w-full lg:w-6/12 px-2 mb-3">
                          <InputField
                            label={formData.paymentType === "CHEQUE" ? "Cheque Date" : "Pay Order Date"}
                            type="datetime-local"
                            name="paymentDocDate"
                            value={formData.paymentDocDate}
                            onChange={handleChange}
                            readOnly={false}
                          />
                        </div>
                      </>
                    )}
                    <div className="w-full px-2 mb-3">
                      <InputField
                        label="Created Date"
                        type="datetime-local"
                        name="createdDate"
                        value={formData.createdDate}
                        onChange={handleChange}
                        readOnly={false}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : formData.expenseType == "MISCELLANEOUS" ? (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
                <FaReceipt className="mr-2" style={{ fontSize: "14px", color: "#8b5cf6" }} />
                Miscellaneous Expense
              </h3>
              <div className="flex flex-wrap -mx-2">
                <div className="w-full lg:w-4/12 px-2 mb-3">
                  <SelectField
                    label="Select Account"
                    name="organizationAccountId"
                    value={formData.organizationAccountId}
                    onChange={handleChange}
                    options={dropdowns.accounts}
                  />
                </div>
                <div className="w-full lg:w-4/12 px-2 mb-3">
                  <InputField
                    label="Amount"
                    name="amountPaid"
                    value={formData.amountPaid}
                    onChange={handleChange}
                    type="number"
                    readOnly={false}
                  />
                </div>
                <div className="w-full lg:w-4/12 px-2 mb-3">
                  <SelectField
                    label="Payment Type"
                    name="paymentType"
                    value={formData.paymentType}
                    onChange={handleChange}
                    options={getPaymentTypes()}
                  />
                </div>
                {(formData.paymentType === "CHEQUE" || formData.paymentType === "PAY_ORDER") && (
                  <>
                    <div className="w-full lg:w-4/12 px-2 mb-3">
                      <InputField
                        label={formData.paymentType === "CHEQUE" ? "Cheque No" : "Pay Order No"}
                        name="paymentDocNo"
                        value={formData.paymentDocNo}
                        onChange={handleChange}
                        type="text"
                        readOnly={false}
                      />
                    </div>
                    <div className="w-full lg:w-4/12 px-2 mb-3">
                      <InputField
                        label={formData.paymentType === "CHEQUE" ? "Cheque Date" : "Pay Order Date"}
                        type="datetime-local"
                        name="paymentDocDate"
                        value={formData.paymentDocDate}
                        onChange={handleChange}
                        readOnly={false}
                      />
                    </div>
                  </>
                )}
                <div className="w-full lg:w-4/12 px-2 mb-3">
                  <InputField
                    label="Created Date"
                    type="datetime-local"
                    name="createdDate"
                    value={formData.createdDate}
                    onChange={handleChange}
                    readOnly={false}
                  />
                </div>
                <div className="w-full lg:w-4/12 px-2 mb-3">
                  <SelectField
                    label="Expense Account Group"
                    name="expenseAccountGroupId"
                    value={expenseAccountGroupId}
                    onChange={handleChange}
                    options={dropdowns.expenseAccountGroups}
                  />
                </div>
                <div className="w-full lg:w-4/12 px-2 mb-3">
                  <SelectField
                    label="Expense Account"
                    name="expenseCOAId"
                    value={formData.expenseCOAId}
                    onChange={handleChange}
                    options={ExpenseAccountDropdown}
                  />
                </div>
                <div className="w-full px-2 mb-3">
                  <InputField
                    label="Narrations"
                    name="comments"
                    value={formData.comments}
                    onChange={handleChange}
                    type="text"
                    readOnly={false}
                  />
                </div>
              </div>
            </div>
          ) : formData.expenseType === "PURCHASE_ORDER" && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
                <FaMoneyBillAlt className="mr-2" style={{ fontSize: "14px", color: "#3b82f6" }} />
                Purchase Order
              </h3>
              
              {/* Main Fields */}
              <div className="flex flex-wrap -mx-2 mb-4">
                <div className="w-full lg:w-4/12 px-2 mb-3">
                  <SelectField
                    label="Select Project"
                    name="projectId"
                    value={formData.projectId}
                    onChange={handleChange}
                    options={dropdowns.projects}
                  />
                </div>
                <div className="w-full lg:w-4/12 px-2 mb-3">
                  <SelectField
                    label="Select Vendor"
                    name="vendorAccountId"
                    value={formData.vendorAccountId}
                    onChange={handleChange}
                    options={dropdowns.vendors}
                  />
                </div>
                <div className="w-full lg:w-4/12 px-2 mb-3">
                  <label className="block text-xs font-medium text-gray-700 mb-1">Total Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-gray-500 font-medium">₹</span>
                    <input
                      type="number"
                      name="totalAmount"
                      value={formData.totalAmount}
                      readOnly
                      className="w-full pl-7 p-2 border rounded-lg bg-gray-100 cursor-not-allowed font-semibold text-gray-700"
                    />
                  </div>
                </div>
              </div>

              {/* Items Section */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="text-xs font-bold text-gray-600 uppercase flex items-center">
                    <FaBoxOpen className="mr-2" style={{ fontSize: "12px", color: "#8b5cf6" }} />
                    Order Items
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddMoreItem}
                    className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-3 py-2 rounded shadow-sm hover:shadow-md transition-all inline-flex items-center"
                  >
                    <FaSitemap className="mr-1" style={{ fontSize: "10px", color: "white" }} />
                    Add Item
                  </button>
                </div>

                <div className="space-y-2">
                  {purchaseOrderItemList.length === 0 ? (
                    <div className="text-center py-6 bg-white rounded-lg border border-dashed border-gray-300">
                      <FaBoxOpen className="text-2xl mx-auto mb-2" style={{ color: "#a5b4fc" }} />
                      <p className="text-gray-500 text-sm">No items added yet</p>
                    </div>
                  ) : (
                    purchaseOrderItemList.map((item, index) => {
                      const unitSymbol = getItemUnitSymbol(item.itemsId);
                      const unitSuffix = unitSymbol ? ` /${unitSymbol}` : "";
                      return (
                        <div
                          key={index}
                          className="bg-white rounded-lg p-3 border border-gray-200 hover:shadow-sm transition-shadow"
                        >
                          <div className="flex items-end flex-wrap" style={{ gap: "0.75rem" }}>
                            <div className="flex-1 min-w-0" style={{ minWidth: "100px" }}>
                              <SelectField
                                label="Item"
                                name="itemsId"
                                value={item.itemsId}
                                onChange={(e) => handleItemChange(e, index)}
                                options={dropdowns.itemList}
                              />
                            </div>
                            <div className="w-24">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Rate{unitSuffix}</label>
                              <input
                                onChange={(e) => handleItemChange(e, index)}
                                name="rate"
                                value={item.rate}
                                type="number"
                                placeholder="0"
                                className="w-full p-2 border rounded-lg text-sm"
                              />
                            </div>
                            <div className="w-24">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Qty{unitSuffix}</label>
                              <input
                                onChange={(e) => handleItemChange(e, index)}
                                name="quantity"
                                value={item.quantity}
                                type="number"
                                placeholder="0"
                                className="w-full p-2 border rounded-lg text-sm"
                              />
                            </div>
                            <div className="w-24">
                              <label className="block text-xs font-medium text-gray-700 mb-1">Subtotal</label>
                              <div className="p-2 bg-green-50 border border-green-200 rounded-lg text-sm font-semibold text-green-700">
                                ₹{(item.rate * item.quantity).toLocaleString()}
                              </div>
                            </div>
                            <button
                              onClick={() => handleItemDelete(index)}
                              type="button"
                              className="hover:bg-red-50 rounded p-1.5 transition-all mt-7"
                              title="Remove Item"
                            >
                              <MdDeleteForever style={{ fontSize: "20px", color: "#ef4444" }} />
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
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
              disabled={loading || submitting}
              className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              <TbFileExport className="mr-1" style={{ color: "white" }} />
              {submitting ? "Submitting..." : "Add Expense"}
            </button>
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
