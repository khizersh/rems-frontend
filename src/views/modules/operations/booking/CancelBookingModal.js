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
import { MdCancel } from "react-icons/md";
import { CANCEL_BOOKING_FEES_TYPE } from "utility/Utility";
import { RxCross1 } from "react-icons/rx";

const CancelBookingModal = ({ selectedBooking, isOpen, onClose }) => {
  const { loading, setLoading, notifyError, notifySuccess } =
    useContext(MainContext);

  const [returnAmount, setReturnAmount] = useState(0);
  const [cancelRequest, setCancelRequest] = useState({
    reason: "",
    fees: [],
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit();
  };

  const addFees = () => {
    setCancelRequest((prevRequest) => ({
      ...prevRequest,
      fees: [
        ...(prevRequest.fees || []),
        {
          type: "",
          title: "",
          value: "",
          amount: 0,
        },
      ],
    }));
  };

  const onChangeRequest = (e) => {
    const { name, value } = e.target;

    setCancelRequest({ ...cancelRequest, [name]: value });
  };

  const onChangeFeesRequest = (e, ind) => {
    const { name, value } = e.target;
    let updatedRequest = { ...cancelRequest };
    updatedRequest.fees[ind][name] = value;

    let type = updatedRequest.fees[ind]["type"];
    let amount = updatedRequest.fees[ind]["value"];
    let totalAmount = 0;

    if (type == "FIXED") {
      totalAmount = amount;
    } else if (type == "PERCENTILE") {
      totalAmount =
        (selectedBooking?.customerAccount?.totalPaidAmount / 100) * amount;
    }
    updatedRequest.fees[ind]["amount"] = totalAmount;

    setCancelRequest(updatedRequest);

    const total = updatedRequest.fees.reduce(
      (sum, f) => sum + Number(f.amount || 0),
      0,
    );

    setReturnAmount(
      (selectedBooking?.customerAccount?.totalPaidAmount || 0) - total,
    );
  };

  const onRemoveFeesRow = (index) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this month-wise payment?",
    );
    if (!confirmed) return;

    setCancelRequest((prevRequest) => {
      const updatedCancelRequest = { ...prevRequest };
      updatedCancelRequest.fees.splice(index, 1);
      const total = updatedCancelRequest.fees.reduce(
        (sum, f) => sum + Number(f.amount),
        0,
      );

      setReturnAmount(
        selectedBooking?.customerAccount?.totalPaidAmount - total,
      );
      return updatedCancelRequest;
    });
  };

  const onSubmit = async () => {
    try {
      setLoading(true);
      await httpService.post(
        `/booking/${selectedBooking?.booking?.id}/cancel`,
        cancelRequest,
      );

      await notifySuccess("Successfully cancelled!", 4000);
      setLoading(false);
    } catch (err) {
      notifyError(err?.message, err?.data, 4000);
      setLoading(false);
    }
  };

  return (
    <>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        className="p-4 bg-white rounded cancel-booking-modal inset-0 z-50 mx-auto  modal-width modal-height"
      >
        <div className="flex justify-between items-center border-b pb-2 mb-4">
          <h2 id="modal-title" className="text-lg font-bold">
            Cancel Booking
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
                    Customer Paid Amount :{" "}
                    <span style={{ fontSize: "23px" }}>
                      {parseFloat(
                        selectedBooking?.customerAccount?.totalPaidAmount,
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className="pt-2 pr-2  px-2">
                    Return Amount :{" "}
                    <span style={{ fontSize: "23px" }}>
                      {parseFloat(
                        returnAmount
                          ? returnAmount
                          : selectedBooking?.customerAccount?.totalPaidAmount,
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={addFees}
                  className="bg-emerald-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                >
                  <IoMdAddCircle
                    className="w-5 h-5 inline-block"
                    style={{ paddingBottom: "3px", paddingRight: "7px" }}
                  />
                  Add Fees
                </button>
              </h6>

              <div className="mt-10 ">
                {/* <div className={`flex justify-between`}>
                  <h2 id="modal-title" className="text-lg font-bold">
                    Posting Account
                  </h2>
                </div> */}

                <div className="relative w-full mb-3">
                  <label
                    className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                    htmlFor="name"
                  >
                    Reason
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="reason"
                    className="border px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                    onChange={(e) => onChangeRequest(e)}
                    value={cancelRequest.reason}
                  />
                </div>

                {cancelRequest.fees?.map((detail, ind) => (
                  <div className="flex flex-wrap">
                    <div className="w-full lg:w-3/12 px-4">
                      <label
                        className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                        htmlFor="name"
                      >
                        Fees Title
                      </label>
                      <input
                        id="name"
                        type="text"
                        name="title"
                        className="border px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        onChange={(e) => onChangeFeesRequest(e, ind)}
                        value={cancelRequest.fees[ind].title}
                      />
                    </div>
                    <div className="w-full lg:w-3/12 px-4">
                      <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                        Fees Type
                      </label>
                      <select
                        name="type"
                        onChange={(e) => onChangeFeesRequest(e, ind)}
                        value={cancelRequest.fees[ind].type}
                        className="border rounded px-3 py-2 w-full"
                      >
                        <option value="">Select Fees</option>
                        {CANCEL_BOOKING_FEES_TYPE.map((fees) => (
                          <option key={fees} value={fees}>
                            {fees}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="w-full lg:w-3/12 px-4">
                      <label
                        className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                        htmlFor="name"
                      >
                        {detail?.type == "fixed" ? "Amount" : "Value"}
                      </label>
                      <input
                        id="name"
                        type="number"
                        name="value"
                        className="border px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        onChange={(e) => onChangeFeesRequest(e, ind)}
                        value={cancelRequest.fees[ind].value}
                      />
                    </div>
                    <div className="w-full lg:w-2/12 px-4">
                      <div className="mt-5 border-right-grey">
                        Calculated Amount :{" "}
                        <p style={{ fontSize: "17px" }}>
                          {parseFloat(
                            detail?.amount ? detail?.amount : 0,
                          ).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    <div className="w-full lg:w-1/12 ">
                      <div className="ml-5 mt-7">
                        <button
                          type="button"
                          onClick={() => onRemoveFeesRow(ind)}
                          className=" text-red-500   outline-none focus:outline-none ease-linear transition-all duration-150"
                        >
                          <MdDeleteForever
                            style={{ fontSize: "25px", marginTop: "7px" }}
                          />
                        </button>
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
              className="bg-red-500 items-center text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
            >
              <RxCross2
                className="w-5 h-5 inline-block"
                style={{ paddingBottom: "3px", paddingRight: "5px" }}
              />
              CANCEL BOOKING
            </button>
          </div>
        </>
      </div>
    </>
  );
};

export default CancelBookingModal;
