import React, { useState, useEffect, useContext } from "react";
import { FaLayerGroup } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { paymentTypes } from "utility/Utility";
import { IoMdAddCircle } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import httpService from "utility/httpService";
import DynamicTableComponent from "components/table/DynamicTableComponent";
import { MainContext } from "context/MainContext";

const PaymentModal = ({
  selectedPayment,
  // orginalAmount,
  // remainingAmount,
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
  const { loading, setLoading } = useContext(MainContext);
  const [remainingAmountState, setRemainingAmountState] = useState(0);
  const [paidDetailsList, setPaidDetailsList] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);

  const fetchPaymentDetails = async () => {
    try {
      setLoading(true);
      const response = await httpService.get(
        `/customerPayment/paymentDetails/${selectedPayment.id}`
      );
      if (response?.data?.paymentDetails) {
        setPaidDetailsList(response?.data?.paymentDetails);
      }
    } catch (err) {
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setRemainingAmountState(selectedPayment.remainingAmount);
  }, [selectedPayment.remainingAmount]);

  useEffect(() => {
    if (selectedPayment?.id) {
      fetchPaymentDetails();
    }
  }, [selectedPayment?.id]);

  if (!isOpen) return null;

  const tableColumns = [
    {
      header: "Paid Amount",
      field: "amount",
      render: (value) => {
        const baseClass = "font-semibold";
        return <span className={`${baseClass} text-green-600`}>{value}</span>;
      },
    },
    { header: "Payment Type", field: "paymentType" },
    { header: "Created By", field: "createdBy" },
    { header: "Created Date", field: "createdDate" },
  ];

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
      selectedPayment.remainingAmount - inputAmount - totalOtherAmounts;
    setRemainingAmountState(updatedAmount);
  };
  const pageSize = 10;

  const actions = [];

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

        <div className="container mx-auto p-4">
          <DynamicTableComponent
            fetchDataFunction={fetchPaymentDetails}
            setPage={setPage}
            page={page}
            data={paidDetailsList}
            columns={tableColumns} // You need to define the columns for the table
            pageSize={pageSize}
            totalPages={totalPages}
            totalElements={totalElements}
            loading={loading}
            actions={actions}
            title={"Payment History"}
          />
        </div>

        <form onSubmit={handleSubmit}>
          <div className={`px-4 mt-5`}>
            <h6 className=" text-blueGray-600 text-sm mt-3 mb-6 font-bold uppercase flex justify-between">
              <div className="flex justify-between">
                <div className="pt-2 border-right-grey px-2">
                  Original Amount :{" "}
                  <span style={{ fontSize: "23px" }}>
                    {selectedPayment.amount}
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
              <div className="flex flex-wrap" key={ind}>
                <div className={`w-full lg:w-6/12  my-2 `}>
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
                <div className="w-full lg:w-6/12 px-4 my-2">
                  <div className="flex flex-wrap" key={ind}>
                    <div className="w-full lg:w-9/12 px-4">
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
                      <div className=" mt-7">
                        <button
                          type="button"
                          onClick={() => onRemoveDetailRow(ind)}
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
