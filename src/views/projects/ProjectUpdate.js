import React, { useContext, useEffect, useState } from "react";
import { projectTypes, unitTypes } from "utility/Utility";
import { FaLayerGroup } from "react-icons/fa";
import { HiMiniBuildingStorefront } from "react-icons/hi2";
import { IoMdAddCircle } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import { BsBuildingFillAdd } from "react-icons/bs";
import { MainContext } from "context/MainContext";
import httpService from "utility/httpService";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min.js";
import { PAYMENT_PLANS_TYPE } from "utility/Utility";

export default function ProjectUpdate() {
  const { setLoading, notifyError, notifySuccess } = useContext(MainContext);
  const [floors, setFloors] = useState([
    {
      floor: 0,
      unitList: [
        {
          serialNo: "",
          amount: 0,
          squareFoot: 0,
          unitType: "APARTMENT",
          paymentSchedule: {
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
          },
        },
      ],
    },
  ]);
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

  const { projectId } = useParams();

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
        unitList: [
          {
            serialNo: "",
            amount: 0,
            squareFoot: 0,
            unitType: "APARTMENT",
            roomCount: 0,
            bathroomCount: 0,
            paymentPlanType: "ONE-TIME-PAYMENT",
            paymentSchedule: {
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
            },
          },
        ],
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
      roomCount: 0,
      bathroomCount: 0,
      unitType: "APARTMENT",
      paymentPlanType: "ONE-TIME-PAYMENT",
      paymentSchedule: {
        durationInMonths: 0,
        actualAmount: 0,
        miscellaneousAmount: 0,
        totalAmount: 0,
        downPayment: 0,
        quarterlyPayment: 0,
        halfYearlyPayment: 0,
        yearlyPayment: 0,
        onPossessionPayment: 0,
        unitCost: 0,
        customerCost: 0,
        monthWiseTotal: 0,
        monthWisePaymentList: [{ fromMonth: 0, toMonth: 0, amount: 0 }],
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
    const miscellaneousAmount = parseFloat(schedule?.miscellaneousAmount) || 0;
    const developmentAmount = parseFloat(schedule?.developmentAmount) || 0;
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
      onPossessionPayment +
      schedule.monthWiseTotal;

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

    console.log("schedule :: ", schedule);
    let monthWiseTotal = 0;
    monthWiseTotal = calculateMonthlyPaymentSum(schedule);

    console.log("monthWiseTotal :: ", monthWiseTotal);

    updatedFloors[floorIndex].unitList[
      unitIndex
    ].paymentSchedule.monthWiseTotal = monthWiseTotal;

    setFloors(updatedFloors);
  };

  // const calculateMonthlyPaymentSum = (schedule) => {
  //   if (!schedule || !Array.isArray(schedule.monthWisePaymentList)) return 0;

  //   let sum = 0;

  //   for (let i = 0; i < schedule.durationInMonths; i++) {
  //     const serialNo = i + 1;

  //     const payment = schedule.monthWisePaymentList.find(
  //       (p) => serialNo >= p.fromMonth && serialNo <= p.toMonth
  //     );

  //     if (!payment) {
  //       console.error("Invalid Month wise payment!");
  //       continue; // or return 0 if you want to stop
  //     }

  //     const amount = parseFloat(payment.amount) || 0;
  //     sum += amount;
  //   }

  //   return sum;
  // };

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

  const updateProject = async (e) => {
    e.preventDefault();
    const requestBody = { ...project };
    requestBody.floorList = floors;
    requestBody.floors = floors.length;
    const organization = JSON.parse(localStorage.getItem("organization")) || {};
    requestBody.organizationId = organization.organizationId;

    setLoading(true);
    try {
      const response = await httpService.post(`/project/update`, requestBody);

      console.log("response payment:: ", response);

      if (response.data) {
        notifySuccess(response.responseMessage, 4000);
      }
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const fetchProjectDetails = async () => {
    setLoading(true);
    try {
      const response = await httpService.get(
        `/project/getProject/${projectId}`
      );

      setProject(response?.data);

      const updatedFloors = response?.data?.floorList?.map((floor) => {
        console.log("floor:: ", floor);

        // Loop through each unit of the floor
        const updatedUnits = floor?.unitList?.map((unit) => {
          const schedule = unit?.paymentSchedule;
          if (!schedule) return unit;

          // Parse all numeric values safely
          const actualAmount = parseFloat(schedule?.actualAmount) || 0;
          const developmentAmount = parseFloat(schedule?.developmentAmount) || 0;
          const miscellaneousAmount =
            parseFloat(schedule?.miscellaneousAmount) || 0;
          const downPayment = parseFloat(schedule?.downPayment) || 0;
          const quarterlyPayment = parseFloat(schedule?.quarterlyPayment) || 0;
          const halfYearlyPayment =
            parseFloat(schedule?.halfYearlyPayment) || 0;
          const yearlyPayment = parseFloat(schedule?.yearlyPayment) || 0;
          const onPossessionPayment =
            parseFloat(schedule?.onPossessionPayment) || 0;

          const durationInMonths = parseInt(schedule?.durationInMonths) || 0;

          // Calculate periods
          const quarterlyPeriods = Math.floor(durationInMonths / 3);
          const halfYearlyPeriods = Math.floor(durationInMonths / 6);
          const yearlyPeriods = Math.floor(durationInMonths / 12);

          // ✅ Calculate month-wise total
          let monthWiseTotal = 0;

          monthWiseTotal = calculateMonthlyPaymentSum(schedule);

          // ✅ Totals
          const unitCost = actualAmount + miscellaneousAmount + developmentAmount;
          const customerCost =
            downPayment +
            (quarterlyPeriods > 0 ? quarterlyPayment * quarterlyPeriods : 0) +
            (halfYearlyPeriods > 0
              ? halfYearlyPayment * halfYearlyPeriods
              : 0) +
            (yearlyPeriods > 0 ? yearlyPayment * yearlyPeriods : 0) +
            onPossessionPayment;

          // ✅ Update schedule
          return {
            ...unit,
            paymentSchedule: {
              ...schedule,
              unitCost,
              customerCost,
              monthWiseTotal,
            },
          };
        });

        return { ...floor, unitList: updatedUnits };
      });

      setFloors(updatedFloors);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-lg bg-blueGray-50 border-0">
      <div className="rounded-t bg-white mb-0 px-6 py-6">
        <div className="flex justify-between">
          <h6 className="text-blueGray-700 text-xl font-bold uppercase">
            Update Project
          </h6>
        </div>
      </div>
      <div className="flex-auto px-4 lg:px-10 py-10 pt-0 bg-white">
        <form>
          <div className="flex flex-wrap">
            <div className="w-full lg:w-6/12 px-4  border-right-grey mt-2">
              <h6 className="text-blueGray-600 text-sm mt-3 mb-6 font-bold uppercase">
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
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
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
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
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
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
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
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
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
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                      value={project.information}
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>
            <div className="w-full lg:w-6/12 px-4 grey mt-2">
              <h6 className="text-blueGray-600 text-sm mt-3 mb-6 font-bold uppercase">
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
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
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
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
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
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
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
                      className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
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

          <h6 className="text-blueGray-600 text-sm mt-3 mb-6 font-bold uppercase flex justify-between">
            Floor List
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
                      className="mb-3 border-bottom-grey px-3 cursor-pointer  hover:shadow-md"
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
                                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
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
                                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
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
                                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
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
                                      .squareFoot
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
                          <div className="px-4">
                            <div className=" flex flex-wrap">
                              <div className="w-full px-4 lg:w-6/12 border-right-grey">
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

                                <div className="px-4 flex flex-wrap">
                                  {/* === First Section: Payment Overview === */}
                                  <div className="w-full flex flex-wrap  border-blueGray-200 pb-4 mb-4">
                                    {/* Duration In Months */}
                                    <div className="w-full px-4 lg:w-6/12">
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
                                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
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
                                    <div className="w-full px-4 lg:w-6/12">
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
                                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
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
                                    <div className="w-full px-4 lg:w-6/12">
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
                                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
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

                                    {/* Total Amount */}
                                    <div className="w-full px-4 lg:w-6/12">
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
                                          className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-400 bg-gray-100 rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
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
                                            )
                                          }
                                        />
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

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
                                        <text className={`ml-3 ${classColor}`}>
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
                                            type="text"
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
                                              ].paymentSchedule.quarterlyPayment
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
                                    <div className="px-4 mt-3 mb-3  rounded">
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
                                                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                                  onChange={(e) =>
                                                    changeMonthlyPaymentFields(
                                                      floorIndex,
                                                      unitIndex,
                                                      mIndex,
                                                      e
                                                    )
                                                  }
                                                  value={
                                                    floors[floorIndex].unitList[
                                                      unitIndex
                                                    ].paymentSchedule
                                                      .monthWisePaymentList[
                                                      mIndex
                                                    ].fromMonth
                                                  }
                                                />
                                              </div>
                                            </div>
                                            <div className="w-full lg:w-3/12 px-2">
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
                                                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                                  onChange={(e) =>
                                                    changeMonthlyPaymentFields(
                                                      floorIndex,
                                                      unitIndex,
                                                      mIndex,
                                                      e
                                                    )
                                                  }
                                                  value={
                                                    floors[floorIndex].unitList[
                                                      unitIndex
                                                    ].paymentSchedule
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
                                                  type="text"
                                                  name="amount"
                                                  className="border-0 px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded text-sm shadow focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                                  onChange={(e) =>
                                                    changeMonthlyPaymentFields(
                                                      floorIndex,
                                                      unitIndex,
                                                      mIndex,
                                                      e
                                                    )
                                                  }
                                                  value={
                                                    floors[floorIndex].unitList[
                                                      unitIndex
                                                    ].paymentSchedule
                                                      .monthWisePaymentList[
                                                      mIndex
                                                    ].amount
                                                  }
                                                />
                                              </div>
                                            </div>
                                            <div className=" pl-7 mt-6 text-right pt-1">
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  removeMonthWisePayment(
                                                    floorIndex,
                                                    unitIndex,
                                                    mIndex
                                                  )
                                                }
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
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <button
            onClick={(e) => updateProject(e)}
            type="submit"
            className="mt-4 bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150"
          >
            <BsBuildingFillAdd
              className="w-5 h-5 inline-block "
              style={{ paddingBottom: "3px", paddingRight: "5px" }}
            />
            Update Project
          </button>
        </form>
      </div>
    </div>
  );
}
