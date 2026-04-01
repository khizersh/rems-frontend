import React, { useState } from "react";
import { useParams } from "react-router-dom/cjs/react-router-dom.min";
import { FaBuilding, FaMoneyBillWave } from "react-icons/fa";
import { HiMiniBuildingStorefront } from "react-icons/hi2";
import { IoMdAddCircle } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import { RxCross2 } from "react-icons/rx";

const PAYMENT_PLANS_TYPE = ["ONE-TIME-PAYMENT", "INSTALLMENT_RANGE"];
const unitTypes = ["APARTMENT", "SHOP", "OFFICE", "PENTHOUSE", "VILLA"];

const AddUnit = ({
  addModal,
  toggleAdd,
  units,
  fetchUnitList,
  setLoading,
  notifySuccess,
  notifyError,
  httpService,
}) => {
  const { floorId } = useParams();
  const [unit, setUnit] = useState({
    serialNo: "",
    amount: 0,
    squareFoot: 0,
    floorId: floorId,
    unitType: "APARTMENT",
    paymentPlanType: "ONE-TIME-PAYMENT",
    roomCount: 0,
    bathroomCount: 0,
    paymentSchedule: {
      durationInMonths: 0,
      actualAmount: 0,
      miscellaneousAmount: 0,
      developmentAmount: 0,
      totalAmount: 0,
      downPayment: 0,
      quarterlyPayment: 0,
      halfYearlyPayment: 0,
      yearlyPayment: 0,
      onPossessionPayment: 0,
      monthWisePaymentList: [{ fromMonth: 0, toMonth: 0, amount: 0 }],
    },
  });

  const onChangeUnit = (e) => {
    setUnit({ ...unit, [e.target.name]: e.target.value });
  };

  const changePaymentScheduleFields = (e) => {
    const updatedUnits = { ...unit };
    const updatedPayment = {
      ...unit.paymentSchedule,
      [e.target.name]: e.target.value,
    };
    updatedUnits.paymentSchedule = updatedPayment;
    setUnit(updatedUnits);
  };

  const addMonthWisePayment = () => {
    setUnit((prevUnit) => ({
      ...prevUnit,
      paymentSchedule: {
        ...prevUnit.paymentSchedule,
        monthWisePaymentList: [
          ...(prevUnit.paymentSchedule?.monthWisePaymentList || []),
          { fromMonth: 0, toMonth: 0, amount: 0 },
        ],
      },
    }));
  };

  const handleMonthWisePaymentChange = (index, e) => {
    setUnit((prevUnit) => {
      const updatedList = [...prevUnit.paymentSchedule.monthWisePaymentList];
      updatedList[index] = {
        ...updatedList[index],
        [e.target.name]: e.target.value,
      };

      return {
        ...prevUnit,
        paymentSchedule: {
          ...prevUnit.paymentSchedule,
          monthWisePaymentList: updatedList,
        },
      };
    });
  };

  const removeMonthWisePayment = (monthIndex) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this month-wise payment?"
    );
    if (!confirmed) return;

    setUnit((prevUnit) => {
      const updatedUnit = { ...prevUnit };
      updatedUnit.paymentSchedule.monthWisePaymentList.splice(monthIndex, 1);
      return updatedUnit;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await httpService.post(`/unit/addOrUpdate`, unit);
      notifySuccess(response.responseMessage, 4000);
      await fetchUnitList();
      toggleAdd();
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  if (!addModal) return null;

  return (
    <div
      className="inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50 overflow-y-auto"
      style={{ position: "fixed", left: "14%", top: "0", width: "75%", height: "100vh" }}
    >
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-4xl my-8 mx-4">
        {/* Header */}
        <div className="mb-4 py-4 px-6 border-b border-gray-200 flex justify-between items-center">
          <h6 className="text-blueGray-700 text-lg font-bold uppercase flex items-center">
            <HiMiniBuildingStorefront className="mr-2" style={{ color: "#8b5cf6" }} />
            Add Unit
          </h6>
          <button onClick={toggleAdd} type="button">
            <RxCross2 className="w-5 h-5 text-red-500 hover:text-red-700" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          {/* Unit Details Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
              <FaBuilding className="mr-2" style={{ fontSize: "14px", color: "#8b5cf6" }} />
              Unit Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Serial No
                </label>
                <input
                  type="text"
                  name="serialNo"
                  className="w-full p-2 border rounded-lg text-sm"
                  onChange={(e) => onChangeUnit(e)}
                  value={unit.serialNo}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Square Foot
                </label>
                <input
                  type="number"
                  name="squareFoot"
                  className="w-full p-2 border rounded-lg text-sm"
                  onChange={(e) => onChangeUnit(e)}
                  value={unit.squareFoot}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Unit Type
                </label>
                <select
                  name="unitType"
                  className="w-full p-2 border rounded-lg text-sm"
                  onChange={(e) => onChangeUnit(e)}
                  value={unit.unitType}
                >
                  <option value="">SELECT UNIT TYPE</option>
                  {unitTypes.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Room Count
                </label>
                <input
                  type="number"
                  name="roomCount"
                  className="w-full p-2 border rounded-lg text-sm"
                  onChange={(e) => onChangeUnit(e)}
                  value={unit.roomCount}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Bathroom Count
                </label>
                <input
                  type="number"
                  name="bathroomCount"
                  className="w-full p-2 border rounded-lg text-sm"
                  onChange={(e) => onChangeUnit(e)}
                  value={unit.bathroomCount}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Payment Plan Type
                </label>
                <select
                  name="paymentPlanType"
                  className="w-full p-2 border rounded-lg text-sm"
                  value={unit.paymentPlanType}
                  onChange={(e) => onChangeUnit(e)}
                >
                  <option value="">SELECT PAYMENT PLAN TYPE</option>
                  {PAYMENT_PLANS_TYPE.map((type, index) => (
                    <option key={index} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Costing Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mb-4">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
              <FaMoneyBillWave className="mr-2" style={{ fontSize: "14px", color: "#10b981" }} />
              Payment Schedule
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Duration In Months
                </label>
                <input
                  type="number"
                  name="durationInMonths"
                  className="w-full p-2 border rounded-lg text-sm"
                  onChange={(e) => changePaymentScheduleFields(e)}
                  value={unit.paymentSchedule.durationInMonths}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Actual Amount
                </label>
                <input
                  type="number"
                  name="actualAmount"
                  className="w-full p-2 border rounded-lg text-sm"
                  onChange={(e) => changePaymentScheduleFields(e)}
                  value={unit.paymentSchedule.actualAmount}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Miscellaneous Amount
                </label>
                <input
                  type="number"
                  name="miscellaneousAmount"
                  className="w-full p-2 border rounded-lg text-sm"
                  onChange={(e) => changePaymentScheduleFields(e)}
                  value={unit.paymentSchedule.miscellaneousAmount}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Development Amount
                </label>
                <input
                  type="number"
                  name="developmentAmount"
                  className="w-full p-2 border rounded-lg text-sm"
                  onChange={(e) => changePaymentScheduleFields(e)}
                  value={unit.paymentSchedule.developmentAmount}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Total Amount
                </label>
                <input
                  type="text"
                  name="totalAmount"
                  disabled
                  className="w-full p-2 border rounded-lg text-sm bg-gray-100 text-gray-500"
                  value={
                    Number(unit.paymentSchedule.actualAmount) +
                    Number(unit.paymentSchedule.miscellaneousAmount) +
                    Number(unit.paymentSchedule.developmentAmount)
                  }
                />
              </div>
            </div>

            {/* Installment Range Fields */}
            {unit.paymentPlanType === "INSTALLMENT_RANGE" && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 pt-4 border-t border-gray-200">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Down Payment
                    </label>
                    <input
                      type="number"
                      name="downPayment"
                      className="w-full p-2 border rounded-lg text-sm"
                      onChange={(e) => changePaymentScheduleFields(e)}
                      value={unit.paymentSchedule.downPayment}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Quarterly Payment
                    </label>
                    <input
                      type="number"
                      name="quarterlyPayment"
                      className="w-full p-2 border rounded-lg text-sm"
                      onChange={(e) => changePaymentScheduleFields(e)}
                      value={unit.paymentSchedule.quarterlyPayment}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Half-Yearly Payment
                    </label>
                    <input
                      type="number"
                      name="halfYearlyPayment"
                      className="w-full p-2 border rounded-lg text-sm"
                      onChange={(e) => changePaymentScheduleFields(e)}
                      value={unit.paymentSchedule.halfYearlyPayment}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Yearly Payment
                    </label>
                    <input
                      type="number"
                      name="yearlyPayment"
                      className="w-full p-2 border rounded-lg text-sm"
                      onChange={(e) => changePaymentScheduleFields(e)}
                      value={unit.paymentSchedule.yearlyPayment}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      On Possession Payment
                    </label>
                    <input
                      type="number"
                      name="onPossessionPayment"
                      className="w-full p-2 border rounded-lg text-sm"
                      onChange={(e) => changePaymentScheduleFields(e)}
                      value={unit.paymentSchedule.onPossessionPayment}
                    />
                  </div>
                </div>

                {/* Month Wise Payment Section */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-gray-700 uppercase">
                      Month Wise Payment
                    </span>
                    <button
                      type="button"
                      onClick={() => addMonthWisePayment()}
                      className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-3 py-1 rounded shadow hover:shadow-md transition-all inline-flex items-center"
                    >
                      <IoMdAddCircle className="mr-1" />
                      Add Row
                    </button>
                  </div>
                  {unit?.paymentSchedule?.monthWisePaymentList?.map((monthly, mIndex) => (
                    <div key={mIndex} className="grid grid-cols-12 gap-2 mb-2 items-end">
                      <div className="col-span-1 text-center text-sm font-medium text-gray-600 pb-2">
                        {mIndex + 1}
                      </div>
                      <div className="col-span-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          From Month
                        </label>
                        <input
                          type="number"
                          name="fromMonth"
                          className="w-full p-2 border rounded-lg text-sm"
                          onChange={(e) => handleMonthWisePaymentChange(mIndex, e)}
                          value={unit.paymentSchedule.monthWisePaymentList[mIndex].fromMonth}
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          To Month
                        </label>
                        <input
                          type="number"
                          name="toMonth"
                          className="w-full p-2 border rounded-lg text-sm"
                          onChange={(e) => handleMonthWisePaymentChange(mIndex, e)}
                          value={unit.paymentSchedule.monthWisePaymentList[mIndex].toMonth}
                        />
                      </div>
                      <div className="col-span-4">
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Amount
                        </label>
                        <input
                          type="number"
                          name="amount"
                          className="w-full p-2 border rounded-lg text-sm"
                          onChange={(e) => handleMonthWisePaymentChange(mIndex, e)}
                          value={unit.paymentSchedule.monthWisePaymentList[mIndex].amount}
                        />
                      </div>
                      <div className="col-span-1 text-center pb-1">
                        <button
                          type="button"
                          onClick={() => removeMonthWisePayment(mIndex)}
                          className="text-red-500 hover:text-red-700 transition-all"
                        >
                          <MdDeleteForever style={{ fontSize: "22px" }} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={toggleAdd}
              className="bg-gray-100 text-gray-700 font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-md hover:bg-gray-200 transition-all mr-3 inline-flex items-center"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg transition-all inline-flex items-center"
            >
              <HiMiniBuildingStorefront className="mr-2" />
              Add Unit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddUnit;
