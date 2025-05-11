import React, { useState } from "react";
import { FaLayerGroup } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { paymentTypes } from "utility/Utility";
import { IoMdAddCircle } from "react-icons/io";

const PaymentModal = ({
  isOpen,
  onClose,
  formTitle = "Form",
  fields = {},
  onChangeForm,
  onChangeFormDetail,
  onAddDetailRow,
  onResetForm,
  onRemoveDetailRow,
  onResetFormDetail,
  selectedPaymetType,
  setselectedPaymetType,
  onSubmit,
}) => {
  if (!isOpen) return null;

  const PAYMENT_TYPES = ["SINGLE PAYMENT", "SPLIT METHOD"];
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const onChangeSelectedPaymentMethod = () => {
    if (selectedPaymetType == "SINGLE PAYMENT") {
      onResetForm();
      setselectedPaymetType("SPLIT METHOD");
    } else {
      onResetFormDetail();
      setselectedPaymetType("SINGLE PAYMENT");
    }
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

        <form onSubmit={handleSubmit}>
          <div className="flex justify-end w-full mb-3 px-4">
            <div className="w-50" style={{ width: "20%", height: "50%" }}>
              <label
                className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                htmlFor="projectType"
              >
               Select Payment Type
              </label>
              <select
                id="paymentType"
                name="paymentType"
                onChange={onChangeSelectedPaymentMethod}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
              >
                {PAYMENT_TYPES.map((type, index) => (
                  <option key={index} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {selectedPaymetType == "SINGLE PAYMENT" ? (
            <div className={`flex flex-wrap`}>
              <div className={`w-full lg:w-6/12  my-2 `}>
                <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                  Received Amount
                </label>
                <input
                  name="receivedAmount"
                  type="number"
                  value={fields.receivedAmount}
                  onChange={(e) => onChangeForm(e)}
                  className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                  required
                />
              </div>
              <div className="w-full lg:w-6/12 px-4 my-2">
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
                    value={fields.paymentType}
                    onChange={(e) => onChangeForm(e)}
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
            </div>
          ) : (
            <div className={`px-4 mt-5`}>
              <h6 className=" text-blueGray-600 text-sm mt-3 mb-6 font-bold uppercase flex justify-between">
                Split Payment
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
                <div className="flex flex-wrap" key={ind}>
                  <div className={`w-full lg:w-6/12  my-2 `}>
                    <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                      Received Amount
                    </label>
                    <input
                      name="amount"
                      type="number"
                      value={detail.amount}
                      onChange={(e) => onChangeFormDetail(e, ind)}
                      className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                      required
                    />
                  </div>
                  <div className="w-full lg:w-6/12 px-4 my-2">
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
                </div>
              ))}
            </div>
          )}

          <div className="margin-dynamic-modal">
            <button
              type="submit"
              className="bg-lightBlue-500 items-center text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
            >
              PAY
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default PaymentModal;
