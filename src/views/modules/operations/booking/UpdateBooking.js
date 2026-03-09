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
import { FaCalendarCheck, FaUser, FaBuilding, FaMoneyBillWave, FaCreditCard } from "react-icons/fa";

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
      {/* Header */}
      <div className="mb-4 py-4">
        <h6 className="text-blueGray-700 text-lg font-bold uppercase flex items-center">
          <button onClick={() => history.goBack()} className="mr-3">
            <IoArrowBackOutline className="text-xl" style={{ color: "#64748b" }} />
          </button>
          <FaCalendarCheck className="mr-2" style={{ color: "#10b981" }} />
          Update Booking
        </h6>
      </div>

      <form onSubmit={(e) => createBooking(e)} className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 space-y-4">

          {/* Basic Details Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
              <FaUser className="mr-2" style={{ fontSize: "14px", color: "#6366f1" }} />
              Basic Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Select Customer</label>
                <div className="w-full">
                  <DebounceSearch
                    search={search}
                    setSearch={onChangeCustomerSearch}
                    setData={onChangeCustomer}
                    dataList={customerList}
                    placeholder="Search customers..."
                    label=""
                    delay={1500}
                    defaultSelection={selectedCustomer?.name}
                    noChange={true}
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Payment Plan Type</label>
                <select
                  id="projectType"
                  name="paymentPlanType"
                  className="w-full p-2 border rounded-lg text-sm"
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
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Created Date</label>
                <input
                  type="datetime-local"
                  name="createdDate"
                  value={booking.createdDate}
                  onChange={onChangeCreatedDate}
                  className="w-full p-2 border rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Unit/Property Info Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
              <FaBuilding className="mr-2" style={{ fontSize: "14px", color: "#10b981" }} />
              Unit / Property Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Select Project</label>
                <select
                  value={filterProject}
                  className="w-full p-2 border rounded-lg text-sm"
                >
                  <option value="">All Projects</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Select Floor</label>
                <select
                  value={filterFloor}
                  className="w-full p-2 border rounded-lg text-sm"
                >
                  <option value="">All Floors</option>
                  {floorOptions.map((floor) => (
                    <option key={floor.id} value={floor.id}>
                      {floor.floorNo}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Select Unit</label>
                <select
                  value={selectedUnit}
                  className="w-full p-2 border rounded-lg text-sm"
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
          </div>

          {/* Unit Costing Section */}
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center border-b border-gray-200 pb-2">
              <FaMoneyBillWave className="mr-2" style={{ fontSize: "14px", color: "#f59e0b" }} />
              Unit Costing
              <span className="ml-3 text-green-600 font-bold">
                ({parseFloat(paymentSchedule?.unitCost).toLocaleString()})
              </span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Duration In Months</label>
                <input
                  id="durationInMonths"
                  type="text"
                  name="durationInMonths"
                  className="w-full p-2 border rounded-lg text-sm"
                  onChange={(e) => changePaymentScheduleFields(e)}
                  value={paymentSchedule.durationInMonths}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Actual Amount</label>
                <input
                  id="actualAmount"
                  type="text"
                  name="actualAmount"
                  className="w-full p-2 border rounded-lg text-sm"
                  onChange={(e) => changePaymentScheduleFields(e)}
                  value={paymentSchedule.actualAmount}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Miscellaneous Amount</label>
                <input
                  id="miscellaneousAmount"
                  type="text"
                  name="miscellaneousAmount"
                  className="w-full p-2 border rounded-lg text-sm"
                  onChange={(e) => changePaymentScheduleFields(e)}
                  value={paymentSchedule.miscellaneousAmount}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Development Amount</label>
                <input
                  id="developmentAmount"
                  type="text"
                  name="developmentAmount"
                  className="w-full p-2 border rounded-lg text-sm"
                  onChange={(e) => changePaymentScheduleFields(e)}
                  value={paymentSchedule.developmentAmount}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Total Amount</label>
                <input
                  id="totalAmount"
                  type="text"
                  name="totalAmount"
                  disabled
                  className="w-full p-2 border rounded-lg text-sm bg-gray-100 cursor-not-allowed"
                  value={
                    Number(paymentSchedule.actualAmount) +
                    Number(paymentSchedule.miscellaneousAmount) +
                    Number(paymentSchedule.developmentAmount)
                  }
                />
              </div>
            </div>
          </div>

          {/* Customer Payment Schedule - INSTALLMENT_RANGE */}
          {paymentSchedule?.paymentPlanType === "INSTALLMENT_RANGE" && (
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
                  const unitCost = paymentSchedule.unitCost;
                  const customerCost =
                    paymentSchedule?.customerCost +
                    paymentSchedule?.monthWiseTotal;
                  const classColor =
                    unitCost === customerCost
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
                        type="text"
                        name="downPayment"
                        className="w-full p-1.5 border rounded-lg text-sm"
                        onChange={(e) => changePaymentScheduleFields(e)}
                        value={paymentSchedule.downPayment}
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
                        value={paymentSchedule.quarterlyPayment}
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
                        value={paymentSchedule.halfYearlyPayment}
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
                        value={paymentSchedule.yearlyPayment}
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
                        value={paymentSchedule.onPossessionPayment}
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
                      onClick={() => addRow()}
                      className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-3 py-1 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150 inline-flex items-center"
                    >
                      <IoMdAddCircle className="mr-1" />
                      Row
                    </button>
                  </div>

                  <div className="space-y-3">
                    {paymentSchedule?.monthWisePaymentList?.map((monthly, mIndex) => (
                      <div key={mIndex} className="bg-gray-50 rounded-lg px-3 py-2">
                        <div className="grid grid-cols-4 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">From</label>
                            <input
                              type="text"
                              name="fromMonth"
                              className="w-full p-1.5 border rounded-lg text-sm"
                              onChange={(e) => changeMonthlyPaymentFields(mIndex, e)}
                              value={monthly.fromMonth}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">To</label>
                            <input
                              type="text"
                              name="toMonth"
                              className="w-full p-1.5 border rounded-lg text-sm"
                              onChange={(e) => changeMonthlyPaymentFields(mIndex, e)}
                              value={monthly.toMonth}
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Amount</label>
                            <input
                              type="text"
                              name="amount"
                              className="w-full p-1.5 border rounded-lg text-sm"
                              onChange={(e) => changeMonthlyPaymentFields(mIndex, e)}
                              value={monthly.amount}
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
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Customer Payment Schedule - INSTALLMENT_SPECIFIC */}
          {paymentSchedule?.paymentPlanType === "INSTALLMENT_SPECIFIC" && (
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
                  const unitCost = paymentSchedule.unitCost;
                  const customerCost =
                    paymentSchedule?.customerCost +
                    paymentSchedule?.monthSpecificTotal;
                  const classColor =
                    unitCost === customerCost
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
                        value={paymentSchedule.downPayment}
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
                      onClick={() => addSpecificRow()}
                      className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-3 py-1 rounded shadow hover:shadow-md outline-none focus:outline-none ease-linear transition-all duration-150 inline-flex items-center"
                    >
                      <IoMdAddCircle className="mr-1" />
                      Row
                    </button>
                  </div>

                  <div className="space-y-3">
                    {paymentSchedule?.monthSpecificPaymentList?.map((monthly, mIndex) => (
                      <div key={mIndex} className="bg-gray-50 rounded-lg px-3 py-2">
                        <div className="grid grid-cols-4 gap-2">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Month</label>
                            <select
                              name="month"
                              className="w-full p-1.5 border rounded-lg text-sm"
                              onChange={(e) => changeMonthlySpecificPaymentFields(mIndex, e)}
                              value={monthly.month}
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
                              onChange={(e) => changeMonthlySpecificPaymentFields(mIndex, e)}
                              value={monthly.year}
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
                              onChange={(e) => changeMonthlySpecificPaymentFields(mIndex, e)}
                              value={monthly.amount}
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
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

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
              disabled={loading}
              className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              <FaCalendarCheck className="mr-1" style={{ color: "white" }} />
              {loading ? "Saving..." : "Update Booking"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
