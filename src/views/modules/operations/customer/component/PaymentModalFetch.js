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
  onPrintDetail,
}) => {
  const { loading, setLoading, notifyError, notifySuccess } =
    useContext(MainContext);
  const [paidDetailsList, setPaidDetailsList] = useState([]);
  const [updateRequest, setUpdateRequest] = useState({
    amount: 0,
    paymentType: "CASH",
    chequeNo: null,
    chequeDate: null,
    customerPaymentReason: null,
    createdDate: new Date().toISOString().slice(0, 16),
    organizationAccountDetails : []
  });

  const [page, setPage] = useState(0);
  const [isEdit, setIsEdit] = useState(false);
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
    { header: "Reason", field: "customerPaymentReason" },
    { header: "Cheque No", field: "chequeNo" },
    {
      header: "Cheque Date",
      field: "chequeDate",
      render: (value) => {
        return <span>{value ? value.split("T")[0] : "-"}</span>;
      },
    },
    { header: "Created By", field: "createdBy" },
    {
      header: "Created Date",
      field: "createdDate",
      render: (value) => {
        return <span>{value ? value.split("T")[0] : "-"}</span>;
      },
    },
  ];

  const pageSize = 10;

  const handleEdit = (value) => {
    setIsEdit(value);
  };

  const onClickEditButton = (data) => {
    setUpdateRequest(data);
    handleEdit(true);
  };

  const actions = [
    {
      icon: MdPrint,
      onClick: onPrintDetail,
      title: "Print Slip",
      className: "yellow",
    },
    {
      icon: FaPen,
      onClick: onClickEditButton,
      title: "Edit",
      className: "yellow",
    },
    ,
  ];

  const onChangeUpdateRequest = (e) => {
    const { name, value } = e.target;
    setUpdateRequest((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async () => {
    try {
      await httpService.post("/customerPayment/updatePayment", updateRequest);
      await notifySuccess("updated Successfully!", 4000);
      await fetchPaymentDetails();
      setIsEdit(false);
    } catch (error) {
      notifyError(error.message, error.data, 4000);
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

        {paidDetailsList && paidDetailsList.length > 0 ? (
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
        ) : (
          <></>
        )}

        <>
          {isEdit ? (
            <>
              <>
                {updateRequest.paymentType == CHEQUE ? (
                  <>
                    <div className="flex flex-wrap px-5">
                      <div className="flex flex-wrap">
                        <div className={`w-full lg:w-2/12 `}>
                          <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                            Received Amount
                          </label>
                          <input
                            name="amount"
                            type="number"
                            value={updateRequest.amount}
                            disabled={true}
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
                              value={updateRequest.paymentType}
                              onChange={(e) => onChangeUpdateRequest(e)}
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
                            value={updateRequest.chequeNo}
                            onChange={(e) => onChangeUpdateRequest(e)}
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
                            value={updateRequest.customerPaymentReason}
                            onChange={(e) => onChangeUpdateRequest(e)}
                          >
                            <option value="">SELECT REASON</option>
                            {paymentReasons.map((type, index) => (
                              <option key={index} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="w-full lg:w-2/12">
                          <div className="relative w-full mb-3">
                            <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                              Cheque Date
                            </label>
                            <input
                              type="datetime-local"
                              name="chequeDate"
                              value={updateRequest.chequeDate}
                              onChange={(e) => onChangeUpdateRequest(e)}
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
                              value={updateRequest.createdDate}
                              onChange={(e) => onChangeUpdateRequest(e)}
                              className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex flex-wrap border-bottom-grey px-5">
                      <div className={`w-full lg:w-3/12  my-2 `}>
                        <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                          Received Amount
                        </label>
                        <input
                          name="amount"
                          type="number"
                          value={updateRequest.amount}
                          disabled={true}
                          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                          required
                        />
                      </div>
                      <div className="w-full lg:w-9/12 px-4 my-2">
                        <div className="flex flex-wrap">
                          <div className="w-full lg:w-4/12 px-4">
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
                                value={updateRequest.paymentType}
                                onChange={(e) => onChangeUpdateRequest(e)}
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
                          <div className="w-full lg:w-4/12 px-4">
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
                                value={updateRequest.customerPaymentReason}
                                onChange={(e) => onChangeUpdateRequest(e)}
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
                                value={updateRequest.createdDate}
                                onChange={(e) => onChangeUpdateRequest(e)}
                                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring focus:border-blue-300"
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            </>
          ) : (
            <></>
          )}

          <div className="margin-dynamic-modal">
            {isEdit ? (
              <div className="pl-3">
                <button
                  onClick={handleUpdate}
                  className="bg-lightBlue-500 items-center text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                >
                  UPDATE
                </button>

                <button
                  onClick={() => handleEdit(false)}
                  className="bg-red-500 ml-4 items-center text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                >
                  CANCEL
                </button>
              </div>
            ) : (
              <></>
            )}
          </div>
        </>
      </div>
    </>
  );
};

export default PaymentModal;
