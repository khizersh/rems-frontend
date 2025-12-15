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
  onPrintDetail,
  onSubmit,
}) => {
  const { loading, setLoading, notifyError, notifySuccess } =
    useContext(MainContext);
  const [remainingAmountState, setRemainingAmountState] = useState(0);
  const [paidDetailsList, setPaidDetailsList] = useState([]);
  const [accountList, setAccountList] = useState([]);
  const [updateRequest, setUpdateRequest] = useState({
    amount: 0,
    paymentType: "CASH",
    chequeNo: null,
    chequeDate: null,
    customerPaymentReason: null,
    createdDate: new Date().toISOString().slice(0, 16),
  });

  const fetchAccountList = async () => {
    try {
      setLoading(true);
      let organizationLocal = JSON.parse(localStorage.getItem("organization"));
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

  useEffect(() => {
    setRemainingAmountState(selectedPayment.totalBalanceAmount);
  }, [selectedPayment.totalBalanceAmount]);

  useEffect(() => {
    fetchAccountList();
  }, []);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const onChangeAmount = (e, ind) => {
    onChangeFormDetail(e, ind);
    const inputAmount = parseFloat(e.target.value) || 0;
    const totalOtherAmounts = fields.customerPaymentDetails.reduce(
      (sum, item, i) => {
        if (i === ind) return sum;
        return sum + (parseFloat(item.amount) || 0);
      },
      0
    );
    const updatedAmount =
      selectedPayment.totalBalanceAmount - inputAmount - totalOtherAmounts;
    setRemainingAmountState(updatedAmount);
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
          <>
            <div className={`px-4 mt-5`}>
              <h6 className=" text-blueGray-600 text-sm mt-3 mb-6 font-bold uppercase flex justify-between">
                <div className="flex justify-between">
                  <div className="pt-2 border-right-grey px-2">
                    Original Amount :{" "}
                    <span style={{ fontSize: "23px" }}>
                      {selectedPayment.totalAmount}
                    </span>
                  </div>
                  <div className="pt-2 pr-2 border-right-grey px-2">
                    Remaining Amount :{" "}
                    <span style={{ fontSize: "23px" }}>
                      {remainingAmountState}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onAddDetailRow}
                  className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                >
                  <IoMdAddCircle
                    className="w-5 h-5 inline-block"
                    style={{ paddingBottom: "3px", paddingRight: "7px" }}
                  />
                  Add Method
                </button>
              </h6>

              {fields?.customerPaymentDetails?.map((detail, ind) => (
                <>
                  {detail.paymentType == CHEQUE ? (
                    <>
                      <div
                        className="flex flex-wrap border-bottom-grey"
                        key={ind}
                      >
                        <div className="flex flex-wrap" key={ind}>
                          <div className={`w-full lg:w-2/12 `}>
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
                          <div className="w-full lg:w-1/12 px-2">
                            <div className="relative w-full mb-3">
                              <label
                                className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                                htmlFor="projectType"
                              >
                                Payment Type
                              </label>
                              <select
                                id="paymentType"
                                name="paymentType"
                                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                                value={detail.paymentType}
                                onChange={(e) => onChangeFormDetail(e, ind)}
                              >
                                <option value="">SELECT PAYMENT TYPE</option>
                                {paymentTypes.map((type, index) => (
                                  <option key={index} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className={`w-full lg:w-1/12  `}>
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
                          <div className={`w-full lg:w-2/12  px-2`}>
                            <label
                              className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                              htmlFor="projectType"
                            >
                              Reason
                            </label>
                            <select
                              id="paymentType"
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
                          <div className="w-full lg:w-1/12">
                            <div className="relative w-full mb-3">
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
                          </div>
                          <div className="w-full lg:w-2/12 px-2">
                            <div className="relative w-full mb-3">
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
                          </div>
                          <div className="w-full lg:w-1/12">
                            <div className=" mt-7">
                              <button
                                type="button"
                                onClick={() => onRemoveDetailRow(ind)}
                                className=" text-red-500   outline-none focus:outline-none ease-linear transition-all duration-150"
                              >
                                <MdDeleteForever
                                  style={{
                                    fontSize: "25px",
                                    marginTop: "7px",
                                  }}
                                />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className="flex flex-wrap border-bottom-grey"
                        key={ind}
                      >
                        <div className={`w-full lg:w-3/12  my-2 `}>
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
                        <div className="w-full lg:w-9/12 px-4 my-2">
                          <div className="flex flex-wrap" key={ind}>
                            <div className="w-full lg:w-3/12 px-4">
                              <div className="relative w-full mb-3">
                                <label
                                  className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                                  htmlFor="projectType"
                                >
                                  Payment Type
                                </label>
                                <select
                                  id="paymentType"
                                  name="paymentType"
                                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                                  value={detail.paymentType}
                                  onChange={(e) => onChangeFormDetail(e, ind)}
                                >
                                  <option value="">SELECT PAYMENT TYPE</option>
                                  {paymentTypes.map((type, index) => (
                                    <option key={index} value={type}>
                                      {type}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                            <div className="w-full lg:w-3/12 px-4">
                              <div className="relative w-full mb-3">
                                <label
                                  className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                                  htmlFor="projectType"
                                >
                                  Reason
                                </label>
                                <select
                                  id="paymentType"
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
                            </div>
                            <div className="w-full lg:w-4/12 px-4">
                              <div className="relative w-full mb-3">
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
                            </div>
                            <div className="w-full lg:w-1/12 px-4">
                              <div className=" mt-7">
                                <button
                                  type="button"
                                  onClick={() => onRemoveDetailRow(ind)}
                                  className=" text-red-500   outline-none focus:outline-none ease-linear transition-all duration-150"
                                >
                                  <MdDeleteForever
                                    style={{
                                      fontSize: "25px",
                                      marginTop: "7px",
                                    }}
                                  />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </>
              ))}

              <div className="mt-10 ">
                <div className={`flex justify-between`}>
                  <h2 id="modal-title" className="text-lg font-bold">
                    Posting Account
                  </h2>
                  <button
                    type="button"
                    onClick={onAddAccountRow}
                    className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                  >
                    <IoMdAddCircle
                      className="w-5 h-5 inline-block"
                      style={{ paddingBottom: "3px", paddingRight: "7px" }}
                    />
                    Add Account
                  </button>
                </div>
                {fields?.organizationAccountDetails?.map((detail, ind) => (
                  <div className="flex flex-wrap border-bottom-grey">
                    <div className={`w-full lg:w-4/12  my-2 p-2 `}>
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
                    <div className="w-full lg:w-8/12  my-2 p-2 ">
                      <div className="flex flex-wrap">
                        <div className="w-full lg:w-6/12">
                          <label className="block text-sm font-medium mb-1">
                            Select Account
                          </label>
                          <select
                            name="organizationAcctId"
                            value={detail.name}
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
                        <div className="w-full lg:w-4/12 px-4">
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
                        <div className="w-full lg:w-1/12   ">
                          <div className=" mt-7 ml-5">
                            <button
                              type="button"
                              onClick={() => onRemoveAccountRow(ind)}
                              className=" text-red-500   outline-none focus:outline-none ease-linear transition-all duration-150"
                            >
                              <MdDeleteForever
                                style={{ fontSize: "25px", marginTop: "7px" }}
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
          <div className="margin-dynamic-modal">
            <button
              onClick={handleSubmit}
              type="submit"
              className="bg-lightBlue-500 items-center text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
            >
              PAY
            </button>
          </div>
        </>
      </div>
    </>
  );
};

export default PaymentModal;
