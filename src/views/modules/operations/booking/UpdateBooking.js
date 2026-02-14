import React, { useContext, useEffect, useState } from "react";
import { IoMdAddCircle } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import { BsBuildingFillAdd } from "react-icons/bs";
import { MainContext } from "context/MainContext";
import httpService from "../../../../utility/httpService.js";
import DebounceSearch from "../../../../components/CustomerComponents/DebounceSearchDropDown.js";
import { getOrdinal } from "utility/Utility.js";
import { generateBookingHtml } from "utility/Utility.js";
import { PAYMENT_PLANS_TYPE } from "utility/Utility.js";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min.js";
import { IoArrowBackOutline } from "react-icons/io5";
import { MONTH_LABELS } from "utility/Utility.js";
import { generateYears } from "utility/Utility.js";

export default function UpdateBooking() {
  const { loading, setLoading, notifyError, notifySuccess } =
    useContext(MainContext);
  const [customerList, setCustomerList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [paymentSchedule, setPaymentSchedule] = useState({
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
    paymentPlanType: "",
    unitCost: 0,
    customerCost: 0,
    monthWiseTotal: 0,
    monthWisePaymentList: [],
    monthSpecificPaymentList: [],
  });

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [project, setProject] = useState("-");
  const [floor, setFloor] = useState("-");
  const [unit, setUnit] = useState("-");
  const [totalAmount, setTotalAmount] = useState("-");
  const [unitList, setUnitList] = useState([]);
  const [filterProject, setFilterProject] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [filterFloor, setFilterFloor] = useState("");
  const [floorOptions, setFloorOptions] = useState([]);
  const [booking, setBooking] = useState({
    customerId: null,
    id: null,
    unitId: null,
    floorId: null,
    projectId: null,
    organizationId: 0,
    paymentSchedule: {},
    createdDate: new Date().toISOString().slice(0, 16),
    updatedDate: null,
  });
  const { bookingId } = useParams();

  useEffect(() => {
    fetchCustomers(search);
    fetchProjects();
    bookingDetails();
  }, []);

  const resetState = () => {
    setPaymentSchedule({
      durationInMonths: 0,
      actualAmount: 0,
      miscellaneousAmount: 0,
      totalAmount: 0,
      downPayment: 0,
      paymentPlanType: "",
      quarterlyPayment: 0,
      halfYearlyPayment: 0,
      yearlyPayment: 0,
      onPossessionPayment: 0,
      monthWisePaymentList: [],
      monthSpecificPaymentList: [],
    });
  };

  const fetchCustomers = async (search) => {
    setLoading(true);
    try {
      let request = {
        name: search || "",
      };
      const response = await httpService.post(`/customer/search`, request);

      let customerList = response?.data;
      if (customerList?.length == 0) {
        customerList.push({ customerId: null, name: "Not Found" });
      }
      setCustomerList(response.data || []);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const changePaymentScheduleFields = (e) => {
    const schedule = { ...paymentSchedule };
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

    setPaymentSchedule(schedule);
  };

  const changeMonthlyPaymentFields = (monthlyIndex, e) => {
    const updatedPaymentSchedule = { ...paymentSchedule };
    updatedPaymentSchedule.monthWisePaymentList[monthlyIndex][e.target.name] =
      e.target.value;

    let monthWiseTotal = calculateMonthlyPaymentSum(updatedPaymentSchedule);

    updatedPaymentSchedule.monthWiseTotal = monthWiseTotal;

    setPaymentSchedule(updatedPaymentSchedule);
  };

  const changeMonthlySpecificPaymentFields = (monthlyIndex, e) => {
    const updatedPaymentSchedule = { ...paymentSchedule };
    updatedPaymentSchedule.monthSpecificPaymentList[monthlyIndex][
      e.target.name
    ] = e.target.value;

    let monthSpecificTotal = calculateMonthlySpecificPaymentSum(
      updatedPaymentSchedule
    );

    updatedPaymentSchedule.monthSpecificTotal = monthSpecificTotal;

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

  const addSpecificRow = () => {
    setPaymentSchedule((prev) => ({
      ...prev,
      monthSpecificPaymentList: [
        ...prev.monthSpecificPaymentList,
        { month: "", year: "", amount: 0 },
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

  const removeMonthSpecificPayment = (monthIndex) => {
    const confirmed = window.confirm(
      "Are you sure you want to remove this month specifc payment?"
    );
    if (!confirmed) return;

    setPaymentSchedule((prev) => ({
      ...prev,
      monthSpecificPaymentList: prev.monthSpecificPaymentList.filter(
        (_, i) => i !== monthIndex
      ),
    }));
  };

  const fetchPaymentScheduleByUnitId = async (id) => {
    setLoading(true);
    try {
      let request = {
        id: id,
        paymentScheduleType: "CUSTOMER",
      };
      const response = await httpService.post(
        `/paymentSchedule/getByUnit`,
        request
      );

      const schedule = response.data;

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

      const durationInMonths = parseInt(schedule?.durationInMonths) || 0;

      // Calculate periods
      const quarterlyPeriods = Math.floor(durationInMonths / 3);
      const halfYearlyPeriods = Math.floor(durationInMonths / 6);
      const yearlyPeriods = Math.floor(durationInMonths / 12);

      // ✅ Calculate month-wise total
      let monthWiseTotal =  calculateMonthlyPaymentSum(schedule);
      let monthSpecificTotal =  calculateMonthlySpecificPaymentSum(schedule);

      // ✅ Totals
      const unitCost = actualAmount + miscellaneousAmount + developmentAmount;
      const customerCost =
        downPayment +
        (quarterlyPeriods > 0 ? quarterlyPayment * quarterlyPeriods : 0) +
        (halfYearlyPeriods > 0 ? halfYearlyPayment * halfYearlyPeriods : 0) +
        (yearlyPeriods > 0 ? yearlyPayment * yearlyPeriods : 0) +
        onPossessionPayment;

      schedule.unitCost = unitCost;
      schedule.customerCost = customerCost;
      schedule.monthWiseTotal = monthWiseTotal;
      schedule.monthSpecificTotal = monthSpecificTotal;


      if (schedule) {
        setPaymentSchedule(schedule || {});
      }
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

  const fetchUnitDetailsByUnitId = async (id) => {
    setLoading(true);
    try {
      const response = await httpService.get(`/unit/getUnitDetailsById/${id}`);

      if (response.data) {
        setProject(response.data.projectName);
        setFloor(response.data.floorNo);
        setTotalAmount(response.data.totalAmount);
        setUnit(response.data.unitSerial);
      }
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const onChangeCustomer = (customer) => {
    if (customer) {
      setSelectedCustomer(customer);
    }
  };

  const onChangeCreatedDate = (e) => {
    setBooking({ ...booking, createdDate: e.target.value });
  };

  const bookingDetails = async () => {
    try {
      const response = await httpService.get(
        `/booking/getDetailById/${bookingId}`
      );

      const unit = response?.data?.unit;
      const customer = response?.data?.customer;

      changeSelectedUnit(unit?.id);
      setFilterProject(customer?.projectId);
      setFilterFloor(customer?.floorId);
      fetchFloors(customer?.projectId);
      fetchUnits(customer?.floorId);
      setSelectedCustomer({
        customerId: customer.customerId,
        name: customer.name,
      });

      // onChangeCustomer({
      //   customerId: customer.customerId,
      //   name: customer.name,
      // });
    } catch (error) {}
  };

  const createBooking = async (e) => {
    e.preventDefault();

    const organization =
      JSON.parse(localStorage.getItem("organization")) || null;
    const updatedBooking = { ...booking };
    paymentSchedule.totalAmount =
      paymentSchedule.actualAmount + paymentSchedule.miscellaneousAmount;
    updatedBooking.customerId = selectedCustomer.customerId;
    updatedBooking.unitId = selectedUnit;
    updatedBooking.projectId = filterProject;
    updatedBooking.floorId = filterFloor;
    updatedBooking.organizationId = organization.organizationId;
    updatedBooking.paymentSchedule = paymentSchedule;
    updatedBooking.id = bookingId;

    console.log("updatedBooking :: ", updatedBooking);

    setLoading(true);
    try {
      const response = await httpService.post(
        `/booking/update`,
        updatedBooking
      );
      notifySuccess(response.responseMessage, 4000);
      resetState();
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  // product, floor , unit

  const fetchProjects = async () => {
    try {
      const sidebarData =
        JSON.parse(localStorage.getItem("organization")) || null;
      if (sidebarData) {
        const response = await httpService.get(
          `/project/getAllProjectByOrg/${sidebarData.organizationId}`
        );
        setProjects(response.data || []);
      }
    } catch (err) {
      notifyError("Failed to load projects", 4000);
    }
  };

  const fetchFloors = async (projectId) => {
    try {
      const response = await httpService.get(
        `/floor/getAllFloorsByProject/${projectId}`
      );
      setFloorOptions(response.data || []);
    } catch (err) {
      notifyError("Failed to load floors", 4000);
    }
  };
  const fetchUnits = async (floorId) => {
    try {
      const response = await httpService.get(
        `/unit/getAllIdSerialByFloorId/${floorId}`
      );

      console.log("response :: ", response);

      setUnitList(response.data || []);
    } catch (err) {
      notifyError("Failed to load floors", 4000);
    }
  };

  const changeSelectedProjected = (projectId) => {
    if (projectId) {
      setFilterProject(projectId);
      fetchFloors(projectId);
    }
  };

  const changeSelectedFloor = (floorId) => {
    console.log("floorId :: ", floorId);

    if (floorId) {
      setFilterFloor(floorId);
      fetchUnits(floorId);
    }
  };

  const changeSelectedUnit = (unitId) => {
    if (unitId) {
      fetchPaymentScheduleByUnitId(unitId);
      // fetchUnitDetailsByUnitId(unitId);
    }

    setSelectedUnit(unitId);
  };

  const onChangeCustomerSearch = (value) => {
    fetchCustomers(value);
  };

  const history = useHistory();

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6 border-0">
      <div className=" mb-0 py-6">
        <div className="flex justify-between">
          <h6 className="text-blueGray-700 text-xl font-bold uppercase">
            <span>
              <button className="">
                <IoArrowBackOutline
                  onClick={() => history.goBack()}
                  className="back-button-icon inline-block back-button"
                  style={{ paddingBottom: "3px", paddingRight: "7px" }}
                />
              </button>
            </span>
            Update Booking
          </h6>
        </div>
      </div>
      <div className="flex-auto px-4 py-5 bg-white rounded-12 shadow-lg">
        <form>
          <div className="flex flex-wrap border-bottom-grey py-3 mb-5">
            <div className="w-full lg:w-12/12  mt-2 md:px-0">
              <h6 className="text-blueGray-600 text-sm mt-3 mb-6 font-bold uppercase">
                Basic Details
              </h6>
              <div className="flex flex-wrap">
                <div className="w-full lg:w-12/12 px-4 md:px-0">
                  <div className="flex flex-wrap">
                    <div className="w-full lg:w-4/12 px-4 md:px-0">
                      <div className="relative w-full mb-3">
                        <div className="w-72">
                          <DebounceSearch
                            search={search}
                            setSearch={onChangeCustomerSearch}
                            setData={onChangeCustomer}
                            dataList={customerList}
                            placeholder="Search customers..."
                            label="Select Customer"
                            delay={1500}
                            defaultSelection={selectedCustomer?.name}
                            noChange={true}
                          />
                        </div>
                      </div>
                    </div>
                    <div className="w-full lg:w-4/12 px-4 md:px-0">
                      <div className="relative w-full mb-3">
                        <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                          Select Project
                        </label>
                        <select
                          value={filterProject}
                          className="border rounded-lg px-3 py-2 w-full"
                        >
                          <option value="">All Projects</option>
                          {projects.map((project) => (
                            <option key={project.id} value={project.id}>
                              {project.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="w-full lg:w-4/12 px-4 md:px-0">
                      <div className="relative w-full mb-3">
                        <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                          Select Floor
                        </label>
                        <select
                          value={filterFloor}
                          className="border rounded-lg px-3 py-2 w-full"
                        >
                          <option value="">All Floors</option>
                          {floorOptions.map((floor) => (
                            <option key={floor.id} value={floor.id}>
                              {floor.floorNo}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="w-full lg:w-4/12 px-4 md:px-0">
                      <div className="relative w-full mb-3">
                        <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                          Select Unit
                        </label>
                        <select
                          value={selectedUnit}
                          className="border rounded-lg px-3 py-2 w-full"
                        >
                          <option value="">All Units</option>
                          {unitList.map((unit) => (
                            <option key={unit.id} value={unit.id}>
                              {unit.serialNo}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="w-full lg:w-4/12 px-4 md:px-0">
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
                          value={paymentSchedule?.paymentPlanType}
                          onChange={(e) => changePaymentScheduleFields(e)}
                        >
                          <option value="">NONE</option>
                          {PAYMENT_PLANS_TYPE.map((type, index) => (
                            <option key={index} value={type}>
                              {type}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {/* Created Date */}
                    <div className="w-full lg:w-4/12 px-4 mb-3">
                      <label className="block uppercase text-blueGray-500 text-xs font-bold mb-2">
                        Created Date
                      </label>
                      <input
                        type="datetime-local"
                        name="createdDate"
                        value={booking.createdDate}
                        onChange={onChangeCreatedDate}
                        className=" px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full"
                      />
                    </div>
                  </div>
                </div>
                {/* <div className="w-full lg:w-12/12 px-4 md:px-0">
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
                </div> */}
              </div>
            </div>
          </div>

          <div className="">
            <div className=" flex flex-wrap">
              <div className="w-full px-4 lg:w-6/12 border-right-grey md:px-0">
                {/* Payment Schedule Heading */}
                <div className="mt-3 mb-8 text-blueGray-600 text-md uppercase font-bold">
                  Unit Costing
                  <text className="ml-3 text-green-600">
                    ({parseFloat(paymentSchedule?.unitCost).toLocaleString()})
                  </text>
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
                          type="number"
                          name="miscellaneousAmount"
                          className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          onChange={(e) => changePaymentScheduleFields(e)}
                          value={paymentSchedule.miscellaneousAmount}
                        />
                      </div>
                    </div>

                    {/* Development Amount */}
                    <div className="w-full px-4 lg:w-6/12 md:px-0">
                      <div className="relative w-full mb-3">
                        <label
                          className="block uppercase text-blueGray-500 text-xs font-bold mb-2"
                          htmlFor="developmentAmount"
                        >
                          Development Amount
                        </label>
                        <input
                          id="developmentAmount"
                          type="number"
                          name="developmentAmount"
                          className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                          onChange={(e) => changePaymentScheduleFields(e)}
                          value={paymentSchedule.developmentAmount}
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
                            Number(paymentSchedule.miscellaneousAmount) +
                            Number(paymentSchedule.developmentAmount)
                          }
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {paymentSchedule?.paymentPlanType == "INSTALLMENT_RANGE" ? (
                <div className="w-full lg:w-6/12 ">
                  <div className="relative w-full">
                    <div className="ml-3 mt-3  text-blueGray-600 text-md uppercase font-bold">
                      Customer Payment Schedule
                      {(() => {
                        const unitCost = paymentSchedule?.unitCost;
                        const customerCost =
                          paymentSchedule?.customerCost +
                          paymentSchedule?.monthWiseTotal;

                        const classColor =
                          unitCost == customerCost
                            ? "text-green-600"
                            : unitCost > customerCost
                            ? "text-blue-600"
                            : "text-red-600";
                        return (
                          <text className={`ml-3 ${classColor}`}>
                            ({parseFloat(customerCost).toLocaleString()})
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
                      </>
                    </div>
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
                              <div className="w-full lg:w-3/12">
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
                              <div className="mt-6 text-right pt-1 md:ml-auto md:mt-2 lg:ml-auto lg:pt-0">
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
              ) : paymentSchedule?.paymentPlanType == "INSTALLMENT_SPECIFIC" ? (
                <div className="w-full lg:w-6/12 ">
                  <div className="relative w-full">
                    <div className="ml-3 mt-3  text-blueGray-600 text-md uppercase font-bold">
                      Customer Payment Schedule
                      {(() => {
                        const unitCost = paymentSchedule.unitCost;

                        const customerCost =
                          paymentSchedule?.customerCost +
                          paymentSchedule?.monthSpecificTotal;

                        const classColor =
                          unitCost == customerCost
                            ? "text-green-600"
                            : unitCost > customerCost
                            ? "text-blue-600"
                            : "text-red-600";
                        return (
                          <text className={`ml-3 ${classColor}`}>
                            ({parseFloat(customerCost).toLocaleString()})
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
                              onChange={(e) => changePaymentScheduleFields(e)}
                              value={paymentSchedule.downPayment}
                            />
                          </div>
                        </div>
                      </>
                    </div>
                    <div>
                      <div className="px-4 mt-3 mb-3 rounded md:px-0">
                        <div className="flex justify-between">
                          <div className="uppercase text-blueGray-600 font-bold text-sm text-left">
                            Month Specific Payment
                          </div>
                          <button
                            type="button"
                            onClick={() => addSpecificRow()}
                            className="bg-red-500 text-white  font-bold uppercase text-xs px-3 py-1 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150"
                          >
                            <IoMdAddCircle
                              className="inline-block w-3 h-3"
                              style={{ paddingRight: "0px" }}
                            />{" "}
                            Row
                          </button>
                        </div>

                        {paymentSchedule?.monthSpecificPaymentList?.map(
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
                                    Month
                                  </label>
                                  <select
                                    id="name"
                                    type="text"
                                    name="month"
                                    className="px-3 py-3 placeholder-blueGray-300 text-blueGray-500 bg-white rounded-lg text-sm focus:outline-none focus:ring w-full ease-linear transition-all duration-150"
                                    onChange={(e) =>
                                      changeMonthlySpecificPaymentFields(
                                        mIndex,
                                        e
                                      )
                                    }
                                    value={monthly.month}
                                  >
                                    <option>Select Month</option>
                                    {MONTH_LABELS.map((month) => (
                                      <option key={month} value={month}>
                                        {month}
                                      </option>
                                    ))}
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
                                        mIndex,
                                        e
                                      )
                                    }
                                    value={monthly.year}
                                  >
                                    <option>Select Year</option>
                                    {generateYears(10, 10).map((year) => (
                                      <option key={year} value={year}>
                                        {year}
                                      </option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                              <div className="w-full lg:w-3/12">
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
                                        mIndex,
                                        e
                                      )
                                    }
                                    value={monthly.amount}
                                  />
                                </div>
                              </div>
                              <div className="mt-6 text-right pt-1 md:ml-auto md:mt-2 lg:ml-auto lg:pt-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    removeMonthSpecificPayment(mIndex)
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
              ) : (
                <></>
              )}
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
            Update Booking
          </button>
        </form>
      </div>
    </div>
  );
}
