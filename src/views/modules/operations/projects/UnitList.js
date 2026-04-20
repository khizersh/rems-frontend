import React, { useEffect, useState, useContext } from "react";
import httpService from "../../../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../../../components/table/DynamicTableComponent.js";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min.js";
import { AiFillSchedule } from "react-icons/ai";
import { projectTypes, unitTypes } from "utility/Utility";
import { FaEye, FaPen, FaTrashAlt, FaMoneyBillWave, FaCreditCard, FaCalendarCheck, FaBuilding } from "react-icons/fa";
import DynamicDetailsModal from "components/CustomerComponents/DynamicModal.js";
import { HiMiniBuildingStorefront } from "react-icons/hi2";
import { RxCross2 } from "react-icons/rx";
import { IoMdAddCircle } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import { PAYMENT_PLANS_TYPE } from "utility/Utility.js";
import "../../../../assets/styles/custom/custom.css";
import { MONTH_LABELS } from "utility/Utility.js";
import { generateYears } from "utility/Utility.js";

export default function UnitList() {
  const {
    loading,
    setLoading,
    notifyError,
    notifySuccess,
    backdrop,
    setBackdrop,
  } = useContext(MainContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addModal, setAddModal] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const { floorId } = useParams();
  const [units, setUnits] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
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
      unitCost: 0,
      customerCost: 0,
      monthWiseTotal: 0,
      monthSpecificTotal: 0,
      monthWisePaymentList: [{ fromMonth: 0, toMonth: 0, amount: 0 }],
      monthSpecificPaymentList: [{ month: 0, year: 0, amount: 0 }],
    },
  });

  const fetchUnitList = async () => {
    setLoading(true);
    try {
      const requestBody = {
        floorId,
        page,
        size: pageSize,
        sortBy: "id",
        sortDir: "asc",
      };

      const response = await httpService.post(
        `/unit/getByFloorId`,
        requestBody
      );

      setUnits(response?.data?.content || []);
      setTotalPages(response?.data?.totalPages || 0);
      setTotalElements(response?.data?.totalElements || 0);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUnitList();
  }, [page, pageSize]);

  const tableColumns = [
    { header: "Serial No", field: "serialNo" },
    { header: "Square Foot", field: "squareFoot" },
    { header: "Room Count", field: "roomCount" },
    { header: "Bathroom Count", field: "bathroomCount" },
    { header: "Payment Plan Type", field: "paymentPlanType" },
    { header: "Amount", field: "amount" },
    { header: "Floor Number", field: "floorNo" },
    { header: "Project Name", field: "projectName" },
    {
      header: "Booked",
      field: "booked",
      render: (value) => {
        const baseClass = "font-semibold uppercase";
        if (value === true)
          return <span className={`${baseClass} text-green-600`}>YES</span>;
        if (value === false)
          return <span className={`${baseClass} text-blue-600`}>NO</span>;
      },
    },
  ];

  const handleView = (data) => {
    const formattedUnitDetails = {
      "Unit Details": {
        "Serial No": data?.serialNo,
        "Square Foot": data?.squareFoot,
        "Room Count": data?.roomCount,
        "Bathroom Count": data?.bathroomCount,
        "Payment Plan Type": data?.paymentPlanType,
        Amount: data?.amount,
        "Additional Amount": data?.additionalAmount,
        "Total Amount": Number(data?.amount) + Number(data?.additionalAmount),
        "Unit Type": data?.unitType,
        "Floor No": data?.floorNo,
        "Project Name": data?.projectName,
        Booked: data?.booked ? "Yes" : "No",
      },
      "Audit Info": {
        "Created By": data?.createdBy,
        "Created Date": data?.createdDate,
        "Updated By": data?.updatedBy,
        "Updated Date": data?.updatedDate,
      },
    };
    setSelectedUnit(formattedUnitDetails);
    toggleModal();
  };

  const history = useHistory();

  const handleSchedule = async (unit) => {
    history.push("/dashboard/customer-schedule/" + unit?.id);
  };
  const handleEdit = async (unit) => {
    setLoading(true);
    try {
      const response = await httpService.get(`/unit/getDetailsById/${unit.id}`);
      const data = await response.data;

      const schedule = data?.paymentSchedule;

      // Parse all numeric values safely
      const actualAmount = parseFloat(schedule?.actualAmount) || 0;
      const miscellaneousAmount =
        parseFloat(schedule?.miscellaneousAmount) || 0;
      const downPayment = parseFloat(schedule?.downPayment) || 0;
      const developmentAmount = parseFloat(schedule?.developmentAmount) || 0;
      const quarterlyPayment = parseFloat(schedule?.quarterlyPayment) || 0;
      const halfYearlyPayment = parseFloat(schedule?.halfYearlyPayment) || 0;
      const yearlyPayment = parseFloat(schedule?.yearlyPayment) || 0;
      const onPossessionPayment =
        parseFloat(schedule?.onPossessionPayment) || 0;

      const durationInMonths = schedule.durationInMonths;
      const quarterlyPeriods = Math.floor(durationInMonths / 3);
      const halfYearlyPeriods = Math.floor(durationInMonths / 6);
      const yearlyPeriods = Math.floor(durationInMonths / 12);

      // Calculate totals
      const unitCost = actualAmount + miscellaneousAmount + developmentAmount;

      const customerCost =
        downPayment +
        (quarterlyPeriods > 0 ? quarterlyPayment * quarterlyPeriods : 0) +
        (halfYearlyPeriods > 0 ? halfYearlyPayment * halfYearlyPeriods : 0) +
        (yearlyPeriods > 0 ? yearlyPayment * yearlyPeriods : 0) +
        onPossessionPayment;

      // Update schedule

      schedule.unitCost = unitCost;
      schedule.customerCost = customerCost;

      data.paymentSchedule = schedule;

      console.log("data :: ", data);

      setUnit(data);
      toggleAdd();
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const calculateMonthlyPaymentSum = (schedule) => {
    if (!schedule || !Array.isArray(schedule.monthWisePaymentList)) return 0;

    const duration = parseInt(schedule.durationInMonths) || 0;
    if (duration <= 0) return 0;

    let sum = 0;

    for (const raw of schedule.monthWisePaymentList) {
      // parse and sanitize input
      let from = parseInt(raw.fromMonth) || 0;
      let to = parseInt(raw.toMonth) || 0;
      const amount = parseFloat(raw.amount) || 0;

      // skip zero/invalid amount entries
      if (amount === 0) continue;

      // If from/to are swapped or invalid, fix them
      if (from > to) {
        const tmp = from;
        from = to;
        to = tmp;
      }

      // clamp to valid months range: [1, duration]
      const start = Math.max(1, from);
      const end = Math.min(duration, to);

      // if the clamped range is invalid, skip
      if (end < start) continue;

      const monthsInRange = end - start + 1;
      sum += monthsInRange * amount;
    }

    return sum;
  };

  const calculateMonthlySpecificPaymentSum = (schedule) => {
    if (!schedule || !Array.isArray(schedule.monthSpecificPaymentList))
      return 0;

    let sum = 0;

    schedule.monthSpecificPaymentList.map(
      (payment) => (sum += Number(payment.amount))
    );

    return sum;
  };

  const actions = [
    {
      icon: FaEye,
      onClick: handleView,
      title: "Detail",
      className: "text-green-600",
    },
    { icon: FaPen, onClick: handleEdit, title: "Edit", className: "yellow" },
    {
      icon: AiFillSchedule,
      onClick: handleSchedule,
      title: "Payment Schedule",
      className: "text-blue-600",
    },
  ];

  const toggleModal = () => {
    setBackdrop(!backdrop);
    setIsModalOpen(!isModalOpen);
  };

  const handleSubmit = async () => {
    setLoading(true);
    const errors = {};

    if (!unit.serialNo) {
      errors.serialNo = "Serial No is required";
    }
    if ((!unit.squareFoot || unit.squareFoot <= 0) ) {
      errors.squareFoot = "Square Foot must be greater than 0";
    }
    if ((!unit.roomCount || unit.roomCount <= 0) && unit.unitType == "APARTMENT") {
      errors.roomCount = "Room Count must be greater than 0";
    }
    if ((!unit.bathroomCount || unit.bathroomCount <= 0) && unit.unitType == "APARTMENT") {
      errors.bathroomCount = "Bathroom Count must be greater than 0";
    }

    if (Object.keys(errors).length > 0) {
      notifyError("Please fix validation errors", Object.values(errors).join(", "), 4000);
      setLoading(false);
      return;
    }

    try {
      const response = await httpService.post(`/unit/addOrUpdate`, unit);
      const data = await response.data;

      notifySuccess(response.responseMessage, 4000);
      await fetchUnitList();
      toggleAdd();
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const toggleAdd = () => {
    setBackdrop(!backdrop);
    setAddModal(!addModal);
  };

  const onChangeUnit = (e) => {
    setUnit({ ...unit, [e.target.name]: e.target.value });
  };

  const changePaymentScheduleFields = (e) => {
    const updatedUnits = { ...unit };
    const schedule = {
      ...unit.paymentSchedule,
      [e.target.name]: e.target.value,
    };

    // Parse all numeric values safely
    const actualAmount = parseFloat(schedule?.actualAmount) || 0;
    const developmentAmount = parseFloat(schedule?.developmentAmount) || 0;
    const miscellaneousAmount = parseFloat(schedule?.miscellaneousAmount) || 0;
    const downPayment = parseFloat(schedule?.downPayment) || 0;
    const quarterlyPayment = parseFloat(schedule?.quarterlyPayment) || 0;
    const halfYearlyPayment = parseFloat(schedule?.halfYearlyPayment) || 0;
    const yearlyPayment = parseFloat(schedule?.yearlyPayment) || 0;
    const onPossessionPayment = parseFloat(schedule?.onPossessionPayment) || 0;

    const durationInMonths = schedule.durationInMonths;
    const quarterlyPeriods = Math.floor(durationInMonths / 3);
    const halfYearlyPeriods = Math.floor(durationInMonths / 6);
    const yearlyPeriods = Math.floor(durationInMonths / 12);

    // Calculate totals
    const unitCost = actualAmount + miscellaneousAmount + developmentAmount;

    const customerCost =
      downPayment +
      (quarterlyPeriods > 0 ? quarterlyPayment * quarterlyPeriods : 0) +
      (halfYearlyPeriods > 0 ? halfYearlyPayment * halfYearlyPeriods : 0) +
      (yearlyPeriods > 0 ? yearlyPayment * yearlyPeriods : 0) +
      onPossessionPayment;

    // Update schedule

    schedule.unitCost = unitCost;
    schedule.customerCost = customerCost;

    updatedUnits.paymentSchedule = schedule;
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

  const addMonthSpecificPayment = () => {
    setUnit((prevUnit) => ({
      ...prevUnit,
      paymentSchedule: {
        ...prevUnit.paymentSchedule,
        monthSpecificPaymentList: [
          ...(prevUnit.paymentSchedule?.monthSpecificPaymentList || []),
          { month: "", year: "", amount: 0 },
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

      let updatedSchedule = {
        ...prevUnit.paymentSchedule,
        monthWisePaymentList: updatedList,
      };

      let monthWiseTotal = calculateMonthlyPaymentSum(updatedSchedule);

      updatedSchedule.monthWiseTotal = monthWiseTotal;
      return {
        ...prevUnit,
        paymentSchedule: updatedSchedule,
      };
    });
  };

  const handleMonthSpecificPaymentChange = (index, e) => {
    setUnit((prevUnit) => {
      const updatedList = [
        ...prevUnit.paymentSchedule.monthSpecificPaymentList,
      ];
      updatedList[index] = {
        ...updatedList[index],
        [e.target.name]: e.target.value,
      };

      let updatedSchedule = {
        ...prevUnit.paymentSchedule,
        monthSpecificPaymentList: updatedList,
      };

      let monthWiseTotal = calculateMonthlySpecificPaymentSum(updatedSchedule);

      updatedSchedule.monthSpecificTotal = monthWiseTotal;
      return {
        ...prevUnit,
        paymentSchedule: updatedSchedule,
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

  const removeMonthSpecificPayment = (monthIndex) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this month specific payment?"
    );
    if (!confirmed) return;

    setUnit((prevUnit) => {
      const updatedUnit = { ...prevUnit };
      updatedUnit.paymentSchedule.monthSpecificPaymentList.splice(
        monthIndex,
        1
      );
      return updatedUnit;
    });
  };

  return (
    <div className="container mx-auto p-4">
      {addModal ? (
        <>
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="p-4 bg-white rounded modal-height-add-unit inset-0 z-50 mx-auto  fixed-unit-position modal-height"
          >
            <div className="flex justify-between items-center mb-4 p-4">
              <h2 className="text-xl font-bold uppercase">
                {unit.id ? "Update" : "Add"} Unit Form
              </h2>
              <button onClick={toggleAdd}>
                <RxCross2 className="w-5 h-5 text-red-500" />
              </button>
            </div>

            <div className="space-y-4 payback-form">
              {/* Unit Information Section */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
                  <FaBuilding className="mr-2" style={{ fontSize: "14px", color: "#10b981" }} />
                  Unit Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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

              {/* Unit Costing Section */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
                  <FaMoneyBillWave className="mr-2" style={{ fontSize: "14px", color: "#f59e0b" }} />
                  Unit Costing
                  <span className="ml-3 text-green-600 font-bold">
                    ({parseFloat(unit.paymentSchedule?.unitCost).toLocaleString()})
                  </span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Duration In Months
                    </label>
                    <input
                      id="durationInMonths"
                      type="text"
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
                      id="actualAmount"
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
                      id="miscellaneousAmount"
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
                      id="developmentAmount"
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
                      id="totalAmount"
                      type="text"
                      name="totalAmount"
                      disabled
                      className="w-full p-2 border rounded-lg text-sm bg-gray-100 cursor-not-allowed"
                      value={
                        Number(unit.paymentSchedule.actualAmount) +
                        Number(unit.paymentSchedule.miscellaneousAmount) +
                        Number(unit.paymentSchedule.developmentAmount)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Customer Payment Schedule - INSTALLMENT_RANGE */}
              {unit.paymentPlanType == "INSTALLMENT_RANGE" && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
                    <FaCreditCard
                      className="mr-2"
                      style={{
                        fontSize: "12px",
                        color: "#ffffff",
                        backgroundColor: "#6366f1",
                        borderRadius: "9999px",
                        padding: "4px",
                      }}
                    />
                    Customer Payment Schedule
                    {(() => {
                      const unitCost = unit.paymentSchedule.unitCost;
                      const customerCost =
                        unit.paymentSchedule?.customerCost +
                        unit.paymentSchedule?.monthWiseTotal;
                      const classColor =
                        unitCost == customerCost
                          ? "text-green-600"
                          : unitCost > customerCost
                          ? "text-blue-600"
                          : "text-red-600";
                      return (
                        <span className={`ml-3 font-bold ${classColor}`}>
                          ({parseFloat(customerCost).toLocaleString()})
                        </span>
                      );
                    })()}
                  </h3>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Left Section - Fixed Payments */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="text-xs font-bold text-indigo-600 uppercase mb-4 flex items-center border-b border-gray-100 pb-2">
                        <FaMoneyBillWave
                          className="mr-2"
                          style={{
                            fontSize: "12px",
                            color: "#4f46e5",
                            backgroundColor: "#e0e7ff",
                            borderRadius: "9999px",
                            padding: "4px",
                          }}
                        />
                        Fixed Payments
                      </h4>
                      <div className="grid grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Down Payment</label>
                          <input
                            id="downPayment"
                            type="number"
                            name="downPayment"
                            className="w-full p-1.5 border rounded-lg text-sm"
                            onChange={(e) => changePaymentScheduleFields(e)}
                            value={unit.paymentSchedule.downPayment}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Quarterly Payment</label>
                          <input
                            id="quarterlyPayment"
                            type="text"
                            name="quarterlyPayment"
                            className="w-full p-1.5 border rounded-lg text-sm"
                            onChange={(e) => changePaymentScheduleFields(e)}
                            value={unit.paymentSchedule.quarterlyPayment}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Half-Yearly Payment</label>
                          <input
                            id="halfYearlyPayment"
                            type="text"
                            name="halfYearlyPayment"
                            className="w-full p-1.5 border rounded-lg text-sm"
                            onChange={(e) => changePaymentScheduleFields(e)}
                            value={unit.paymentSchedule.halfYearlyPayment}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Yearly Payment</label>
                          <input
                            id="yearlyPayment"
                            type="text"
                            name="yearlyPayment"
                            className="w-full p-1.5 border rounded-lg text-sm"
                            onChange={(e) => changePaymentScheduleFields(e)}
                            value={unit.paymentSchedule.yearlyPayment}
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">On Possession</label>
                          <input
                            id="onPossessionPayment"
                            type="text"
                            name="onPossessionPayment"
                            className="w-full p-1.5 border rounded-lg text-sm"
                            onChange={(e) => changePaymentScheduleFields(e)}
                            value={unit.paymentSchedule.onPossessionPayment}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Month Wise Payment */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-4">
                        <h4 className="text-xs font-bold text-purple-600 uppercase flex items-center">
                          <FaCalendarCheck
                            className="mr-2"
                            style={{
                              fontSize: "12px",
                              color: "#7c3aed",
                              backgroundColor: "#ede9fe",
                              borderRadius: "9999px",
                              padding: "4px",
                            }}
                          />
                          Monthly Installments
                        </h4>
                        <button
                          type="button"
                          onClick={() => addMonthWisePayment()}
                          className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-3 py-1 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150 inline-flex items-center"
                        >
                          <IoMdAddCircle className="mr-1" />
                          Row
                        </button>
                      </div>

                      <div className="space-y-3">
                        {unit?.paymentSchedule?.monthWisePaymentList?.map(
                          (monthly, mIndex) => (
                            <div key={mIndex} className="bg-gray-50 rounded-lg px-3 py-2">
                              <div className="grid grid-cols-4 gap-2">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
                                  <input
                                    type="text"
                                    name="fromMonth"
                                    className="w-full p-1.5 border rounded-lg text-sm"
                                    onChange={(e) => handleMonthWisePaymentChange(mIndex, e)}
                                    value={unit.paymentSchedule.monthWisePaymentList[mIndex].fromMonth}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
                                  <input
                                    type="text"
                                    name="toMonth"
                                    className="w-full p-1.5 border rounded-lg text-sm"
                                    onChange={(e) => handleMonthWisePaymentChange(mIndex, e)}
                                    value={unit.paymentSchedule.monthWisePaymentList[mIndex].toMonth}
                                  />
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
                                  <input
                                    type="text"
                                    name="amount"
                                    className="w-full p-1.5 border rounded-lg text-sm"
                                    onChange={(e) => handleMonthWisePaymentChange(mIndex, e)}
                                    value={unit.paymentSchedule.monthWisePaymentList[mIndex].amount}
                                  />
                                </div>
                                <div className="flex items-end justify-center pb-1 mt-5">
                                  <button
                                    type="button"
                                    onClick={() => removeMonthWisePayment(mIndex)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <MdDeleteForever style={{ fontSize: "20px" }} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Customer Payment Schedule - INSTALLMENT_SPECIFIC */}
              {unit.paymentPlanType == "INSTALLMENT_SPECIFIC" && (
                <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                  <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
                    <FaCreditCard
                      className="mr-2"
                      style={{
                        fontSize: "12px",
                        color: "#ffffff",
                        backgroundColor: "#6366f1",
                        borderRadius: "9999px",
                        padding: "4px",
                      }}
                    />
                    Customer Payment Schedule
                    {(() => {
                      const unitCost = unit.paymentSchedule.unitCost;
                      const customerCost =
                        unit.paymentSchedule?.customerCost +
                        unit.paymentSchedule?.monthSpecificTotal;
                      const classColor =
                        unitCost == customerCost
                          ? "text-green-600"
                          : unitCost > customerCost
                          ? "text-blue-600"
                          : "text-red-600";
                      return (
                        <span className={`ml-3 font-bold ${classColor}`}>
                          ({parseFloat(customerCost).toLocaleString()})
                        </span>
                      );
                    })()}
                  </h3>

                  <div className="grid grid-cols-2 gap-6">
                    {/* Left Section - Fixed Payments */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <h4 className="text-xs font-bold text-indigo-600 uppercase mb-4 flex items-center border-b border-gray-100 pb-2">
                        <FaMoneyBillWave
                          className="mr-2"
                          style={{
                            fontSize: "12px",
                            color: "#4f46e5",
                            backgroundColor: "#e0e7ff",
                            borderRadius: "9999px",
                            padding: "4px",
                          }}
                        />
                        Fixed Payments
                      </h4>
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <label className="block text-xs font-medium text-gray-700 mb-1">Down Payment</label>
                          <input
                            id="downPayment"
                            type="number"
                            name="downPayment"
                            className="w-full p-1.5 border rounded-lg text-sm"
                            onChange={(e) => changePaymentScheduleFields(e)}
                            value={unit.paymentSchedule.downPayment}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Right Section - Month Specific Payment */}
                    <div className="bg-white rounded-lg p-4 border border-gray-200">
                      <div className="flex justify-between items-center border-b border-gray-100 pb-2 mb-4">
                        <h4 className="text-xs font-bold text-purple-600 uppercase flex items-center">
                          <FaCalendarCheck
                            className="mr-2"
                            style={{
                              fontSize: "12px",
                              color: "#7c3aed",
                              backgroundColor: "#ede9fe",
                              borderRadius: "9999px",
                              padding: "4px",
                            }}
                          />
                          Monthly Installments
                        </h4>
                        <button
                          type="button"
                          onClick={() => addMonthSpecificPayment()}
                          className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-3 py-1 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150 inline-flex items-center"
                        >
                          <IoMdAddCircle className="mr-1" />
                          Row
                        </button>
                      </div>

                      <div className="space-y-3">
                        {unit?.paymentSchedule?.monthSpecificPaymentList?.map(
                          (monthly, mIndex) => (
                            <div key={mIndex} className="bg-gray-50 rounded-lg px-3 py-2">
                              <div className="grid grid-cols-4 gap-2">
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Month</label>
                                  <select
                                    name="month"
                                    className="w-full p-1.5 border rounded-lg text-sm"
                                    onChange={(e) => handleMonthSpecificPaymentChange(mIndex, e)}
                                    value={unit.paymentSchedule.monthSpecificPaymentList[mIndex].month}
                                  >
                                    <option>Select</option>
                                    {MONTH_LABELS.map((month) => (
                                      <option key={month} value={month}>
                                        {month}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Year</label>
                                  <select
                                    name="year"
                                    className="w-full p-1.5 border rounded-lg text-sm"
                                    onChange={(e) => handleMonthSpecificPaymentChange(mIndex, e)}
                                    value={unit.paymentSchedule.monthSpecificPaymentList[mIndex].year}
                                  >
                                    <option>Select</option>
                                    {generateYears(10, 10).map((year) => (
                                      <option key={year} value={year}>
                                        {year}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                                <div>
                                  <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
                                  <input
                                    type="number"
                                    name="amount"
                                    className="w-full p-1.5 border rounded-lg text-sm"
                                    onChange={(e) => handleMonthSpecificPaymentChange(mIndex, e)}
                                    value={unit.paymentSchedule.monthSpecificPaymentList[mIndex].amount}
                                  />
                                </div>
                                <div className="flex items-end justify-center pb-1">
                                  <button
                                    type="button"
                                    onClick={() => removeMonthSpecificPayment(mIndex)}
                                    className="text-red-500 hover:text-red-700"
                                  >
                                    <MdDeleteForever style={{ fontSize: "20px" }} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="w-full lg:w-4/12 px-4 mb-3">
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="mt-7 ml-4 bg-emerald-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
                >
                  <HiMiniBuildingStorefront
                    className="w-5 h-5 inline-block "
                    style={{ paddingBottom: "3px", paddingRight: "5px" }}
                  />
                  ADD UNIT
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <></>
      )}
      <DynamicDetailsModal
        isOpen={isModalOpen}
        onClose={toggleModal}
        data={selectedUnit}
        title="Customer Details"
      />
      <DynamicTableComponent
        fetchDataFunction={fetchUnitList}
        setPage={setPage}
        setPageSize={setPageSize}
        page={page}
        data={units}
        columns={tableColumns}
        pageSize={pageSize}
        totalPages={totalPages}
        totalElements={totalElements}
        loading={loading}
        title="Unit Details"
        actions={actions}
        firstButton={{
          title: "Add Unit",
          onClick: toggleAdd,
          icon: HiMiniBuildingStorefront,
          className: "bg-emerald-500",
        }}
      />
    </div>
  );
}
