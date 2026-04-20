import React, { useContext, useEffect, useState } from "react";
import { RxCross2 } from "react-icons/rx";
import { IoMdAddCircle } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import httpService from "utility/httpService";
import { MainContext } from "context/MainContext";
import { CHEQUE, paymentReasons, paymentTypes } from "utility/Utility";

const PaymentModal = ({
  selectedPayment,
  isOpen,
  onClose,
  formTitle = "Form",
  fields = {},
  onChangeFormDetail,
  onChangeAccountDetail,
  onAddDetailRow,
  onAddAccountRow,
  onRemoveDetailRow,
  onRemoveAccountRow,
  onSubmit,
}) => {
  const { setLoading } = useContext(MainContext);
  const [remainingAmountState, setRemainingAmountState] = useState(0);
  const [accountList, setAccountList] = useState([]);

  useEffect(() => {
    console.log("selectedPayment :: ",selectedPayment);
    
    setRemainingAmountState(selectedPayment?.totalBalanceAmount || 0);
  }, [selectedPayment?.totalBalanceAmount]);

  useEffect(() => {
    const fetchAccountList = async () => {
      try {
        setLoading(true);
        const organizationLocal =
          JSON.parse(localStorage.getItem("organization")) || null;

        if (organizationLocal) {
          const response = await httpService.get(
            `/organizationAccount/getAccountByOrgId/${organizationLocal.organizationId}`
          );
          setAccountList(response?.data || []);
        }
      } catch (err) {
      } finally {
        setLoading(false);
      }
    };

    fetchAccountList();
  }, [setLoading]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const onChangeAmount = (e, ind) => {
    onChangeFormDetail(e, ind);
    const inputAmount = parseFloat(e.target.value) || 0;

    const totalOtherAmounts = (fields?.customerPaymentDetails || []).reduce(
      (sum, item, i) => {
        if (i === ind) return sum;
        return sum + (parseFloat(item.amount) || 0);
      },
      0
    );

    const updatedAmount =
      (selectedPayment?.totalBalanceAmount || 0) - inputAmount - totalOtherAmounts;

    setRemainingAmountState(updatedAmount);
  };

  const formatAmount = (value) => Number(value || 0).toLocaleString();

  const customerPaymentDetails = fields?.customerPaymentDetails || [];
  const organizationAccountDetails = fields?.organizationAccountDetails || [];

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="bg-white rounded-12 fixed-left-13p inset-0 z-50 mx-auto modal-width modal-height shadow-lg flex flex-col"
      >
        <div className="px-6 py-4 border-b border-blueGray-200 bg-blueGray-50">
          <div className="flex justify-between items-center">
            <div>
              <h2 id="modal-title" className="text-lg font-bold text-blueGray-700">
                {formTitle}
              </h2>
              <p className="text-xs text-blueGray-500 mt-1">
                Record installment details and post them to organization accounts.
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-red-500 outline-none focus:outline-none"
              aria-label="Close payment form"
            >
              <RxCross2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto flex-1" style={{ maxHeight: "64vh" }}>
          <div className="flex flex-wrap">
            <div className="w-full lg:w-6/12 p-2">
              <div className="bg-blueGray-50 border border-blueGray-200 rounded p-4">
                <p className="text-xs uppercase tracking-wide text-blueGray-500 font-bold mb-2">
                  Original Amount
                </p>
                <p className="text-2xl font-bold text-blueGray-700">
                  {formatAmount(selectedPayment?.totalAmount)}
                </p>
              </div>
            </div>

            <div className="w-full lg:w-6/12 p-2">
              <div className="bg-blueGray-50 border border-blueGray-200 rounded p-4">
                <p className="text-xs uppercase tracking-wide text-blueGray-500 font-bold mb-2">
                  Remaining Amount
                </p>
                <p
                  className={`text-2xl font-bold ${
                    remainingAmountState < 0 ? "text-red-600" : "text-green-600"
                  }`}
                >
                  {formatAmount(remainingAmountState)}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 border border-blueGray-200 rounded-12 p-4 shadow">
            <div className="flex justify-between items-center border-b border-blueGray-200 py-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-blueGray-700">Payment Methods</h3>
                <p className="text-xs text-blueGray-500 mt-1">
                  Add one or more payment methods for this installment.
                </p>
              </div>
              <button
                type="button"
                onClick={onAddDetailRow}
                className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
              >
                <IoMdAddCircle
                  className="w-5 h-5 inline-block"
                  style={{ paddingBottom: "3px", paddingRight: "7px" }}
                />
                Add Method
              </button>
            </div>

            {customerPaymentDetails.map((detail, ind) => (
              <div key={ind} className="border border-blueGray-200 rounded p-4 mb-4 bg-white">
                <div className="mb-3">
                  <span className="inline-block bg-blueGray-100 text-blueGray-600 text-xs font-bold px-3 py-1 rounded-full">
                    Method #{ind + 1}
                  </span>
                </div>

                {detail.paymentType == CHEQUE ? (
                  <div className="flex flex-wrap">
                    <div className="w-full lg:w-2/12 px-2 mb-3">
                      <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                        Received Amount
                      </label>
                      <input
                        name="amount"
                        type="number"
                        value={detail.amount}
                        onChange={(e) => onChangeAmount(e, ind)}
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                        required
                      />
                    </div>
                    <div className="w-full lg:w-2/12 px-2 mb-3">
                      <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                        Payment Type
                      </label>
                      <select
                        name="paymentType"
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                        value={detail.paymentType}
                        onChange={(e) => onChangeFormDetail(e, ind)}
                      >
                        <option value="">SELECT PAYMENT TYPE</option>
                        {paymentTypes.map((type, index) => (
                          <option key={index} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-full lg:w-2/12 px-2 mb-3">
                      <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                        Cheque No
                      </label>
                      <input
                        name="chequeNo"
                        type="text"
                        value={detail.chequeNo}
                        onChange={(e) => onChangeFormDetail(e, ind)}
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                        required
                      />
                    </div>
                    <div className="w-full lg:w-2/12 px-2 mb-3">
                      <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                        Reason
                      </label>
                      <select
                        name="customerPaymentReason"
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                        value={detail.customerPaymentReason}
                        onChange={(e) => onChangeFormDetail(e, ind)}
                      >
                        <option value="">SELECT REASON</option>
                        {paymentReasons.map((type, index) => (
                          <option key={index} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-full lg:w-2/12 px-2 mb-3">
                      <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                        Cheque Date
                      </label>
                      <input
                        type="datetime-local"
                        name="chequeDate"
                        value={detail.chequeDate}
                        onChange={(e) => onChangeFormDetail(e, ind)}
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                      />
                    </div>
                    <div className="w-full lg:w-1/12 px-2 mb-3">
                      <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                        Created
                      </label>
                      <input
                        type="datetime-local"
                        name="createdDate"
                        value={detail.createdDate}
                        onChange={(e) => onChangeFormDetail(e, ind)}
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                      />
                    </div>
                    <div className="w-full lg:w-1/12 px-2 mb-3">
                      <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                        Remove
                      </label>
                      <button
                        type="button"
                        onClick={() => onRemoveDetailRow(ind)}
                        className="text-red-600 outline-none focus:outline-none ease-linear transition-all duration-150"
                        aria-label="Remove payment method"
                      >
                        <MdDeleteForever style={{ fontSize: "25px" }} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-wrap">
                    <div className="w-full lg:w-3/12 px-2 mb-3">
                      <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                        Received Amount
                      </label>
                      <input
                        name="amount"
                        type="number"
                        value={detail.amount}
                        onChange={(e) => onChangeAmount(e, ind)}
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                        required
                      />
                    </div>
                    <div className="w-full lg:w-3/12 px-2 mb-3">
                      <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                        Payment Type
                      </label>
                      <select
                        name="paymentType"
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                        value={detail.paymentType}
                        onChange={(e) => onChangeFormDetail(e, ind)}
                      >
                        <option value="">SELECT PAYMENT TYPE</option>
                        {paymentTypes.map((type, index) => (
                          <option key={index} value={type.id}>
                            {type.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-full lg:w-3/12 px-2 mb-3">
                      <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                        Reason
                      </label>
                      <select
                        name="customerPaymentReason"
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                        value={detail.customerPaymentReason}
                        onChange={(e) => onChangeFormDetail(e, ind)}
                      >
                        <option value="">SELECT REASON</option>
                        {paymentReasons.map((type, index) => (
                          <option key={index} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-full lg:w-2/12 px-2 mb-3">
                      <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                        Created Date
                      </label>
                      <input
                        type="datetime-local"
                        name="createdDate"
                        value={detail.createdDate}
                        onChange={(e) => onChangeFormDetail(e, ind)}
                        className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                      />
                    </div>
                    <div className="w-full lg:w-1/12 px-2 mb-3">
                      <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                        Remove
                      </label>
                      <button
                        type="button"
                        onClick={() => onRemoveDetailRow(ind)}
                        className="text-red-600 outline-none focus:outline-none ease-linear transition-all duration-150"
                        aria-label="Remove payment method"
                      >
                        <MdDeleteForever style={{ fontSize: "25px" }} />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-4 border border-blueGray-200 rounded-12 p-4 shadow">
            <div className="flex justify-between items-center border-b border-blueGray-200 py-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-blueGray-700">Posting Accounts</h3>
                <p className="text-xs text-blueGray-500 mt-1">
                  Map the received payment to one or more organization accounts.
                </p>
              </div>
              <button
                type="button"
                onClick={onAddAccountRow}
                className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
              >
                <IoMdAddCircle
                  className="w-5 h-5 inline-block"
                  style={{ paddingBottom: "3px", paddingRight: "7px" }}
                />
                Add Account
              </button>
            </div>

            {organizationAccountDetails.map((detail, ind) => (
              <div key={ind} className="border border-blueGray-200 rounded p-4 mb-4 bg-white">
                <div className="mb-3">
                  <span className="inline-block bg-blueGray-100 text-blueGray-600 text-xs font-bold px-3 py-1 rounded-full">
                    Account Entry #{ind + 1}
                  </span>
                </div>

                <div className="flex flex-wrap">
                  <div className="w-full lg:w-3/12 px-2 mb-3">
                    <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                      Received Amount
                    </label>
                    <input
                      name="amount"
                      type="number"
                      value={detail.amount}
                      onChange={(e) => onChangeAccountDetail(e, ind)}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                      required
                    />
                  </div>
                  <div className="w-full lg:w-4/12 px-2 mb-3">
                    <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                      Select Account
                    </label>
                    <select
                      name="organizationAcctId"
                      value={detail.organizationAcctId || ""}
                      onChange={(e) => onChangeAccountDetail(e, ind)}
                      className="border rounded px-3 py-2 w-full"
                    >
                      <option value="">Select Receiving Account</option>
                      {accountList.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.name} - {account.bankName}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="w-full lg:w-4/12 px-2 mb-3">
                    <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                      Created Date
                    </label>
                    <input
                      type="datetime-local"
                      name="createdDate"
                      value={detail.createdDate}
                      onChange={(e) => onChangeAccountDetail(e, ind)}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                    />
                  </div>
                  <div className="w-full lg:w-1/12 px-2 mb-3">
                    <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                      Remove
                    </label>
                    <button
                      type="button"
                      onClick={() => onRemoveAccountRow(ind)}
                      className="text-red-600 outline-none focus:outline-none ease-linear transition-all duration-150"
                      aria-label="Remove account entry"
                    >
                      <MdDeleteForever style={{ fontSize: "25px" }} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-blueGray-200 bg-blueGray-50">
          <div className="flex justify-end items-center">
            <button
              type="button"
              onClick={onClose}
              className="bg-white text-blueGray-600 border border-blueGray-200 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-2 ease-linear transition-all duration-150"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              type="submit"
              className="bg-lightBlue-500 items-center text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
            >
              Pay Installment
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentModal;
