import React, { useState, useEffect, useContext } from "react";
import { FaLayerGroup, FaLongArrowAltRight } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import httpService from "utility/httpService";
import { MainContext } from "context/MainContext";

const PaymentModalFundTransfer = ({ isOpen, onClose, formTitle = "Form", refresh }) => {
  const { setLoading, notifyError, notifySuccess } = useContext(MainContext);
  const [fromAccountAmount, setFromAccountAmount] = useState(null);
  const [toAccountAmount, setToAccountAmount] = useState(null);
  const [originalFromAccountAmount, setOriginalFromAccountAmount] = useState(0);
  const [originalToAccountAmount, setOriginalToAccountAmount] = useState(0);
  const [accountList, setAccountList] = useState([]);
  const [accountListTo, setAccountListTo] = useState([]);
  const [errors, setErrors] = useState({});
  const [updateRequest, setUpdateRequest] = useState({
    amount: 0,
    fromAccountId: null,
    toAccountId: null,
  });

  const fetchAllAccounts = async () => {
    try {
      const organization = JSON.parse(localStorage.getItem("organization")) || {};
      if (!organization.organizationId) {
        setAccountList([]);
        setAccountListTo([]);
        return;
      }

      setLoading(true);
      const response = await httpService.get(
        `/organizationAccount/getAccountByOrgId/${organization.organizationId}`
      );

      if (response?.data) {
        setAccountList(response?.data);
      }
    } catch (err) {
      notifyError(err.message || "Failed to load accounts", 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllAccounts();
  }, []);

  useEffect(() => {}, [accountList]);

  if (!isOpen) return null;

  const onChangeAmount = (e) => {
    const { name, value } = e.target;
    const numericValue = Number(value) || 0;

    if (numericValue >= 0) {
      setUpdateRequest((prev) => ({
        ...prev,
        [name]: numericValue,
      }));
      if (errors.amount) {
        setErrors((prev) => ({ ...prev, amount: "" }));
      }

      if (!isNaN(numericValue)) {
        const updatedFrom = originalFromAccountAmount - numericValue;
        const updatedTo = originalToAccountAmount + numericValue;
        setFromAccountAmount(updatedFrom);
        setToAccountAmount(updatedTo);
      }
    }
  };

  const handleUpdate = async () => {
    const newErrors = {};

    if (!updateRequest.fromAccountId) newErrors.fromAccountId = "Please select From account";
    if (!updateRequest.toAccountId) newErrors.toAccountId = "Please select To account";
    if (updateRequest.amount <= 0) newErrors.amount = "Please enter a valid amount";

    if (
      updateRequest.fromAccountId &&
      updateRequest.toAccountId &&
      String(updateRequest.fromAccountId) === String(updateRequest.toAccountId)
    ) {
      newErrors.toAccountId = "From and To account cannot be the same";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      await httpService.post(
        "/organizationAccount/transferAmount",
        updateRequest
      );
      notifySuccess("Transfer Funds Successfully!", 4000);
      if (typeof refresh === "function") {
        refresh();
      }

      setUpdateRequest({
        amount: 0,
        fromAccountId: null,
        toAccountId: null,
      });
      setFromAccountAmount(null);
      setToAccountAmount(null);
      setErrors({});
    } catch (error) {
      notifyError(error.message, error.data, 4000);
    }
  };

  const onChangeFromAccount = (e) => {
    const { name, value } = e.target;

    if (!value) {
      setUpdateRequest((prev) => ({
        ...prev,
        fromAccountId: "",
        toAccountId: "",
        amount: 0,
      }));
      setFromAccountAmount(null);
      setToAccountAmount(null);
      setOriginalFromAccountAmount(0);
      setOriginalToAccountAmount(0);
      setAccountListTo([]);
      return;
    }

    setUpdateRequest((prev) => ({
      ...prev,
      [name]: value,
      toAccountId: "",
      amount: 0,
    }));

    if (errors.fromAccountId) {
      setErrors((prev) => ({ ...prev, fromAccountId: "" }));
    }

    const currentAccount = accountList.find((account) => String(account.id) === String(value));
    if (!currentAccount) {
      setFromAccountAmount(null);
      setOriginalFromAccountAmount(0);
      setAccountListTo([]);
      return;
    }

    const currentFromAmount = Number(currentAccount.totalAmount || 0);
    setFromAccountAmount(currentFromAmount);
    setOriginalFromAccountAmount(currentFromAmount);
    setToAccountAmount(null);
    setOriginalToAccountAmount(0);

    const filteredList = accountList.filter((account) => String(account.id) !== String(value));
    setAccountListTo(filteredList);
  };

  const onChangeToAccount = (e) => {
    const { name, value } = e.target;

    if (!value) {
      setUpdateRequest((prev) => ({
        ...prev,
        toAccountId: "",
        amount: 0,
      }));
      setToAccountAmount(null);
      setOriginalToAccountAmount(0);
      if (updateRequest.fromAccountId) {
        const currentFrom = accountList.find(
          (account) => String(account.id) === String(updateRequest.fromAccountId)
        );
        const currentFromAmount = Number(currentFrom?.totalAmount || 0);
        setFromAccountAmount(currentFromAmount);
      }
      return;
    }

    setUpdateRequest((prev) => ({
      ...prev,
      [name]: value,
      amount: 0,
    }));

    if (errors.toAccountId) {
      setErrors((prev) => ({ ...prev, toAccountId: "" }));
    }

    const currentAccount = accountList.find((account) => String(account.id) === String(value));
    if (!currentAccount) {
      setToAccountAmount(null);
      setOriginalToAccountAmount(0);
      return;
    }

    const currentToAmount = Number(currentAccount.totalAmount || 0);
    setToAccountAmount(currentToAmount);
    setOriginalToAccountAmount(currentToAmount);

    if (updateRequest.fromAccountId) {
      const currentFrom = accountList.find(
        (account) => String(account.id) === String(updateRequest.fromAccountId)
      );
      setFromAccountAmount(Number(currentFrom?.totalAmount || 0));
    }
  };

  const formatAmount = (value) => {
    if (value === null || value === undefined || value === "") return "-";
    const numericValue = Number(value);
    if (Number.isNaN(numericValue)) return "-";
    return numericValue.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const canEditAmount = Boolean(updateRequest.fromAccountId && updateRequest.toAccountId);
  const canTransfer = canEditAmount && Number(updateRequest.amount) > 0;

  return (
    <>
      <div
        className="fixed inset-0 z-40"
        style={{
          backgroundColor: "rgba(15, 23, 42, 0.45)",
          backdropFilter: "blur(2px)",
        }}
        onClick={onClose}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-white rounded-xl fixed-left-13p inset-0 z-50 mx-auto modal-width modal-height border border-gray-200 shadow-2xl overflow-y-auto"
      >
        <div
          className="px-5 py-4 border-b border-emerald-100"
          style={{ background: "linear-gradient(90deg, #ecfdf5 0%, #f0fdfa 100%)" }}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-emerald-500 text-white flex items-center justify-center mr-3 shadow-sm">
                <FaLayerGroup className="text-sm" />
              </div>
              <div>
                <h2 id="modal-title" className="text-lg font-bold text-gray-800">
                  {formTitle}
                </h2>
                <p className="text-xs text-gray-500">
                  Move funds securely between organization accounts
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-red-500 hover:text-red-600 outline-none focus:outline-none"
            >
              <RxCross2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleUpdate();
          }}
          className="px-5 py-5 space-y-5"
        >
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-4 border-b border-gray-200 pb-2">
              Account Selection
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div>
                <label
                  className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                  htmlFor="fromAccountId"
                >
                  From Account
                </label>
                <select
                  id="fromAccountId"
                  name="fromAccountId"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 ${errors.fromAccountId ? "border-red-500" : ""}`}
                  value={updateRequest.fromAccountId || ""}
                  onChange={onChangeFromAccount}
                >
                  <option value="">Select From Account</option>
                  {accountList.map((account, index) => (
                    <option key={index} value={account.id}>
                      {account.name} - {account.bankName}
                    </option>
                  ))}
                </select>
                {errors.fromAccountId && (
                  <p className="text-red-500 text-xs mt-1">{errors.fromAccountId}</p>
                )}
              </div>

              <div>
                <label
                  className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                  htmlFor="toAccountId"
                >
                  To Account
                </label>
                <select
                  id="toAccountId"
                  name="toAccountId"
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 ${errors.toAccountId ? "border-red-500" : ""}`}
                  value={updateRequest.toAccountId || ""}
                  onChange={onChangeToAccount}
                  disabled={!updateRequest.fromAccountId}
                >
                  <option value="">Select To Account</option>
                  {accountListTo.map((account, index) => (
                    <option key={index} value={account.id}>
                      {account.name} - {account.bankName}
                    </option>
                  ))}
                </select>
                {errors.toAccountId && (
                  <p className="text-red-500 text-xs mt-1">{errors.toAccountId}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-4 border-b border-gray-200 pb-2">
              Balance Preview
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch">
              <div className="rounded-lg border border-red-100 bg-red-50 p-3">
                <p className="text-[11px] font-semibold text-red-600 uppercase tracking-wide">
                  From Account
                </p>
                <p className="mt-1 text-xs text-gray-500">Projected Balance</p>
                <p className="text-lg font-bold text-red-700">
                  {updateRequest.fromAccountId ? `Rs. ${formatAmount(fromAccountAmount)}` : "-"}
                </p>
              </div>

              <div className="rounded-lg border border-emerald-100 bg-white p-3 flex items-center justify-center">
                <div className="inline-flex items-center rounded-full bg-emerald-50 border border-emerald-200 px-4 py-2 shadow-sm">
                  <span className="text-xs font-semibold uppercase text-emerald-700 mr-2">
                    Transfer
                  </span>
                  <FaLongArrowAltRight className="text-emerald-600" />
                </div>
              </div>

              <div className="rounded-lg border border-emerald-100 bg-emerald-50 p-3">
                <p className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wide">
                  To Account
                </p>
                <p className="mt-1 text-xs text-gray-500">Projected Balance</p>
                <p className="text-lg font-bold text-emerald-700">
                  {updateRequest.toAccountId ? `Rs. ${formatAmount(toAccountAmount)}` : "-"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <h3 className="text-sm font-bold text-gray-700 mb-4 border-b border-gray-200 pb-2">
              Transfer Amount
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 items-end">
              <div className="lg:col-span-1">
                <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2" htmlFor="amount">
                  Amount <span className="text-red-500">*</span>
                </label>
                <input
                  id="amount"
                  name="amount"
                  type="number"
                  value={updateRequest.amount}
                  onChange={onChangeAmount}
                  disabled={!canEditAmount}
                  className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 ${
                    !canEditAmount ? "bg-gray-100 cursor-not-allowed" : ""
                  } ${errors.amount ? "border-red-500" : ""}`}
                  placeholder="Enter transfer amount"
                  required
                />
                {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                {!canEditAmount && (
                  <p className="text-gray-400 text-xs mt-1">Select both accounts to enter amount</p>
                )}
              </div>

              <div className="lg:col-span-2 rounded-lg border border-gray-200 bg-white p-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Transfer Summary
                </p>
                <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                  <p className="text-gray-600">
                    From Balance: <span className="font-semibold text-red-600">Rs. {updateRequest.fromAccountId ? formatAmount(fromAccountAmount) : "-"}</span>
                  </p>
                  <p className="text-gray-600">
                    To Balance: <span className="font-semibold text-emerald-600">Rs. {updateRequest.toAccountId ? formatAmount(toAccountAmount) : "-"}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end items-center gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="bg-gray-100 text-gray-700 font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-md hover:bg-gray-200 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!canTransfer}
              className="bg-emerald-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-md hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Transfer Funds
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default PaymentModalFundTransfer;
