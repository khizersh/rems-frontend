import React, { useContext, useEffect, useState } from "react";
import { IoMdAddCircle } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import { BsBuildingFillAdd } from "react-icons/bs";
import { MainContext } from "context/MainContext";
import httpService from "../../utility/httpService.js";
import DebounceSearch from "../../components/CustomerComponents/DebounceSearchDropDown.js";

export default function AddBooking() {
  const { loading, setLoading, notifyError, notifySuccess } =
    useContext(MainContext);
  const [customerList, setCustomerList] = useState([]);
  const [search, setSearch] = useState("");
  const [paymentSchedule, setPaymentSchedule] = useState({
    durationInMonths: 0,
    actualAmount: 0,
    miscellaneousAmount: 0,
    totalAmount: 0,
    downPayment: 0,
    quarterlyPayment: 0,
    halfYearlyPayment: 0,
    yearlyPayment: 0,
    onPossessionPayment: 0,
    monthWisePaymentList: [{ fromMonth: 0, toMonth: 0, amount: 0 }],
  });
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [project, setProject] = useState("-");
  const [floor, setFloor] = useState("-");
  const [unit, setUnit] = useState("-");
  const [totalAmount, setTotalAmount] = useState("-");
  const [booking, setBooking] = useState({
    customerId: 0,
    unitId: 0,
    floorId: 0,
    projectId: 0,
    organizationId: 0,
    paymentSchedule: {},
  });

  useEffect(() => {
    fetchCustomers(search);
  }, []);

  const resetState = () => {
    setPaymentSchedule({
      durationInMonths: 0,
      actualAmount: 0,
      miscellaneousAmount: 0,
      totalAmount: 0,
      downPayment: 0,
      quarterlyPayment: 0,
      halfYearlyPayment: 0,
      yearlyPayment: 0,
      onPossessionPayment: 0,
      monthWisePaymentList: [{ fromMonth: 0, toMonth: 0, amount: 0 }],
    });
  };

  const fetchCustomers = async (search) => {
    setLoading(true);
    try {
      let request = {
        name: search || "",
      };
      const response = await httpService.post(`/customer/search`, request);
      setCustomerList(response.data || []);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const changePaymentScheduleFields = (e) => {
    const updatedSchedule = { ...paymentSchedule };
    updatedSchedule[e.target.name] = e.target.value;
    setPaymentSchedule(updatedSchedule);
  };
  const changeMonthlyPaymentFields = (monthlyIndex, e) => {
    const updatedPaymentSchedule = { ...paymentSchedule };
    updatedPaymentSchedule.monthWisePaymentList[monthlyIndex][e.target.name] =
      e.target.value;
    setPaymentSchedule(updatedPaymentSchedule);
  };

  const addRow = () => {
    setPaymentSchedule((prev) => ({
      ...prev,
      monthWisePaymentList: [
        ...prev.monthWisePaymentList,
        { fromMonth: 0, toMonth: 0, amount: 0 },
      ],
    }));
  };

  const removeMonthWisePayment = (monthIndex) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this month-wise payment?"
    );
    if (!confirmed) return;

    setPaymentSchedule((prev) => ({
      ...prev,
      monthWisePaymentList: prev.monthWisePaymentList.filter(
        (_, i) => i !== monthIndex
      ),
    }));
  };

  const fetchPaymentScheduleByUnitId = async (id) => {
    setLoading(true);
    try {
      let request = {
        id: id,
        paymentScheduleType: "BUILDER",
      };
      const response = await httpService.post(
        `/paymentSchedule/getByUnit`,
        request
      );

      if (response.data) {
        setPaymentSchedule(response.data || {});
      }
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnitDetailsByUnitId = async (id) => {
    setLoading(true);
    try {
      const response = await httpService.get(`/unit/getDetailsById/${id}`);


      if (response.data) {
        setProject(response.data.projectName)
        setFloor(response.data.floorNo)
        setTotalAmount(response.data.totalAmount)
        setUnit(response.data.unitSerial)
      }
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const onChangeCustomer = (customer) => {
    if (customer) {
      fetchPaymentScheduleByUnitId(customer.unitId);
      fetchUnitDetailsByUnitId(customer.unitId);
      setSelectedCustomer(customer);
    }
  };

  const createBooking = async (e) => {
    e.preventDefault();

    const organization =
      JSON.parse(localStorage.getItem("organization")) || null;
    const updatedBooking = { ...booking };
    paymentSchedule.totalAmount =
      paymentSchedule.actualAmount + paymentSchedule.miscellaneousAmount;
    updatedBooking.customerId = selectedCustomer.customerId;
    updatedBooking.unitId = selectedCustomer.unitId;
    updatedBooking.organizationId = organization.organizationId;
    delete paymentSchedule.id;
    updatedBooking.paymentSchedule = paymentSchedule;

    setLoading(true);
    try {
      const response = await httpService.post(`/booking/add`, updatedBooking);
      notifySuccess(response.responseMessage, 4000);
      resetState();
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 border-0">
      <div className=" mb-0 px-6 py-6">
        <div className="flex justify-between">
          <h6 className="text-blueGray-700 text-xl font-bold uppercase">
            Create Booking
          </h6>
        </div>
      </div>
      <div className="flex-auto px-4 py-5 bg-white rounded-12 shadow-lg">
        <form>
          <div className="flex flex-wrap border-bottom-grey py-3 mb-5">
            <div className="w-full lg:w-12/12 px-4 mt-2 md:px-0">
              <h6 className="text-blueGray-600 text-sm mt-3 mb-6 font-bold uppercase">
                Basic Details
              </h6>
              <div className="flex flex-wrap">
                <div className="w-full lg:w-6/12 px-4 md:px-0">
                  <div className="relative w-full mb-3">
                    <div className="w-72">
                      <DebounceSearch
                        setSearch={setSearch}
                        dataList={customerList}
                        setData={onChangeCustomer}
                        placeholder="Search customers..."
                        label="Select Customer"
                      />
                    </div>
                  </div>
                </div>
                <div className="w-full lg:w-6/12 px-4 md:px-0">
                  <div className="relative w-full mb-3">
                    <p className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                      Unit Information
                    </p>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-sm border border-gray-200 rounded-lg w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left font-medium text-gray-600">
                              Project Name
                            </th>
                            <th className="px-4 py-2 text-left font-medium text-gray-600">
                              Floor No
                            </th>
                            <th className="px-4 py-2 text-left font-medium text-gray-600">
                              Unit Serial
                            </th>
                            <th className="px-4 py-2 text-left font-medium text-gray-600">
                              Total Amount
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="">
                            <td className="px-4 py-2 font-semibold text-green-600">
                              {project}
                            </td>
                            <td className="px-4 py-2 font-semibold text-green-600">
                              {floor}
                            </td>
                            <td className="px-4 py-2 font-semibold text-green-600">
                              {unit}
                            </td>
                            <td className="px-4 py-2 font-semibold text-green-600">
                              {totalAmount}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="">
            <div className=" flex flex-wrap">
              <div className="w-full px-4 lg:w-6/12 border-right-grey md:px-0">
                {/* Payment Schedule Heading */}
                <div className="mt-3 mb-3 text-blueGray-600 text-sm uppercase font-bold">
                  Payment Schedule
                </div>

                <div className="flex flex-wrap">
                  {/* === First Section: Payment Overview === */}
                  <div className="w-full flex flex-wrap  border-bottom-grey border-blueGray-200 pb-4 mb-4">
                    {/* Duration In Months */}
                    <div className="w-full px-4 lg:w-6/12 md:px-0">
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                          htmlFor="durationInMonths"
                        >
                          Duration In Months
                        </label>
                        <input
                          id="durationInMonths"
                          type="text"
                          name="durationInMonths"
                          className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          onChange={(e) => changePaymentScheduleFields(e)}
                          value={paymentSchedule.durationInMonths}
                        />
                      </div>
                    </div>

                    {/* Actual Amount */}
                    <div className="w-full px-4 lg:w-6/12 md:px-0">
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                          htmlFor="actualAmount"
                        >
                          Actual Amount
                        </label>
                        <input
                          id="actualAmount"
                          type="text"
                          name="actualAmount"
                          className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          onChange={(e) => changePaymentScheduleFields(e)}
                          value={paymentSchedule.actualAmount}
                        />
                      </div>
                    </div>

                    {/* Miscellaneous Amount */}
                    <div className="w-full px-4 lg:w-6/12 md:px-0">
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                          htmlFor="miscellaneousAmount"
                        >
                          Miscellaneous Amount
                        </label>
                        <input
                          id="miscellaneousAmount"
                          type="text"
                          name="miscellaneousAmount"
                          className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          onChange={(e) => changePaymentScheduleFields(e)}
                          value={paymentSchedule.miscellaneousAmount}
                        />
                      </div>
                    </div>

                    {/* Total Amount */}
                    <div className="w-full px-4 lg:w-6/12 md:px-0">
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                          htmlFor="totalAmount"
                        >
                          Total Amount
                        </label>
                        <input
                          id="totalAmount"
                          type="text"
                          name="totalAmount"
                          disabled
                          className="px-3 py-3 placeholder-blueGray-300 text-blueGray-400 bg-gray-100 rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          value={
                            Number(paymentSchedule.actualAmount) +
                            Number(paymentSchedule.miscellaneousAmount)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* Down Payment */}
                  <div className="w-full px-4 lg:w-6/12 md:px-0">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                        htmlFor="downPayment"
                      >
                        Down Payment
                      </label>
                      <input
                        id="downPayment"
                        type="text"
                        name="downPayment"
                        className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        onChange={(e) => changePaymentScheduleFields(e)}
                        value={paymentSchedule.downPayment}
                      />
                    </div>
                  </div>

                  {/* Quarterly Payment */}
                  <div className="w-full px-4 lg:w-6/12 md:px-0">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                        htmlFor="quarterlyPayment"
                      >
                        Quarterly Payment
                      </label>
                      <input
                        id="quarterlyPayment"
                        type="text"
                        name="quarterlyPayment"
                        className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        onChange={(e) => changePaymentScheduleFields(e)}
                        value={paymentSchedule.quarterlyPayment}
                      />
                    </div>
                  </div>

                  {/* Half-Yearly Payment */}
                  <div className="w-full px-4 lg:w-6/12 md:px-0">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                        htmlFor="halfYearlyPayment"
                      >
                        Half-Yearly Payment
                      </label>
                      <input
                        id="halfYearlyPayment"
                        type="text"
                        name="halfYearlyPayment"
                        className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        onChange={(e) => changePaymentScheduleFields(e)}
                        value={paymentSchedule.halfYearlyPayment}
                      />
                    </div>
                  </div>

                  <div className="w-full px-4 lg:w-6/12 md:px-0">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                        htmlFor="yearlyPayment"
                      >
                        Yearly Payment
                      </label>
                      <input
                        id="yearlyPayment"
                        type="text"
                        name="yearlyPayment"
                        className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        onChange={(e) => changePaymentScheduleFields(e)}
                        value={paymentSchedule.yearlyPayment}
                      />
                    </div>
                  </div>

                  <div className="w-full px-4 lg:w-6/12 md:px-0">
                    <div className="relative w-full mb-3">
                      <label
                        className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                        htmlFor="onPossessionPayment"
                      >
                        On Possession Payment
                      </label>
                      <input
                        id="onPossessionPayment"
                        type="text"
                        name="onPossessionPayment"
                        className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                        onChange={(e) => changePaymentScheduleFields(e)}
                        value={paymentSchedule.onPossessionPayment}
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-6/12 ">
                <div className="relative w-full">
                  <div>
                    <div className="px-4 mt-3 mb-3 rounded md:px-0">
                      <div className="flex justify-between">
                        <div className="uppercase text-blueGray-600 font-bold text-sm text-left">
                          Month Wise Payment
                        </div>
                        <button
                          type="button"
                          onClick={() => addRow()}
                          className="bg-red-500 text-white  font-bold uppercase text-xs px-3 py-1 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                        >
                          <IoMdAddCircle
                            className="inline-block w-3 h-3"
                            style={{ paddingRight: "0px" }}
                          />{" "}
                          Row
                        </button>
                      </div>

                      {paymentSchedule?.monthWisePaymentList?.map(
                        (monthly, mIndex) => (
                          <div className="mt-6 flex flex-wrap justify-between">
                            <div className="mt-6 text-left pt-4">
                              {mIndex + 1} -
                            </div>
                            <div className="w-full lg:w-3/12 ">
                              <div className="relative w-full mb-3">
                                <label
                                  className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                                  htmlFor="name"
                                >
                                  From Month
                                </label>
                                <input
                                  id="name"
                                  type="text"
                                  name="fromMonth"
                                  className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                  onChange={(e) =>
                                    changeMonthlyPaymentFields(mIndex, e)
                                  }
                                  value={monthly.fromMonth}
                                />
                              </div>
                            </div>
                            <div className="w-full lg:w-3/12 px-2 md:px-0">
                              <div className="relative w-full mb-3">
                                <label
                                  className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                                  htmlFor="name"
                                >
                                  To Month
                                </label>
                                <input
                                  id="name"
                                  type="text"
                                  name="toMonth"
                                  className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                  onChange={(e) =>
                                    changeMonthlyPaymentFields(mIndex, e)
                                  }
                                  value={monthly.toMonth}
                                />
                              </div>
                            </div>
                            <div className="w-full lg:w-4/12">
                              <div className="relative w-full mb-3">
                                <label
                                  className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                                  htmlFor="name"
                                >
                                  Amount
                                </label>
                                <input
                                  id="name"
                                  type="text"
                                  name="amount"
                                  className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                  onChange={(e) =>
                                    changeMonthlyPaymentFields(mIndex, e)
                                  }
                                  value={monthly.amount}
                                />
                              </div>
                            </div>
                            <div className="pl-7 mt-6 text-right pt-1 md:ml-auto md:mt-2 lg:ml-auto lg:pt-0">
                              <button
                                type="button"
                                onClick={() => removeMonthWisePayment(mIndex)}
                                className=" text-red-500   outline-none focus:outline-none ease-linear transition-all duration-150"
                              >
                                <MdDeleteForever
                                  style={{
                                    fontSize: "25px",
                                    marginTop: "9px",
                                  }}
                                />
                              </button>
                            </div>
                            <hr className="mt-6 border-b-1 border-blueGray-300" />
                          </div>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={(e) => createBooking(e)}
            type="submit"
            className="mt-4 bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 float-right"
          >
            <BsBuildingFillAdd
              className="w-5 h-5 inline-block "
              style={{ paddingBottom: "3px", paddingRight: "5px" }}
            />
            Add Booking
          </button>
        </form>
      </div>
    </div>
  );
}
