import React, { useState, useEffect, useContext } from "react";
import { FaLayerGroup, FaPen } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { paymentTypes } from "utility/Utility";
import { IoMdAddCircle } from "react-icons/io";
import { MdDeleteForever, MdPrint } from "react-icons/md";
import httpService from "utility/httpService";
import DynamicTableComponent from "components/table/DynamicTableComponent";
import { MainContext } from "context/MainContext";
import { CHEQUE } from "utility/Utility";
import { paymentReasons } from "utility/Utility";
import { FaLongArrowAltRight } from "react-icons/fa";

const PaymentModalFundTransfer = ({ isOpen, onClose, formTitle = "Form" , refresh }) => {
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
      const organization =
        JSON.parse(localStorage.getItem("organization")) || null;
      setLoading(true);
      const response = await httpService.get(
        `/organizationAccount/getAccountByOrgId/${organization.organizationId}`
      );

      if (response?.data) {
        setAccountList(response?.data);
      }
    } catch (err) {
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
    // Validate inputs
    const newErrors = {};
    if (!updateRequest.fromAccountId) newErrors.fromAccountId = "Please select From account";
    if (!updateRequest.toAccountId) newErrors.toAccountId = "Please select To account";
    if (updateRequest.amount <= 0) newErrors.amount = "Please enter a valid amount";
    
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
      refresh()
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
    setUpdateRequest((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors.fromAccountId) {
      setErrors((prev) => ({ ...prev, fromAccountId: "" }));
    }

    const currentAccount = accountList.find((account) => account.id == value);
    setFromAccountAmount(currentAccount.totalAmount);
    setOriginalFromAccountAmount(currentAccount.totalAmount);
    const filteredList = accountList.filter((account) => account.id != value);
    setAccountListTo(filteredList);
  };

  const onChangeToAccount = (e) => {
    const { name, value } = e.target;
    setUpdateRequest((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors.toAccountId) {
      setErrors((prev) => ({ ...prev, toAccountId: "" }));
    }

    const currentAccount = accountList.find((account) => account.id == value);
    setToAccountAmount(currentAccount.totalAmount);
    setOriginalToAccountAmount(currentAccount.totalAmount);
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="p-4 bg-white rounded fixed-left-13p inset-0 z-50 mx-auto  modal-width modal-height"
      >
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 id="modal-title" className="text-lg font-bold">
            {formTitle}
          </h2>
          <button
            onClick={onClose}
            className="text-red-500 outline-none focus:outline-none"
          >
            <RxCross2 className="w-5 h-5" />
          </button>
        </div>

        <>
          <div className="flex flex-wrap border-bottom-grey px-5">
            <div className="w-full lg:w-12/12 px-4 my-2">
              <div className="flex flex-wrap">
                <div className="w-full lg:w-4/12">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                      htmlFor="projectType"
                    >
                      FROM ACCOUNT
                    </label>
                    <select
                      id="fromAccountId"
                      name="fromAccountId"
                      className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 ${errors.fromAccountId ? "border-red-500" : ""}`}
                      value={updateRequest.fromAccountId}
                      onChange={(e) => onChangeFromAccount(e)}
                    >
                      <option value="">Select From Account</option>
                      {accountList.map((account, index) => (
                        <option key={index} value={account.id}>
                          {account.name} - {account.bankName}
                        </option>
                      ))}
                    </select>
                    {errors.fromAccountId && <p className="text-red-500 text-xs mt-1">{errors.fromAccountId}</p>}
                  </div>
                </div>
                <div className="w-full lg:w-1/12">
                  <p className="text-red-500 text-xl text-center mt-7">
                    {fromAccountAmount
                      ? parseFloat(fromAccountAmount)?.toLocaleString()
                      : ""}
                  </p>
                </div>
                <div className="w-full  lg:w-1/12">
                  <FaLongArrowAltRight
                    className="w-5 h-5 inline-block"
                    style={{
                      marginTop: "27%",
                      paddingRight: "0px",
                      width: "100%",
                      color: "green",
                    }}
                  />
                </div>
                <div className="w-full lg:w-1/12">
                  <p className="text-emerald-500 text-xl text-center mt-7">
                    {" "}
                    {toAccountAmount
                      ? parseFloat(toAccountAmount)?.toLocaleString()
                      : ""}
                  </p>
                </div>

                <div className="w-full lg:w-4/12">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                      htmlFor="projectType"
                    >
                      TO ACCOUNT
                    </label>
                    <select
                      id="toAccountId"
                      name="toAccountId"
                      className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 ${errors.toAccountId ? "border-red-500" : ""}`}
                      value={updateRequest.toAccountId}
                      onChange={(e) => onChangeToAccount(e)}
                    >
                      <option value="">Select To Account</option>
                      {accountListTo.map((account, index) => (
                        <option key={index} value={account.id}>
                          {account.name} - {account.bankName}
                        </option>
                      ))}
                    </select>
                    {errors.toAccountId && <p className="text-red-500 text-xs mt-1">{errors.toAccountId}</p>}
                  </div>
                </div>
                <div className="w-full lg:w-12/12">
                  <div className="flex flex-wrap">
                    <div className="w-full lg:w-4/12"></div>
                    <div className="w-full lg:w-4/12">
                      {" "}
                      <div className="relative w-full mb-3">
                        <label className="text-center mt-4 block uppercase text-blueGray-500 text-xs font-bold mb-2">
                          Transfer Amount
                        </label>
                        <input
                          name="amount"
                          type="number"
                          value={updateRequest.amount}
                          onChange={(e) =>
                            updateRequest.fromAccountId &&
                            updateRequest.toAccountId &&
                            onChangeAmount(e)
                          }
                          className={`w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300 ${errors.amount ? "border-red-500" : ""}`}
                          required
                        />
                        {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount}</p>}
                      </div>
                    </div>
                    <div className="w-full lg:w-4/12"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="margin-dynamic-modal">
            <div className="pl-3">
              <button
                onClick={handleUpdate}
                className="bg-lightBlue-500 items-center text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
              >
                TRANSFER
              </button>
            </div>
          </div>
        </>
      </div>
    </>
  );
};

export default PaymentModalFundTransfer;
