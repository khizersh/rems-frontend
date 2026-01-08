import React, { useContext, useEffect, useState } from "react";
import { projectTypes, unitTypes } from "utility/Utility";
import { FaLayerGroup } from "react-icons/fa";
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
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 bg-blueGray-50 mt-12">
      {/* Page header */}
      <div className="mb-0 px-6 py-6">
        <div className="flex justify-between items-center">
          <h6 className="text-blueGray-700 text-xl font-bold uppercase flex items-center gap-2">
            <button className="">
              <IoArrowBackOutline
                onClick={() => history.goBack()}
                className="back-button-icon inline-block back-button"
                style={{
                  paddingBottom: "3px",
                  paddingRight: "7px",
                  marginBottom: "3px",
                }}
              />
            </button>
            Create Project
          </h6>
        </div>
      </div>

      {/* Project summary strip */}
      <div className="bg-white rounded-12 shadow-md px-4 md:px-6 -mt-2">
        <div className="  px-4 py-3 flex flex-wrap gap-4 md:gap-8">
          <div className="flex items-center gap-3 mr-4">
            <PiBuildingsLight className="text-lightBlue-500 w-5 h-5 mb-5" />
            <div className="ml-2">
              <div className="text-sm text-blueGray-400 uppercase">Project</div>
              <div className="text-sm font-semibold text-blueGray-700">
                {project.name || "--"}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mr-4">
            <FaLayerGroup className="text-emerald-500 w-4 h-4 mb-5" />
            <div className="ml-2">
              <div className="text-xs text-blueGray-400 uppercase">Floors</div>
              <div className="text-sm font-semibold text-blueGray-700">
                {totalFloors}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 mr-3">
            <RiHome4Line className="text-indigo-500 w-4 h-4 mb-5" />
            <div className="ml-2">
              <div className="text-xs text-blueGray-400 uppercase">Units</div>
              <div className="text-sm font-semibold text-blueGray-700">
                {totalUnits}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 mb-5 rounded-full bg-lightBlue-50 text-lightBlue-600 text-xs font-bold">
              Rs
            </span>
            <div>
              <div className="text-xs text-blueGray-400 uppercase">
                Total Amount
              </div>
              <div className="text-sm font-semibold text-blueGray-700">
                {totalProjectAmount.toLocaleString()}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main form card */}
      <div className="rounded-12 flex-auto px-4 bg-white py-6 mt-6 shadow-md">
        <form>
          <div className="flex flex-wrap">
            <div className="w-full lg:w-6/12 px-4  border-right-grey mt-2">
              <h6 className="text-blueGray-600 text-sm mt-3 mb-6 font-bold uppercase flex items-center gap-2">
                <BiCommentDetail className="text-lightBlue-500 w-4 h-4 mr-1" />
                Basic Details
              </h6>
              <div className="flex flex-wrap">
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                      htmlFor="name"
                    >
                      Project Name
                    </label>
                    <input
                      type="text"
                      name="name"
                      onChange={(e) => changeProjectFields(e)}
                      className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      value={project.name}
                    />
                  </div>
                </div>

                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                      htmlFor="address"
                    >
                      Address
                    </label>
                    <input
                      id="address"
                      type="text"
                      name="address"
                      onChange={(e) => changeProjectFields(e)}
                      className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      value={project.address}
                    />
                  </div>
                </div>

                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                      htmlFor="projectType"
                    >
                      Project Type
                    </label>
                    <select
                      id="projectType"
                      name="projectType"
                      className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
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
                </div>

                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                      htmlFor="monthDuration"
                    >
                      Month Duration
                    </label>
                    <input
                      id="monthDuration"
                      type="number"
                      name="monthDuration"
                      onChange={(e) => changeProjectFields(e)}
                      className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      value={project.monthDuration}
                    />
                  </div>
                </div>
                <div className="w-full lg:w-12/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                      htmlFor="information"
                    >
                      Project Information
                    </label>
                    <textarea
                      id="information"
                      name="information"
                      rows="3"
                      onChange={(e) => changeProjectFields(e)}
                      className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      value={project.information}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-6/12 px-4 grey mt-2">
              <h6 className="text-blueGray-600 text-sm mt-3 mb-6 font-bold uppercase flex items-center gap-2">
                <GrMoney className="text-emerald-500 w-4 h-4 mr-1" />
                Financial Details
              </h6>
              <div className="flex flex-wrap">
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                      htmlFor="purchasingAmount"
                    >
                      Purchasing Amount
                    </label>
                    <input
                      id="purchasingAmount"
                      type="number"
                      name="purchasingAmount"
                      onChange={(e) => changeProjectFields(e)}
                      className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      value={project.purchasingAmount}
                    />
                  </div>
                </div>
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                      htmlFor="registrationAmount"
                    >
                      Registration Amount
                    </label>
                    <input
                      id="registrationAmount"
                      type="number"
                      name="registrationAmount"
                      onChange={(e) => changeProjectFields(e)}
                      className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      value={project.registrationAmount}
                    />
                  </div>
                </div>
                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                      htmlFor="additionalAmount"
                    >
                      Additional Amount
                    </label>
                    <input
                      id="additionalAmount"
                      type="number"
                      name="additionalAmount"
                      onChange={(e) => changeProjectFields(e)}
                      className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      value={project.additionalAmount}
                    />
                  </div>
                </div>

                <div className="w-full lg:w-6/12 px-4">
                  <div className="relative w-full mb-3">
                    <label
                      className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                      htmlFor="totalAmount"
                    >
                      Total Amount
                    </label>
                    <input
                      id="totalAmount"
                      type="number"
                      name="totalAmount"
                      className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
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

          <hr className="mt-6 border-b-1 border-blueGray-300" />

          <h6 className="text-blueGray-600 text-sm mt-3 mb-6 font-bold uppercase flex justify-between px-4">
            <div>
            <FaLayerGroup
                className="text-emerald-500 w-5 h-5 inline-block"
                style={{ paddingBottom: "3px", paddingRight: "7px" }}
              />
              Floor List</div>
            <button
              type="button"
              onClick={addFloor}
              className="bg-lightBlue-500 text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
            >
              <FaLayerGroup
                className="w-5 h-5 inline-block"
                style={{ paddingBottom: "3px", paddingRight: "7px" }}
              />
              Add Floor
            </button>
          </h6>

          {floors.map((floor, floorIndex) => (
            <div key={floorIndex} className="">
              <h6
                className="text-blueGray-600 text-sm mt-3 mb-6 font-bold uppercase flex justify-between border-bottom-grey p-3 cursor-pointer  hover:shadow-md"
                // onClick={() => changeCollapseFloor(floorIndex)}
              >
                <div>Floor# {floorIndex}</div>
                <div className="flex justify-between">
                  <div>
                    <button
                      type="button"
                      onClick={() => addUnit(floorIndex)}
                      className="bg-lightBlue-500 items-center text-white active:bg-lightBlue-600 font-bold uppercase text-xs px-4 py-2 rounded shadow hover:shadow-md outline-none focus:outline-none mr-1 ease-linear transition-all duration-150"
                    >
                      <HiMiniBuildingStorefront
                        className="w-5 h-5 inline-block "
                        style={{ paddingBottom: "3px", paddingRight: "5px" }}
                      />
                      Add Unit
                    </button>
                  </div>
                  <div className="ml-6 ">
                    <button
                      type="button"
                      onClick={() => removeFloor(floorIndex)}
                      className=" text-red-500   outline-none focus:outline-none ease-linear transition-all duration-150"
                    >
                      <MdDeleteForever
                        style={{ fontSize: "25px", marginTop: "7px" }}
                      />
                    </button>
                  </div>
                  <div
                    className="ml-6 "
                    onClick={() => changeCollapseFloor(floorIndex)}
                  >
                    {indexes.some((floor) => floor.floor === floorIndex) ? (
                      <i class="cursor-pointer fas fa-chevron-up text-blue pt-2 text-xl"></i>
                    ) : (
                      <i class="cursor-pointer fas fa-chevron-down text-blue pt-2 text-xl"></i>
                    )}
                  </div>
                </div>
              </h6>
              {indexes.some((fIndex) => fIndex.floor == floorIndex) && (
                <div className="space-y-3 ">
                  {floor.unitList.map((unit, unitIndex) => (
                    <div
                      key={unitIndex}
                      className="mb-3 border-bottom-grey px-3 cursor-pointer pb-4 hover:shadow-md"
                    >
                      <div
                        className="flex justify-between p-3"
                        // onClick={() => toggleUnitIndex(floorIndex, unitIndex)}
                      >
                        <div className="text-blueGray-600 font-bold uppercase ">
                          Unit# {unitIndex + 1}
                        </div>
                        <div className="flex justify-between pt-1">
                          <button
                            type="button"
                            onClick={() => removeUnit(floorIndex, unitIndex)}
                            className=" text-red-500   outline-none focus:outline-none ease-linear transition-all duration-150"
                          >
                            <MdDeleteForever style={{ fontSize: "25px" }} />
                          </button>
                          <div
                            className="ml-6 z-50"
                            onClick={() =>
                              toggleUnitIndex(floorIndex, unitIndex)
                            }
                          >
                            {indexes
                              .find((floor) => floor.floor === floorIndex)
                              .unitIndexes.some((ui) => ui == unitIndex) ? (
                              <i class="cursor-pointer fas fa-chevron-up text-blue text-xl"></i>
                            ) : (
                              <i class="cursor-pointer fas fa-chevron-down text-blue text-xl"></i>
                            )}
                          </div>
                        </div>
                      </div>
                      {indexes
                        .find((fIndex) => fIndex.floor == floorIndex)
                        .unitIndexes.some((uIndex) => uIndex == unitIndex) && (
                        <>
                          <div className="flex flex-wrap mt-4">
                            <div className="w-full lg:w-4/12 px-4">
                              <div className="relative w-full mb-3">
                                <label
                                  className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                                  htmlFor="name"
                                >
                                  Serial No
                                </label>
                                <input
                                  id="name"
                                  type="text"
                                  name="serialNo"
                                  className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                  onChange={(e) =>
                                    changeUnitFields(floorIndex, unitIndex, e)
                                  }
                                  value={
                                    floors[floorIndex].unitList[unitIndex]
                                      .serialNo
                                  }
                                />
                              </div>
                            </div>
                            <div className="w-full lg:w-4/12 px-4">
                              <div className="relative w-full mb-3">
                                <label
                                  className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                                  htmlFor="name"
                                >
                                  Square Foot
                                </label>
                                <input
                                  id="name"
                                  type="number"
                                  name="squareFoot"
                                  className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                  onChange={(e) =>
                                    changeUnitFields(floorIndex, unitIndex, e)
                                  }
                                  value={
                                    floors[floorIndex].unitList[unitIndex]
                                      .squareFoot
                                  }
                                />
                              </div>
                            </div>
                            <div className="w-full lg:w-4/12 px-4">
                              <div className="relative w-full mb-3">
                                <label
                                  className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                                  htmlFor="projectType"
                                >
                                  Unit Type
                                </label>
                                <select
                                  id="projectType"
                                  name="unitType"
                                  className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
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
                            </div>
                            <div className="w-full lg:w-4/12 px-4">
                              <div className="relative w-full mb-3">
                                <label
                                  className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                                  htmlFor="name"
                                >
                                  Room Count
                                </label>
                                <input
                                  id="name"
                                  type="text"
                                  name="roomCount"
                                  className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                  onChange={(e) =>
                                    changeUnitFields(floorIndex, unitIndex, e)
                                  }
                                  value={
                                    floors[floorIndex].unitList[unitIndex]
                                      .roomCount
                                  }
                                />
                              </div>
                            </div>
                            <div className="w-full lg:w-4/12 px-4">
                              <div className="relative w-full mb-3">
                                <label
                                  className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                                  htmlFor="name"
                                >
                                  Bathroom Count
                                </label>
                                <input
                                  id="name"
                                  type="text"
                                  name="bathroomCount"
                                  className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                  onChange={(e) =>
                                    changeUnitFields(floorIndex, unitIndex, e)
                                  }
                                  value={
                                    floors[floorIndex].unitList[unitIndex]
                                      .bathroomCount
                                  }
                                />
                              </div>
                            </div>
                            <div className="w-full lg:w-4/12 px-4">
                              <div className="relative w-full mb-3">
                                <label
                                  className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                                  htmlFor="projectType"
                                >
                                  Payment Plan Type
                                </label>
                                <select
                                  id="projectType"
                                  name="paymentPlanType"
                                  className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
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
                                          className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                                          htmlFor="actualAmount"
                                        >
                                          Actual Amount
                                        </label>
                                        <input
                                          id="actualAmount"
                                          type="number"
                                          name="actualAmount"
                                          className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
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
                                          className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                                          htmlFor="miscellaneousAmount"
                                        >
                                          Miscellaneous Amount
                                        </label>
                                        <input
                                          id="miscellaneousAmount"
                                          type="number"
                                          name="miscellaneousAmount"
                                          className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
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
                                          className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                                          htmlFor="miscellaneousAmount"
                                        >
                                          Development Amount
                                        </label>
                                        <input
                                          id="developmentAmount"
                                          type="number"
                                          name="developmentAmount"
                                          className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
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
                                              className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                                              htmlFor="downPayment"
                                            >
                                              Down Payment
                                            </label>
                                            <input
                                              id="downPayment"
                                              type="number"
                                              name="downPayment"
                                              className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
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
                                                    className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                                                    htmlFor="name"
                                                  >
                                                    Amount
                                                  </label>
                                                  <input
                                                    id="name"
                                                    type="number"
                                                    name="amount"
                                                    className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
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
                                              className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                                              htmlFor="downPayment"
                                            >
                                              Down Payment
                                            </label>
                                            <input
                                              id="downPayment"
                                              type="number"
                                              name="downPayment"
                                              className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
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
                                                    className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                                                    htmlFor="name"
                                                  >
                                                    Month
                                                  </label>
                                                  <select
                                                    id="name"
                                                    type="text"
                                                    name="month"
                                                    className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
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
                                                    className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                                                    htmlFor="name"
                                                  >
                                                    Year
                                                  </label>
                                                  <select
                                                    id="name"
                                                    type="text"
                                                    name="year"
                                                    className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
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
                                                    className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                                                    htmlFor="name"
                                                  >
                                                    Amount
                                                  </label>
                                                  <input
                                                    id="name"
                                                    type="number"
                                                    name="amount"
                                                    className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
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

          <button
            onClick={(e) => createProject(e)}
            type="submit"
            className="mt-4 bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 float-right"
          >
            <BsBuildingFillAdd
              className="w-5 h-5 inline-block "
              style={{ paddingBottom: "3px", paddingRight: "5px" }}
            />
            Add Project
          </button>
        </form>
      </div>
    </div>
  );
}
