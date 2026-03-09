import React, { useContext, useEffect, useState } from "react";
import { projectTypes, unitTypes } from "utility/Utility";
import { FaLayerGroup, FaBuilding, FaMapMarkerAlt, FaCalendarAlt, FaInfoCircle, FaMoneyBillAlt } from "react-icons/fa";
import { HiMiniBuildingStorefront } from "react-icons/hi2";
import { IoMdAddCircle } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import { BsBuildingFillAdd } from "react-icons/bs";
import { MainContext } from "context/MainContext";
import httpService from "utility/httpService";
import { PAYMENT_PLANS_TYPE } from "utility/Utility";
import { IoArrowBackOutline } from "react-icons/io5";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { generateYears } from "utility/Utility";
import { MONTH_LABELS } from "utility/Utility";
import { BiCommentDetail } from "react-icons/bi";
import { GrMoney } from "react-icons/gr";
import { PiBuildingsLight } from "react-icons/pi";
import { RiHome4Line } from "react-icons/ri";


export default function AddProject() {
  const { setLoading, notifyError, notifySuccess } = useContext(MainContext);
  const [floors, setFloors] = useState([]);
  const [project, setProject] = useState({
    name: "",
    address: "",
    floors: 0,
    purchasingAmount: 0,
    registrationAmount: 0,
    additionalAmount: 0,
    totalAmount: 0,
    information: "",
    organizationId: 0,
    projectType: "",
    monthDuration: 0,
    floorList: [],
  });

  const [indexes, setIndexes] = useState([
    {
      floor: 0,
      unitIndexes: [],
    },
  ]);

  const changeCollapseFloor = (floorIndex) => {
    const isFloorExist = indexes.some((floor) => floor.floor === floorIndex);

    let updatedIndexes;

    if (isFloorExist) {
      updatedIndexes = indexes.filter((floor) => floor.floor !== floorIndex);
    } else {
      updatedIndexes = [
        ...indexes,
        {
          floor: floorIndex,
          unitIndexes: [],
        },
      ];
    }
    setIndexes(updatedIndexes);
  };

  const toggleUnitIndex = (floorIndex, unitIndex) => {
    setIndexes((prevIndexes) =>
      prevIndexes.map((floorData) => {
        if (floorData.floor === floorIndex) {
          const isSelected = floorData.unitIndexes.includes(unitIndex);
          return {
            ...floorData,
            unitIndexes: isSelected
              ? floorData.unitIndexes.filter((index) => index !== unitIndex)
              : [...floorData.unitIndexes, unitIndex],
          };
        }
        return floorData;
      })
    );
  };

  const addFloor = () => {
    setFloors((prevFloors) => [
      ...prevFloors,
      {
        floor: prevFloors.length,
        unitList: [],
      },
    ]);
  };

  const removeFloor = (floorIndex) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this floor?"
    );
    if (!confirmed) return; // If user cancels, do nothing

    const updatedFloors = [...floors]; // make a shallow copy
    updatedFloors.splice(floorIndex, 1); // remove 1 item at floorIndex
    setFloors(updatedFloors); // update the state
  };

  const addUnit = (floorIndex) => {
    const updatedFloors = [...floors];
    updatedFloors[floorIndex].unitList.push({
      serialNo: "",
      amount: 0,
      squareFoot: 0,
      unitType: "APARTMENT",
      roomCount: 0,
      bathroomCount: 0,
      paymentPlanType: "ONE_TIME_PAYMENT",
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
    setFloors(updatedFloors);
  };

  const removeUnit = (floorIndex, unitIndex) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this unit?"
    );
    if (!confirmed) return; // If user cancels, do nothing

    const updatedFloors = [...floors]; // Copy the floors array
    updatedFloors[floorIndex].unitList.splice(unitIndex, 1); // Remove the unit from the unitList
    setFloors(updatedFloors); // Update the state
  };

  const changeProjectFields = (value) => {
    setProject({ ...project, [value.target.name]: value.target.value });
  };

  const changeUnitFields = (floorIndex, unitIndex, e) => {
    const updatedFloors = [...floors];
    updatedFloors[floorIndex].unitList[unitIndex][e.target.name] =
      e.target.value;
    setFloors(updatedFloors);
  };

  const changePaymentScheduleFields = (floorIndex, unitIndex, e) => {
    const updatedFloors = [...floors];
    const schedule =
      updatedFloors[floorIndex].unitList[unitIndex].paymentSchedule;

    // Update the changed field
    schedule[e.target.name] = e.target.value;

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

    setFloors(updatedFloors);
  };

  const changeMonthlyPaymentFields = (
    floorIndex,
    unitIndex,
    monthlyIndex,
    e
  ) => {
    const updatedFloors = [...floors];
    updatedFloors[floorIndex].unitList[
      unitIndex
    ].paymentSchedule.monthWisePaymentList[monthlyIndex][e.target.name] =
      e.target.value;

    const schedule =
      updatedFloors[floorIndex].unitList[unitIndex].paymentSchedule;

    let monthWiseTotal = 0;
    monthWiseTotal = calculateMonthlyPaymentSum(schedule);

    updatedFloors[floorIndex].unitList[
      unitIndex
    ].paymentSchedule.monthWiseTotal = monthWiseTotal;

    setFloors(updatedFloors);
  };

  const changeMonthlySpecificPaymentFields = (
    floorIndex,
    unitIndex,
    monthlyIndex,
    e
  ) => {
    const updatedFloors = [...floors];
    updatedFloors[floorIndex].unitList[
      unitIndex
    ].paymentSchedule.monthSpecificPaymentList[monthlyIndex][e.target.name] =
      e.target.value;

    const schedule =
      updatedFloors[floorIndex].unitList[unitIndex].paymentSchedule;

    let monthWiseTotal = calculateMonthlySpecificPaymentSum(schedule);

    updatedFloors[floorIndex].unitList[
      unitIndex
    ].paymentSchedule.monthSpecificTotal = monthWiseTotal;

    setFloors(updatedFloors);
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

  const onClickAddMonthlyRow = (floorIndex, unitIndex) => {
    const addedRow = { fromMonth: 0, toMonth: 0, amount: 0 };

    setFloors((prevFloors) => {
      const updatedFloors = [...prevFloors];
      const updatedUnitList = [...updatedFloors[floorIndex].unitList];
      const updatedPaymentSchedule = {
        ...updatedUnitList[unitIndex].paymentSchedule,
      };
      const updatedMonthWisePaymentList = [
        ...updatedPaymentSchedule.monthWisePaymentList,
        addedRow,
      ];

      updatedPaymentSchedule.monthWisePaymentList = updatedMonthWisePaymentList;
      updatedUnitList[unitIndex] = {
        ...updatedUnitList[unitIndex],
        paymentSchedule: updatedPaymentSchedule,
      };
      updatedFloors[floorIndex] = {
        ...updatedFloors[floorIndex],
        unitList: updatedUnitList,
      };

      return updatedFloors;
    });
  };

  const onClickAddMonthlySpecificRow = (floorIndex, unitIndex) => {
    const addedRow = { month: "", year: "", amount: 0 };

    setFloors((prevFloors) => {
      const updatedFloors = [...prevFloors];
      const updatedUnitList = [...updatedFloors[floorIndex].unitList];
      const updatedPaymentSchedule = {
        ...updatedUnitList[unitIndex].paymentSchedule,
      };
      const updatedMonthSpecificPaymentList = [
        ...updatedPaymentSchedule.monthSpecificPaymentList,
        addedRow,
      ];

      updatedPaymentSchedule.monthSpecificPaymentList =
        updatedMonthSpecificPaymentList;
      updatedUnitList[unitIndex] = {
        ...updatedUnitList[unitIndex],
        paymentSchedule: updatedPaymentSchedule,
      };
      updatedFloors[floorIndex] = {
        ...updatedFloors[floorIndex],
        unitList: updatedUnitList,
      };

      return updatedFloors;
    });
  };

  const removeMonthWisePayment = (floorIndex, unitIndex, monthIndex) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this month-wise payment?"
    );
    if (!confirmed) return;

    setFloors((prevFloors) => {
      const updatedFloors = [...prevFloors];
      updatedFloors[floorIndex].unitList[
        unitIndex
      ].paymentSchedule.monthWisePaymentList.splice(monthIndex, 1);
      return updatedFloors;
    });
  };

  const removeMonthSpecificPayment = (floorIndex, unitIndex, monthIndex) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this month specific payment?"
    );
    if (!confirmed) return;

    setFloors((prevFloors) => {
      const updatedFloors = [...prevFloors];
      updatedFloors[floorIndex].unitList[
        unitIndex
      ].paymentSchedule.monthSpecificPaymentList.splice(monthIndex, 1);
      return updatedFloors;
    });
  };

  const createProject = async (e) => {
    e.preventDefault();
    const requestBody = { ...project };
    requestBody.floorList = floors;
    requestBody.floors = floors.length;
    const organization = JSON.parse(localStorage.getItem("organization")) || {};
    requestBody.organizationId = organization.organizationId;

    setLoading(true);
    try {
      const response = await httpService.post(`/project/add`, requestBody);
      if (response.data) {
        notifySuccess(response.responseMessage, 4000);
      }
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const history = useHistory();

  // 👉 High-level summary metrics for a quick project overview
  const totalFloors = floors.length;
  const totalUnits = floors.reduce(
    (sum, floor) => sum + (floor?.unitList?.length || 0),
    0
  );
  const totalProjectAmount =
    Number(project.additionalAmount || 0) +
    Number(project.purchasingAmount || 0) +
    Number(project.registrationAmount || 0);

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 border-0">
      {/* Header */}
      <div className="mb-4 py-4">
        <h6 className="text-blueGray-700 text-lg font-bold uppercase flex items-center">
          <button onClick={() => history.goBack()} className="mr-3">
            <IoArrowBackOutline className="text-xl" style={{ color: "#64748b" }} />
          </button>
          <FaBuilding className="mr-2" style={{ color: "#6366f1" }} />
          Create Project
        </h6>
      </div>

      <form onSubmit={createProject} className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6">
          <div className="flex flex-wrap -mx-2">
            {/* Project Details Section */}
            <div className="w-full lg:w-6/12 px-2 mb-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 h-full">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
                  <FaBuilding className="mr-2" style={{ fontSize: "14px", color: "#6366f1" }} />
                  Project Details
                </h3>
                <div className="flex flex-wrap -mx-2">
                  <div className="w-full lg:w-6/12 px-2 mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Project Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      onChange={(e) => changeProjectFields(e)}
                      className="w-full p-2 border rounded-lg text-sm"
                      value={project.name}
                    />
                  </div>

                  <div className="w-full lg:w-6/12 px-2 mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <input
                      id="address"
                      type="text"
                      name="address"
                      onChange={(e) => changeProjectFields(e)}
                      className="w-full p-2 border rounded-lg text-sm"
                      value={project.address}
                    />
                  </div>

                  <div className="w-full lg:w-6/12 px-2 mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Project Type
                    </label>
                    <select
                      id="projectType"
                      name="projectType"
                      className="w-full p-2 border rounded-lg text-sm"
                      value={project.projectType}
                      onChange={changeProjectFields}
                    >
                      <option value="">SELECT PROJECT TYPE</option>
                      {projectTypes.map((type, index) => (
                        <option key={index} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full lg:w-6/12 px-2 mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Month Duration
                    </label>
                    <input
                      id="monthDuration"
                      type="number"
                      name="monthDuration"
                      onChange={(e) => changeProjectFields(e)}
                      className="w-full p-2 border rounded-lg text-sm"
                      value={project.monthDuration}
                    />
                  </div>
                  <div className="w-full px-2 mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Project Information
                    </label>
                    <textarea
                      id="information"
                      name="information"
                      rows="3"
                      onChange={(e) => changeProjectFields(e)}
                      className="w-full p-2 border rounded-lg text-sm"
                      value={project.information}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Financial Details Section */}
            <div className="w-full lg:w-6/12 px-2 mb-4">
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 h-full">
                <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
                  <FaMoneyBillAlt className="mr-2" style={{ fontSize: "14px", color: "#10b981" }} />
                  Financial Details
                </h3>
                <div className="flex flex-wrap -mx-2">
                  <div className="w-full lg:w-6/12 px-2 mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Purchasing Amount
                    </label>
                    <input
                      id="purchasingAmount"
                      type="number"
                      name="purchasingAmount"
                      onChange={(e) => changeProjectFields(e)}
                      className="w-full p-2 border rounded-lg text-sm"
                      value={project.purchasingAmount}
                    />
                  </div>
                  <div className="w-full lg:w-6/12 px-2 mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Registration Amount
                    </label>
                    <input
                      id="registrationAmount"
                      type="number"
                      name="registrationAmount"
                      onChange={(e) => changeProjectFields(e)}
                      className="w-full p-2 border rounded-lg text-sm"
                      value={project.registrationAmount}
                    />
                  </div>
                  <div className="w-full lg:w-6/12 px-2 mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Additional Amount
                    </label>
                    <input
                      id="additionalAmount"
                      type="number"
                      name="additionalAmount"
                      onChange={(e) => changeProjectFields(e)}
                      className="w-full p-2 border rounded-lg text-sm"
                      value={project.additionalAmount}
                    />
                  </div>

                  <div className="w-full lg:w-6/12 px-2 mb-3">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Total Amount
                    </label>
                    <input
                      id="totalAmount"
                      type="number"
                      name="totalAmount"
                      readOnly
                      className="w-full p-2 border rounded-lg text-sm bg-gray-100 cursor-not-allowed"
                      value={
                        Number(project.additionalAmount) +
                        Number(project.purchasingAmount) +
                        Number(project.registrationAmount)
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floor List Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 mt-4">
            <div className="flex justify-between items-center border-b border-gray-200 pb-2 mb-4">
              <h3 className="text-sm font-bold text-gray-700 flex items-center">
                <FaLayerGroup className="mr-2" style={{ fontSize: "14px", color: "#10b981" }} />
                Floor List
              </h3>
              <button
                type="button"
                onClick={addFloor}
                className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150 inline-flex items-center"
              >
                <FaLayerGroup className="mr-1" style={{ fontSize: "12px" }} />
                Add Floor
              </button>
            </div>

          {floors.map((floor, floorIndex) => (
            <div key={floorIndex} className="bg-white rounded-lg border border-gray-200 mb-3">
              <div
                className="text-sm font-bold text-gray-700 flex justify-between items-center p-3 cursor-pointer hover:bg-gray-50"
              >
                <div className="flex items-center">
                  <FaLayerGroup className="mr-2" style={{ fontSize: "14px", color: "#6366f1" }} />
                  Floor# {floorIndex}
                </div>
                <div className="flex items-center">
                  <div>
                    <button
                      type="button"
                      onClick={() => addUnit(floorIndex)}
                      className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-3 py-1 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150 inline-flex items-center"
                    >
                      <HiMiniBuildingStorefront className="mr-1" style={{ fontSize: "12px" }} />
                      Add Unit
                    </button>
                  </div>
                  <div className="ml-3">
                    <button
                      type="button"
                      onClick={() => removeFloor(floorIndex)}
                      className="text-red-500 outline-none focus:outline-none ease-linear transition-all duration-150"
                    >
                      <MdDeleteForever style={{ fontSize: "22px" }} />
                    </button>
                  </div>
                  <div
                    className="ml-3 cursor-pointer"
                    onClick={() => changeCollapseFloor(floorIndex)}
                  >
                    {indexes.some((floor) => floor.floor === floorIndex) ? (
                      <i className="fas fa-chevron-up text-gray-500 text-sm"></i>
                    ) : (
                      <i className="fas fa-chevron-down text-gray-500 text-sm"></i>
                    )}
                  </div>
                </div>
              </div>
              {indexes.some((fIndex) => fIndex.floor == floorIndex) && (
                <div className="p-3 border-t border-gray-200">
                  {floor.unitList.map((unit, unitIndex) => (
                    <div
                      key={unitIndex}
                      className="bg-white rounded-lg border border-gray-200 mb-3 p-3"
                    >
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-bold text-gray-700 flex items-center">
                          <HiMiniBuildingStorefront className="mr-2" style={{ fontSize: "14px", color: "#8b5cf6" }} />
                          Unit# {unitIndex + 1}
                        </div>
                        <div className="flex items-center">
                          <button
                            type="button"
                            onClick={() => removeUnit(floorIndex, unitIndex)}
                            className="text-red-500 outline-none focus:outline-none ease-linear transition-all duration-150"
                          >
                            <MdDeleteForever style={{ fontSize: "22px" }} />
                          </button>
                          <div
                            className="ml-3 cursor-pointer"
                            onClick={() =>
                              toggleUnitIndex(floorIndex, unitIndex)
                            }
                          >
                            {indexes
                              .find((floor) => floor.floor === floorIndex)
                              .unitIndexes.some((ui) => ui == unitIndex) ? (
                              <i className="fas fa-chevron-up text-gray-500 text-sm"></i>
                            ) : (
                              <i className="fas fa-chevron-down text-gray-500 text-sm"></i>
                            )}
                          </div>
                        </div>
                      </div>
                      {indexes
                        .find((fIndex) => fIndex.floor == floorIndex)
                        .unitIndexes.some((uIndex) => uIndex == unitIndex) && (
                        <>
                          <div className="flex flex-wrap mt-4 -mx-2">
                            <div className="w-full lg:w-4/12 px-2 mb-3">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Serial No
                              </label>
                              <input
                                type="text"
                                name="serialNo"
                                className="w-full p-2 border rounded-lg text-sm"
                                onChange={(e) =>
                                  changeUnitFields(floorIndex, unitIndex, e)
                                }
                                value={
                                  floors[floorIndex].unitList[unitIndex]
                                    .serialNo
                                }
                              />
                            </div>
                            <div className="w-full lg:w-4/12 px-2 mb-3">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Square Foot
                              </label>
                              <input
                                type="number"
                                name="squareFoot"
                                className="w-full p-2 border rounded-lg text-sm"
                                onChange={(e) =>
                                  changeUnitFields(floorIndex, unitIndex, e)
                                }
                                value={
                                  floors[floorIndex].unitList[unitIndex]
                                    .squareFoot
                                }
                              />
                            </div>
                            <div className="w-full lg:w-4/12 px-2 mb-3">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Unit Type
                              </label>
                              <select
                                name="unitType"
                                className="w-full p-2 border rounded-lg text-sm"
                                value={
                                  floors[floorIndex].unitList[unitIndex]
                                    .unitType
                                }
                                onChange={(e) =>
                                  changeUnitFields(floorIndex, unitIndex, e)
                                }
                              >
                                <option value="">SELECT UNIT TYPE</option>
                                {unitTypes.map((type, index) => (
                                  <option key={index} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <div className="w-full lg:w-4/12 px-2 mb-3">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Room Count
                              </label>
                              <input
                                type="text"
                                name="roomCount"
                                className="w-full p-2 border rounded-lg text-sm"
                                onChange={(e) =>
                                  changeUnitFields(floorIndex, unitIndex, e)
                                }
                                value={
                                  floors[floorIndex].unitList[unitIndex]
                                    .roomCount
                                }
                              />
                            </div>
                            <div className="w-full lg:w-4/12 px-2 mb-3">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Bathroom Count
                              </label>
                              <input
                                type="text"
                                name="bathroomCount"
                                className="w-full p-2 border rounded-lg text-sm"
                                onChange={(e) =>
                                  changeUnitFields(floorIndex, unitIndex, e)
                                }
                                value={
                                  floors[floorIndex].unitList[unitIndex]
                                    .bathroomCount
                                }
                              />
                            </div>
                            <div className="w-full lg:w-4/12 px-2 mb-3">
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Payment Plan Type
                              </label>
                              <select
                                name="paymentPlanType"
                                className="w-full p-2 border rounded-lg text-sm"
                                value={
                                  floors[floorIndex].unitList[unitIndex]
                                    .paymentPlanType
                                }
                                onChange={(e) =>
                                  changeUnitFields(floorIndex, unitIndex, e)
                                }
                              >
                                <option value="">
                                  SELECT PAYMENT PLAN TYPE
                                </option>
                                {PAYMENT_PLANS_TYPE.map((type, index) => (
                                  <option key={index} value={type}>
                                    {type}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </div>
                          <div className="px-4 lg:px-0 mt-7">
                            <div className=" flex flex-wrap ">
                              <div className="w-full px-4 lg:w-6/12 border-right-grey md:px-0">
                                {/* Payment Schedule Heading */}
                                <div className="mt-3 mb-8 text-blueGray-600 text-md uppercase font-bold">
                                  Unit Costing
                                  <text className="ml-3 text-green-600">
                                    (
                                    {parseFloat(
                                      floors?.[floorIndex]?.unitList?.[
                                        unitIndex
                                      ]?.paymentSchedule?.unitCost
                                    ).toLocaleString()}
                                    )
                                  </text>
                                </div>

                                <div className="px-4 flex flex-wrap md:px-0">
                                  {/* === First Section: Payment Overview === */}
                                  <div className="w-full flex flex-wrap   border-blueGray-200 pb-4 mb-4">
                                    {/* Duration In Months */}
                                    <div className="w-full px-4 lg:w-6/12 md:px-0">
                                      <div className="relative w-full mb-3">
                                        <label
                                          className="block text-xs font-medium text-gray-700 mb-1"
                                          htmlFor="durationInMonths"
                                        >
                                          Duration In Months
                                        </label>
                                        <input
                                          id="durationInMonths"
                                          type="text"
                                          name="durationInMonths"
                                          className="w-full p-2 border rounded-lg text-sm"
                                          onChange={(e) =>
                                            changePaymentScheduleFields(
                                              floorIndex,
                                              unitIndex,
                                              e
                                            )
                                          }
                                          value={
                                            floors[floorIndex].unitList[
                                              unitIndex
                                            ].paymentSchedule.durationInMonths
                                          }
                                        />
                                      </div>
                                    </div>

                                    {/* Actual Amount */}
                                    <div className="w-full px-4 lg:w-6/12 md:px-0">
                                      <div className="relative w-full mb-3">
                                        <label
                                          className="block text-xs font-medium text-gray-700 mb-1"
                                          htmlFor="actualAmount"
                                        >
                                          Actual Amount
                                        </label>
                                        <input
                                          id="actualAmount"
                                          type="number"
                                          name="actualAmount"
                                          className="w-full p-2 border rounded-lg text-sm"
                                          onChange={(e) =>
                                            changePaymentScheduleFields(
                                              floorIndex,
                                              unitIndex,
                                              e
                                            )
                                          }
                                          value={
                                            floors[floorIndex].unitList[
                                              unitIndex
                                            ].paymentSchedule.actualAmount
                                          }
                                        />
                                      </div>
                                    </div>

                                    {/* Miscellaneous Amount */}
                                    <div className="w-full px-4 lg:w-6/12 md:px-0">
                                      <div className="relative w-full mb-3">
                                        <label
                                          className="block text-xs font-medium text-gray-700 mb-1"
                                          htmlFor="miscellaneousAmount"
                                        >
                                          Miscellaneous Amount
                                        </label>
                                        <input
                                          id="miscellaneousAmount"
                                          type="number"
                                          name="miscellaneousAmount"
                                          className="w-full p-2 border rounded-lg text-sm"
                                          onChange={(e) =>
                                            changePaymentScheduleFields(
                                              floorIndex,
                                              unitIndex,
                                              e
                                            )
                                          }
                                          value={
                                            floors[floorIndex].unitList[
                                              unitIndex
                                            ].paymentSchedule
                                              .miscellaneousAmount
                                          }
                                        />
                                      </div>
                                    </div>

                                    {/* Development Amount */}
                                    <div className="w-full px-4 lg:w-6/12 md:px-0">
                                      <div className="relative w-full mb-3">
                                        <label
                                          className="block text-xs font-medium text-gray-700 mb-1"
                                          htmlFor="miscellaneousAmount"
                                        >
                                          Development Amount
                                        </label>
                                        <input
                                          id="developmentAmount"
                                          type="number"
                                          name="developmentAmount"
                                          className="w-full p-2 border rounded-lg text-sm"
                                          onChange={(e) =>
                                            changePaymentScheduleFields(
                                              floorIndex,
                                              unitIndex,
                                              e
                                            )
                                          }
                                          value={
                                            floors[floorIndex].unitList[
                                              unitIndex
                                            ].paymentSchedule.developmentAmount
                                          }
                                        />
                                      </div>
                                    </div>

                                    {/* Total Amount */}
                                    <div className="w-full px-4 lg:w-6/12 md:px-0">
                                      <div className="relative w-full mb-3">
                                        <label
                                          className="block text-xs font-medium text-gray-700 mb-1"
                                          htmlFor="totalAmount"
                                        >
                                          Total Amount
                                        </label>
                                        <input
                                          id="totalAmount"
                                          type="text"
                                          name="totalAmount"
                                          disabled
                                          className="w-full p-2 border rounded-lg text-sm bg-gray-100 cursor-not-allowed"
                                          value={
                                            Number(
                                              floors[floorIndex].unitList[
                                                unitIndex
                                              ].paymentSchedule.actualAmount
                                            ) +
                                            Number(
                                              floors[floorIndex].unitList[
                                                unitIndex
                                              ].paymentSchedule
                                                .miscellaneousAmount
                                            ) +
                                            Number(
                                              floors[floorIndex].unitList[
                                                unitIndex
                                              ].paymentSchedule
                                                .developmentAmount
                                            )
                                          }
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {floors[floorIndex]?.unitList[unitIndex]
                                ?.paymentPlanType == "INSTALLMENT_RANGE" ? (
                                <div className="w-full lg:w-6/12 ">
                                  <div className="relative w-full">
                                    <div className="ml-3 mt-3  text-blueGray-600 text-md uppercase font-bold">
                                      Customer Payment Schedule
                                      {(() => {
                                        const unitCost =
                                          floors?.[floorIndex]?.unitList?.[
                                            unitIndex
                                          ]?.paymentSchedule?.unitCost;

                                        const customerCost =
                                          floors?.[floorIndex]?.unitList?.[
                                            unitIndex
                                          ]?.paymentSchedule?.customerCost +
                                          floors?.[floorIndex]?.unitList?.[
                                            unitIndex
                                          ]?.paymentSchedule?.monthWiseTotal;

                                        const classColor =
                                          unitCost == customerCost
                                            ? "text-green-600"
                                            : unitCost > customerCost
                                            ? "text-blue-600"
                                            : "text-red-600";
                                        return (
                                          <text
                                            className={`ml-3 ${classColor}`}
                                          >
                                            (
                                            {parseFloat(
                                              customerCost
                                            ).toLocaleString()}
                                            )
                                          </text>
                                        );
                                      })()}
                                    </div>
                                    <div className="mt-6 flex flex-wrap">
                                      <>
                                        <div className="w-full px-4 lg:w-6/12 md:px-0">
                                          <div className="relative w-full mb-3">
                                            <label
                                              className="block text-xs font-medium text-gray-700 mb-1"
                                              htmlFor="downPayment"
                                            >
                                              Down Payment
                                            </label>
                                            <input
                                              id="downPayment"
                                              type="number"
                                              name="downPayment"
                                              className="w-full p-2 border rounded-lg text-sm"
                                              onChange={(e) =>
                                                changePaymentScheduleFields(
                                                  floorIndex,
                                                  unitIndex,
                                                  e
                                                )
                                              }
                                              value={
                                                floors[floorIndex].unitList[
                                                  unitIndex
                                                ].paymentSchedule.downPayment
                                              }
                                            />
                                          </div>
                                        </div>
                                        {/* Quarterly Payment */}
                                        <div className="w-full px-4 lg:w-6/12 md:px-0">
                                          <div className="relative w-full mb-3">
                                            <label
                                              className="block text-xs font-medium text-gray-700 mb-1"
                                              htmlFor="quarterlyPayment"
                                            >
                                              Quarterly Payment
                                            </label>
                                            <input
                                              id="quarterlyPayment"
                                              type="text"
                                              name="quarterlyPayment"
                                              className="w-full p-2 border rounded-lg text-sm"
                                              onChange={(e) =>
                                                changePaymentScheduleFields(
                                                  floorIndex,
                                                  unitIndex,
                                                  e
                                                )
                                              }
                                              value={
                                                floors[floorIndex].unitList[
                                                  unitIndex
                                                ].paymentSchedule
                                                  .quarterlyPayment
                                              }
                                            />
                                          </div>
                                        </div>
                                        {/* Half-Yearly Payment */}
                                        <div className="w-full px-4 lg:w-6/12 md:px-0">
                                          <div className="relative w-full mb-3">
                                            <label
                                              className="block text-xs font-medium text-gray-700 mb-1"
                                              htmlFor="halfYearlyPayment"
                                            >
                                              Half-Yearly Payment
                                            </label>
                                            <input
                                              id="halfYearlyPayment"
                                              type="text"
                                              name="halfYearlyPayment"
                                              className="w-full p-2 border rounded-lg text-sm"
                                              onChange={(e) =>
                                                changePaymentScheduleFields(
                                                  floorIndex,
                                                  unitIndex,
                                                  e
                                                )
                                              }
                                              value={
                                                floors[floorIndex].unitList[
                                                  unitIndex
                                                ].paymentSchedule
                                                  .halfYearlyPayment
                                              }
                                            />
                                          </div>
                                        </div>
                                        <div className="w-full px-4 lg:w-6/12 md:px-0">
                                          <div className="relative w-full mb-3">
                                            <label
                                              className="block text-xs font-medium text-gray-700 mb-1"
                                              htmlFor="yearlyPayment"
                                            >
                                              Yearly Payment
                                            </label>
                                            <input
                                              id="yearlyPayment"
                                              type="text"
                                              name="yearlyPayment"
                                              className="w-full p-2 border rounded-lg text-sm"
                                              onChange={(e) =>
                                                changePaymentScheduleFields(
                                                  floorIndex,
                                                  unitIndex,
                                                  e
                                                )
                                              }
                                              value={
                                                floors[floorIndex].unitList[
                                                  unitIndex
                                                ].paymentSchedule.yearlyPayment
                                              }
                                            />
                                          </div>
                                        </div>
                                        <div className="w-full px-4 lg:w-6/12 md:px-0">
                                          <div className="relative w-full mb-3">
                                            <label
                                              className="block text-xs font-medium text-gray-700 mb-1"
                                              htmlFor="onPossessionPayment"
                                            >
                                              On Possession Payment
                                            </label>
                                            <input
                                              id="onPossessionPayment"
                                              type="text"
                                              name="onPossessionPayment"
                                              className="w-full p-2 border rounded-lg text-sm"
                                              onChange={(e) =>
                                                changePaymentScheduleFields(
                                                  floorIndex,
                                                  unitIndex,
                                                  e
                                                )
                                              }
                                              value={
                                                floors[floorIndex].unitList[
                                                  unitIndex
                                                ].paymentSchedule
                                                  .onPossessionPayment
                                              }
                                            />
                                          </div>
                                        </div>
                                      </>
                                    </div>

                                    <div>
                                      <div className="px-4 mt-3 mb-3 rounded-12 md:px-0">
                                        <div className="flex justify-between">
                                          <div className="uppercase text-blueGray-600 font-bold text-sm text-center">
                                            Month Wise Payment
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              onClickAddMonthlyRow(
                                                floorIndex,
                                                unitIndex
                                              )
                                            }
                                            className="bg-red-500 text-white  font-bold uppercase text-xs px-3 py-1 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                                          >
                                            <IoMdAddCircle
                                              className="inline-block w-3 h-3"
                                              style={{ paddingRight: "0px" }}
                                            />{" "}
                                            Row
                                          </button>
                                        </div>

                                        {unit?.paymentSchedule?.monthWisePaymentList?.map(
                                          (monthly, mIndex) => (
                                            <div className="mt-6 flex flex-wrap">
                                              <div className="mt-6 text-left pt-4">
                                                {mIndex + 1} -
                                              </div>
                                              <div className="w-full lg:w-3/12 ">
                                                <div className="relative w-full mb-3">
                                                  <label
                                                    className="block text-xs font-medium text-gray-700 mb-1"
                                                    htmlFor="name"
                                                  >
                                                    From Month
                                                  </label>
                                                  <input
                                                    id="name"
                                                    type="text"
                                                    name="fromMonth"
                                                    className="w-full p-2 border rounded-lg text-sm"
                                                    onChange={(e) =>
                                                      changeMonthlyPaymentFields(
                                                        floorIndex,
                                                        unitIndex,
                                                        mIndex,
                                                        e
                                                      )
                                                    }
                                                    value={
                                                      floors[floorIndex]
                                                        .unitList[unitIndex]
                                                        .paymentSchedule
                                                        .monthWisePaymentList[
                                                        mIndex
                                                      ].fromMonth
                                                    }
                                                  />
                                                </div>
                                              </div>
                                              <div className="w-full lg:w-3/12 px-2 md:px-0">
                                                <div className="relative w-full mb-3">
                                                  <label
                                                    className="block text-xs font-medium text-gray-700 mb-1"
                                                    htmlFor="name"
                                                  >
                                                    To Month
                                                  </label>
                                                  <input
                                                    id="name"
                                                    type="text"
                                                    name="toMonth"
                                                    className="w-full p-2 border rounded-lg text-sm"
                                                    onChange={(e) =>
                                                      changeMonthlyPaymentFields(
                                                        floorIndex,
                                                        unitIndex,
                                                        mIndex,
                                                        e
                                                      )
                                                    }
                                                    value={
                                                      floors[floorIndex]
                                                        .unitList[unitIndex]
                                                        .paymentSchedule
                                                        .monthWisePaymentList[
                                                        mIndex
                                                      ].toMonth
                                                    }
                                                  />
                                                </div>
                                              </div>
                                              <div className="w-full lg:w-4/12">
                                                <div className="relative w-full mb-3">
                                                  <label
                                                    className="block text-xs font-medium text-gray-700 mb-1"
                                                    htmlFor="name"
                                                  >
                                                    Amount
                                                  </label>
                                                  <input
                                                    id="name"
                                                    type="number"
                                                    name="amount"
                                                    className="w-full p-2 border rounded-lg text-sm"
                                                    onChange={(e) =>
                                                      changeMonthlyPaymentFields(
                                                        floorIndex,
                                                        unitIndex,
                                                        mIndex,
                                                        e
                                                      )
                                                    }
                                                    value={
                                                      floors[floorIndex]
                                                        .unitList[unitIndex]
                                                        .paymentSchedule
                                                        .monthWisePaymentList[
                                                        mIndex
                                                      ].amount
                                                    }
                                                  />
                                                </div>
                                              </div>
                                              <div className="pl-7 mt-6 text-right pt-1 md:ml-auto md:mt-2 lg:ml-auto lg:pt-0">
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    removeMonthWisePayment(
                                                      floorIndex,
                                                      unitIndex,
                                                      mIndex
                                                    )
                                                  }
                                                  className=" text-red-500 outline-none focus:outline-none ease-linear transition-all duration-150"
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
                              ) : floors[floorIndex]?.unitList[unitIndex]
                                  ?.paymentPlanType ==
                                "INSTALLMENT_SPECIFIC" ? (
                                <div className="w-full lg:w-6/12 ">
                                  <div className="relative w-full">
                                    <div className="ml-3 mt-3  text-blueGray-600 text-md uppercase font-bold">
                                      Customer Payment Schedule
                                      {(() => {
                                        const unitCost =
                                          floors?.[floorIndex]?.unitList?.[
                                            unitIndex
                                          ]?.paymentSchedule?.unitCost;

                                        const customerCost =
                                          floors?.[floorIndex]?.unitList?.[
                                            unitIndex
                                          ]?.paymentSchedule?.customerCost +
                                          floors?.[floorIndex]?.unitList?.[
                                            unitIndex
                                          ]?.paymentSchedule
                                            ?.monthSpecificTotal;

                                        const classColor =
                                          unitCost == customerCost
                                            ? "text-green-600"
                                            : unitCost > customerCost
                                            ? "text-blue-600"
                                            : "text-red-600";
                                        return (
                                          <text
                                            className={`ml-3 ${classColor}`}
                                          >
                                            (
                                            {parseFloat(
                                              customerCost
                                            ).toLocaleString()}
                                            )
                                          </text>
                                        );
                                      })()}
                                    </div>
                                    <div className="mt-6 flex flex-wrap">
                                      <>
                                        <div className="w-full px-4 lg:w-12/12 md:px-0">
                                          <div className="relative w-full mb-3">
                                            <label
                                              className="block text-xs font-medium text-gray-700 mb-1"
                                              htmlFor="downPayment"
                                            >
                                              Down Payment
                                            </label>
                                            <input
                                              id="downPayment"
                                              type="number"
                                              name="downPayment"
                                              className="w-full p-2 border rounded-lg text-sm"
                                              onChange={(e) =>
                                                changePaymentScheduleFields(
                                                  floorIndex,
                                                  unitIndex,
                                                  e
                                                )
                                              }
                                              value={
                                                floors[floorIndex].unitList[
                                                  unitIndex
                                                ].paymentSchedule.downPayment
                                              }
                                            />
                                          </div>
                                        </div>
                                      </>
                                    </div>

                                    <div>
                                      <div className="px-4 mt-3 mb-3 rounded-12 md:px-0">
                                        <div className="flex justify-between">
                                          <div className="uppercase text-blueGray-600 font-bold text-sm text-center">
                                            Month Specific Payment
                                          </div>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              onClickAddMonthlySpecificRow(
                                                floorIndex,
                                                unitIndex
                                              )
                                            }
                                            className="bg-red-500 text-white  font-bold uppercase text-xs px-3 py-1 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                                          >
                                            <IoMdAddCircle
                                              className="inline-block w-3 h-3"
                                              style={{ paddingRight: "0px" }}
                                            />{" "}
                                            Row
                                          </button>
                                        </div>

                                        {unit?.paymentSchedule?.monthSpecificPaymentList?.map(
                                          (monthly, mIndex) => (
                                            <div className="mt-6 flex flex-wrap">
                                              <div className="mt-6 text-left pt-4">
                                                {mIndex + 1} -
                                              </div>
                                              <div className="w-full lg:w-3/12 ">
                                                <div className="relative w-full mb-3">
                                                  <label
                                                    className="block text-xs font-medium text-gray-700 mb-1"
                                                    htmlFor="name"
                                                  >
                                                    Month
                                                  </label>
                                                  <select
                                                    id="name"
                                                    type="text"
                                                    name="month"
                                                    className="w-full p-2 border rounded-lg text-sm"
                                                    onChange={(e) =>
                                                      changeMonthlySpecificPaymentFields(
                                                        floorIndex,
                                                        unitIndex,
                                                        mIndex,
                                                        e
                                                      )
                                                    }
                                                    value={
                                                      floors[floorIndex]
                                                        .unitList[unitIndex]
                                                        .paymentSchedule
                                                        .monthSpecificPaymentList[
                                                        mIndex
                                                      ].month
                                                    }
                                                  >
                                                    <option>
                                                      Select Month
                                                    </option>
                                                    {MONTH_LABELS.map(
                                                      (month) => (
                                                        <option
                                                          key={month}
                                                          value={month}
                                                        >
                                                          {month}
                                                        </option>
                                                      )
                                                    )}
                                                  </select>
                                                </div>
                                              </div>
                                              <div className="w-full lg:w-3/12 px-2 md:px-0">
                                                <div className="relative w-full mb-3">
                                                  <label
                                                    className="block text-xs font-medium text-gray-700 mb-1"
                                                    htmlFor="name"
                                                  >
                                                    Year
                                                  </label>
                                                  <select
                                                    id="name"
                                                    type="text"
                                                    name="year"
                                                    className="w-full p-2 border rounded-lg text-sm"
                                                    onChange={(e) =>
                                                      changeMonthlySpecificPaymentFields(
                                                        floorIndex,
                                                        unitIndex,
                                                        mIndex,
                                                        e
                                                      )
                                                    }
                                                    value={
                                                      floors[floorIndex]
                                                        .unitList[unitIndex]
                                                        .paymentSchedule
                                                        .monthSpecificPaymentList[
                                                        mIndex
                                                      ].year
                                                    }
                                                  >
                                                    <option>Select Year</option>
                                                    {generateYears(10, 10).map(
                                                      (year) => (
                                                        <option
                                                          key={year}
                                                          value={year}
                                                        >
                                                          {year}
                                                        </option>
                                                      )
                                                    )}
                                                  </select>
                                                </div>
                                              </div>
                                              <div className="w-full lg:w-4/12">
                                                <div className="relative w-full mb-3">
                                                  <label
                                                    className="block text-xs font-medium text-gray-700 mb-1"
                                                    htmlFor="name"
                                                  >
                                                    Amount
                                                  </label>
                                                  <input
                                                    id="name"
                                                    type="number"
                                                    name="amount"
                                                    className="w-full p-2 border rounded-lg text-sm"
                                                    onChange={(e) =>
                                                      changeMonthlySpecificPaymentFields(
                                                        floorIndex,
                                                        unitIndex,
                                                        mIndex,
                                                        e
                                                      )
                                                    }
                                                    value={
                                                      floors[floorIndex]
                                                        .unitList[unitIndex]
                                                        .paymentSchedule
                                                        .monthSpecificPaymentList[
                                                        mIndex
                                                      ].amount
                                                    }
                                                  />
                                                </div>
                                              </div>
                                              <div className="pl-7 mt-6 text-right pt-1 md:ml-auto md:mt-2 lg:ml-auto lg:pt-0">
                                                <button
                                                  type="button"
                                                  onClick={() =>
                                                    removeMonthSpecificPayment(
                                                      floorIndex,
                                                      unitIndex,
                                                      mIndex
                                                    )
                                                  }
                                                  className=" text-red-500 outline-none focus:outline-none ease-linear transition-all duration-150"
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
                              ) : (
                                <></>
                              )}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => history.goBack()}
              className="bg-gray-100 text-gray-700 font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-md hover:bg-gray-200 transition-all mr-3 inline-flex items-center"
            >
              <IoArrowBackOutline className="mr-1" style={{ color: "#64748b" }} />
              Cancel
            </button>
            <button
              type="submit"
              className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 inline-flex items-center"
            >
              <FaBuilding className="mr-1" style={{ color: "white" }} />
              Add Project
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
