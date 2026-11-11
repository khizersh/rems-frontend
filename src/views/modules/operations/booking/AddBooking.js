import React, { useContext, useEffect, useRef, useState } from "react";
import { IoMdAddCircle } from "react-icons/io";
import { MdDeleteForever } from "react-icons/md";
import { MainContext } from "context/MainContext";
import httpService from "../../../../utility/httpService.js";
import DebounceSearch from "../../../../components/CustomerComponents/DebounceSearchDropDown.js";
import { IoArrowBackOutline } from "react-icons/io5";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min.js";
import { MONTH_LABELS } from "utility/Utility.js";
import { generateYears } from "utility/Utility.js";
import {
  FaCalendarCheck,
  FaUser,
  FaBuilding,
  FaMoneyBillWave,
  FaCreditCard,
  FaInfoCircle,
  FaCheckCircle,
  FaClipboardList,
  FaExclamationTriangle,
  FaHistory,
  FaPlusCircle,
} from "react-icons/fa";
import Tippy from "@tippyjs/react";
import "tippy.js/dist/tippy.css";
import { PAYMENT_PLANS_TYPE } from "utility/Utility.js";

const NO_SCHEDULE_MESSAGE =
  "No payment schedule is configured for the selected unit. Please configure the unit payment schedule before creating a booking.";

const BOOKING_TYPES = [
  {
    value: "NEW",
    title: "New Booking",
    description:
      "Create a new booking for a customer. The complete booking amount will be recorded as customer receivable.",
    icon: FaPlusCircle,
    color: "#0ea5e9",
  },
  {
    value: "EXISTING",
    title: "Existing Booking",
    description:
      "Import a booking created before system onboarding. Enter the amount already paid by the customer, and only the remaining amount will be recorded as receivable.",
    icon: FaHistory,
    color: "#8b5cf6",
  },
];

const formatAmount = (value) =>
  (Number(value) || 0).toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });

const gridStyle = (min = 220) => ({
  display: "grid",
  gridTemplateColumns: `repeat(auto-fit, minmax(${min}px, 1fr))`,
  gap: "16px",
});

const labelStyle = {
  display: "flex",
  alignItems: "center",
  fontSize: "12px",
  fontWeight: 600,
  color: "#374151",
  marginBottom: "4px",
};

const helperStyle = { fontSize: "11px", color: "#6b7280", marginTop: "4px" };

const controlStyle = {
  width: "100%",
  padding: "8px 10px",
  fontSize: "14px",
  border: "1px solid #d1d5db",
  borderRadius: "8px",
  background: "#ffffff",
};

const readOnlyStyle = {
  ...controlStyle,
  background: "#f3f4f6",
  color: "#374151",
  cursor: "not-allowed",
};

const InfoTip = ({ text }) => (
  <Tippy content={text} placement="top" maxWidth={320}>
    <span
      tabIndex={0}
      style={{
        display: "inline-flex",
        marginLeft: "6px",
        cursor: "help",
        color: "#64748b",
      }}
    >
      <FaInfoCircle style={{ fontSize: "13px" }} />
    </span>
  </Tippy>
);

const SectionCard = ({ step, icon: Icon, color, title, tip, children }) => (
  <div
    style={{
      background: "#f9fafb",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      padding: "16px 18px",
    }}
  >
    <h3
      className="text-sm font-bold text-gray-700 flex items-center"
      style={{
        borderBottom: "1px solid #e5e7eb",
        paddingBottom: "10px",
        marginBottom: "16px",
      }}
    >
      <span
        style={{
          width: "22px",
          height: "22px",
          borderRadius: "9999px",
          background: color,
          color: "#fff",
          fontSize: "11px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          marginRight: "8px",
        }}
      >
        {step}
      </span>
      <Icon className="mr-2" style={{ fontSize: "14px", color }} />
      {title}
      {tip && <InfoTip text={tip} />}
    </h3>
    {children}
  </div>
);

const AmountCard = ({ label, value, color, bg, tip }) => (
  <div
    style={{
      background: bg,
      border: `1px solid ${color}33`,
      borderRadius: "12px",
      padding: "14px 16px",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        fontSize: "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        color: "#6b7280",
      }}
    >
      {label}
      {tip && <InfoTip text={tip} />}
    </div>
    <div style={{ fontSize: "22px", fontWeight: 700, color, marginTop: "4px" }}>
      {value}
    </div>
  </div>
);

const SummaryItem = ({ label, value }) => (
  <div>
    <div
      style={{
        fontSize: "11px",
        fontWeight: 700,
        textTransform: "uppercase",
        color: "#6b7280",
      }}
    >
      {label}
    </div>
    <div style={{ fontSize: "14px", fontWeight: 600, color: "#1f2937" }}>
      {value}
    </div>
  </div>
);

export default function AddBooking() {
  const { loading, setLoading, notifyError, notifySuccess } =
    useContext(MainContext);
  const [customerList, setCustomerList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [search, setSearch] = useState("");
  const [paymentSchedule, setPaymentSchedule] = useState(null);
  const scheduleRequestId = useRef(0);
  const [paymentScheduleLoading, setPaymentScheduleLoading] = useState(false);
  const [paymentScheduleError, setPaymentScheduleError] = useState("");
  const [bookingType, setBookingType] = useState("NEW");
  const [paidAmount, setPaidAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [unitList, setUnitList] = useState([]);
  const [filterProject, setFilterProject] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [filterFloor, setFilterFloor] = useState("");
  const [floorOptions, setFloorOptions] = useState([]);
  const [booking, setBooking] = useState({
    customerId: null,
    unitId: null,
    floorId: null,
    projectId: null,
    organizationId: 0,
    paymentSchedule: {},
    createdDate: new Date().toISOString().slice(0, 16),
    updatedDate: null,
  });

  useEffect(() => {
    fetchCustomers(search);
    fetchProjects();
  }, []);

  const resetState = () => {
    setPaymentSchedule(null);
    setPaymentScheduleError("");
    setPaymentScheduleLoading(false);
    setPaidAmount("");
    setSelectedUnit("");
  };

  const fetchCustomers = async (search) => {
    setLoading(true);
    try {
      let request = {
        orgId: "",
        name: search || "",
      };
      const organization =
        JSON.parse(localStorage.getItem("organization")) || null;
      if (organization) {
        request.orgId = organization.organizationId;
      }

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
      onPossessionPayment;

    // Update schedule

    schedule.unitCost = unitCost;
    schedule.customerCost = customerCost;

    // Discounts are applied by editing the amounts, so the booking total follows them
    if (
      ["actualAmount", "miscellaneousAmount", "developmentAmount"].includes(
        e.target.name
      )
    ) {
      schedule.totalAmount = actualAmount + miscellaneousAmount;
    }
    if (!Array.isArray(schedule.monthWisePaymentList)) {
      schedule.monthWisePaymentList = [];
    }
    if (!Array.isArray(schedule.monthSpecificPaymentList)) {
      schedule.monthSpecificPaymentList = [];
    }

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

  const fetchPaymentScheduleByUnitId = async (id) => {
    const requestId = ++scheduleRequestId.current;
    setPaymentScheduleLoading(true);
    setPaymentScheduleError("");
    try {
      let request = {
        id: id,
        paymentScheduleType: "BUILDER",
      };
      const response = await httpService.post(
        `/paymentSchedule/getByUnit`,
        request
      );

      const schedule = response?.data;
      if (!schedule) {
        throw new Error(NO_SCHEDULE_MESSAGE);
      }
      // Existing flow computed the total from actual + miscellaneous amounts
      const totalAmount =
        Number(schedule.totalAmount) ||
        (Number(schedule.actualAmount) || 0) +
          (Number(schedule.miscellaneousAmount) || 0);
      if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
        throw new Error(NO_SCHEDULE_MESSAGE);
      }
      schedule.totalAmount = totalAmount;

      // Parse all numeric values safely
      const actualAmount = parseFloat(schedule?.actualAmount) || 0;
      const developmentAmount = parseFloat(schedule?.developmentAmount) || 0;
      const miscellaneousAmount =
        parseFloat(schedule?.miscellaneousAmount) || 0;
      const downPayment = parseFloat(schedule?.downPayment) || 0;
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
      let monthWiseTotal = calculateMonthlyPaymentSum(schedule);
      let monthSpecificTotal = calculateMonthlySpecificPaymentSum(schedule);

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

      if (requestId === scheduleRequestId.current) {
        setPaymentSchedule(schedule);
      }
    } catch (err) {
      if (requestId === scheduleRequestId.current) {
        const message = err.message || NO_SCHEDULE_MESSAGE;
        setPaymentSchedule(null);
        setPaymentScheduleError(message);
        notifyError(message, err.data, 4000);
      }
    } finally {
      if (requestId === scheduleRequestId.current) {
        setPaymentScheduleLoading(false);
      }
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

  const totalBookingAmount = Number(paymentSchedule?.totalAmount) || 0;
  const parsedPaidAmount = paidAmount === "" ? NaN : Number(paidAmount);
  const remainingAmount = totalBookingAmount - parsedPaidAmount;
  const paidAmountError =
    bookingType !== "EXISTING"
      ? ""
      : paidAmount === ""
      ? "Already paid amount is required for an existing booking."
      : !Number.isFinite(parsedPaidAmount)
      ? "Already paid amount must be a valid number."
      : parsedPaidAmount < 0
      ? "Already paid amount cannot be negative."
      : parsedPaidAmount > totalBookingAmount
      ? "Already paid amount cannot exceed the total booking amount."
      : "";

  const missingFields = [];
  if (!filterProject) missingFields.push("project");
  if (!filterFloor) missingFields.push("floor");
  if (!selectedUnit) missingFields.push("unit");
  if (!selectedCustomer) missingFields.push("customer");
  if (selectedUnit && !paymentSchedule && !paymentScheduleLoading) {
    missingFields.push("payment schedule");
  }
  if (bookingType === "EXISTING" && paymentSchedule && paidAmountError) {
    missingFields.push("valid already paid amount");
  }

  const isSubmitDisabled =
    loading ||
    isSubmitting ||
    paymentScheduleLoading ||
    !!paymentScheduleError ||
    !paymentSchedule ||
    missingFields.length > 0;

  const projectName = projects.find(
    (p) => String(p.id) === String(filterProject)
  )?.name;
  const floorName = floorOptions.find(
    (f) => String(f.id) === String(filterFloor)
  )?.floorNo;
  const unitName = unitList.find(
    (u) => String(u.id) === String(selectedUnit)
  )?.serialNo;
  const selectedBookingType = BOOKING_TYPES.find(
    (t) => t.value === bookingType
  );

  const createBooking = async (e) => {
    e.preventDefault();

    if (isSubmitDisabled) {
      return;
    }

    const organization =
      JSON.parse(localStorage.getItem("organization")) || null;
    const updatedBooking = { ...booking };
    updatedBooking.customerId = selectedCustomer.customerId;
    updatedBooking.unitId = selectedUnit;
    updatedBooking.projectId = filterProject;
    updatedBooking.floorId = filterFloor;
    updatedBooking.organizationId = organization?.organizationId;
    const bookingPaymentSchedule = { ...paymentSchedule };
    delete bookingPaymentSchedule.id;
    updatedBooking.paymentSchedule = bookingPaymentSchedule;
    updatedBooking.bookingType = bookingType;
    if (bookingType === "EXISTING") {
      updatedBooking.paidAmount = parsedPaidAmount;
    }

    setLoading(true);
    setIsSubmitting(true);
    try {
      const response = await httpService.post(`/booking/add`, updatedBooking);
      notifySuccess(response.responseMessage, 4000);
      resetState();
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
      setIsSubmitting(false);
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
        `/unit/getIdSerialByFloorId/${floorId}`
      );
      setUnitList(response.data || []);
    } catch (err) {
      notifyError("Failed to load floors", 4000);
    }
  };

  const changeSelectedProjected = (projectId) => {
    scheduleRequestId.current += 1;
    setFilterProject(projectId);
    setFilterFloor("");
    setSelectedUnit("");
    setFloorOptions([]);
    setUnitList([]);
    setPaymentSchedule(null);
    setPaymentScheduleError("");
    setPaymentScheduleLoading(false);
    setPaidAmount("");
    if (projectId) {
      fetchFloors(projectId);
    }
  };

  const changeSelectedFloor = (floorId) => {
    scheduleRequestId.current += 1;
    setFilterFloor(floorId);
    setSelectedUnit("");
    setUnitList([]);
    setPaymentSchedule(null);
    setPaymentScheduleError("");
    setPaymentScheduleLoading(false);
    setPaidAmount("");
    if (floorId) {
      fetchUnits(floorId);
    }
  };

  const changeSelectedUnit = (unitId) => {
    scheduleRequestId.current += 1;
    setPaymentSchedule(null);
    setPaymentScheduleError("");
    setPaidAmount("");
    if (unitId) {
      fetchPaymentScheduleByUnitId(unitId);
    } else {
      setPaymentScheduleLoading(false);
    }

    setSelectedUnit(unitId);
  };

  const changeBookingType = (type) => {
    setBookingType(type);
    setPaidAmount("");
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
          <button type="button" onClick={() => history.goBack()} className="mr-2">
            <IoArrowBackOutline className="text-xl" style={{ color: "#64748b" }} />
          </button>
          <FaCalendarCheck className="mr-2" style={{ color: "#6366f1" }} />
          Create Booking
        </h6>
      </div>

      {/* Form Wrapper */}
      <form onSubmit={createBooking} className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6 space-y-6">
          
          {/* 1. Booking Type */}
          <SectionCard
            step={1}
            icon={FaClipboardList}
            color="#0ea5e9"
            title="Booking Type"
            tip="Select New Booking for a booking being created now. Select Existing Booking when importing a booking that was created before this system was introduced."
          >
            <div role="radiogroup" aria-label="Booking Type" style={gridStyle(280)}>
              {BOOKING_TYPES.map((type) => {
                const active = bookingType === type.value;
                const Icon = type.icon;
                return (
                  <button
                    type="button"
                    key={type.value}
                    role="radio"
                    aria-checked={active}
                    onClick={() => changeBookingType(type.value)}
                    style={{
                      textAlign: "left",
                      padding: "14px 16px",
                      borderRadius: "12px",
                      border: `2px solid ${active ? type.color : "#e5e7eb"}`,
                      background: active ? `${type.color}12` : "#ffffff",
                      boxShadow: active ? `0 4px 12px ${type.color}33` : "none",
                      transition: "all 0.15s ease-in-out",
                      cursor: "pointer",
                      outline: "none",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        fontWeight: 700,
                        fontSize: "14px",
                        color: active ? type.color : "#374151",
                      }}
                    >
                      <Icon style={{ marginRight: "8px", fontSize: "16px" }} />
                      {type.title}
                      {active && (
                        <FaCheckCircle
                          style={{ marginLeft: "auto", fontSize: "16px" }}
                        />
                      )}
                    </div>
                    <div
                      style={{
                        fontSize: "12px",
                        color: "#6b7280",
                        marginTop: "6px",
                        lineHeight: 1.5,
                      }}
                    >
                      {type.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </SectionCard>

          {/* 2. Property Selection */}
          <SectionCard
            step={2}
            icon={FaBuilding}
            color="#10b981"
            title="Unit / Property Info"
            tip="Choose the project, floor and unit. The unit's payment schedule is loaded automatically."
          >
            <div style={gridStyle(220)}>
              <div>
                <label style={labelStyle}>Select Project</label>
                <select
                  value={filterProject}
                  onChange={(e) => changeSelectedProjected(e.target.value)}
                  style={controlStyle}
                >
                  <option value="">Select Project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Select Floor</label>
                <select
                  value={filterFloor}
                  onChange={(e) => changeSelectedFloor(e.target.value)}
                  disabled={!filterProject}
                  style={controlStyle}
                >
                  <option value="">Select Floor</option>
                  {floorOptions.map((floor) => (
                    <option key={floor.id} value={floor.id}>
                      {floor.floorNo}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Select Unit</label>
                <select
                  value={selectedUnit || ""}
                  onChange={(e) => changeSelectedUnit(e.target.value)}
                  disabled={!filterFloor}
                  style={controlStyle}
                >
                  <option value="">Select Unit</option>
                  {unitList.map((unit) => (
                    <option key={unit.id} value={unit.id}>
                      {unit.serialNo}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {paymentScheduleLoading && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  marginTop: "14px",
                  fontSize: "13px",
                  color: "#4b5563",
                }}
              >
                <style>{"@keyframes bookingSpin{to{transform:rotate(360deg)}}"}</style>
                <span
                  style={{
                    width: "16px",
                    height: "16px",
                    marginRight: "8px",
                    borderRadius: "9999px",
                    border: "2px solid #cbd5e1",
                    borderTopColor: "#0ea5e9",
                    animation: "bookingSpin 0.8s linear infinite",
                  }}
                />
                Loading unit costing and payment schedule...
              </div>
            )}
            {paymentScheduleError && !paymentScheduleLoading && (
              <div
                role="alert"
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  marginTop: "14px",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  background: "#fef2f2",
                  border: "1px solid #fecaca",
                  color: "#b91c1c",
                  fontSize: "13px",
                }}
              >
                <FaExclamationTriangle
                  style={{ marginRight: "8px", marginTop: "2px", flexShrink: 0 }}
                />
                {paymentScheduleError}
              </div>
            )}
          </SectionCard>

          {/* 3. Customer Information */}
          <SectionCard
            step={3}
            icon={FaUser}
            color="#8b5cf6"
            title="Customer Info"
          >
            <div style={gridStyle(240)}>
              <div>
                <label style={labelStyle}>
                  Select Customer
                  <InfoTip text="Select the customer who will own this booking." />
                </label>
                <div
                  style={{
                    border: "1px solid #d1d5db",
                    borderRadius: "8px",
                    background: "#ffffff",
                  }}
                >
                  <DebounceSearch
                    search={search}
                    setSearch={onChangeCustomerSearch}
                    setData={onChangeCustomer}
                    dataList={customerList}
                    placeholder="Search customers..."
                    label=""
                    delay={1500}
                  />
                </div>
                <div style={helperStyle}>
                  {selectedCustomer
                    ? `Selected: ${selectedCustomer.name}`
                    : "Type a name to search, then pick a customer from the list."}
                </div>
              </div>
              <div>
                <label style={labelStyle}>Booking / Created Date</label>
                <input
                  type="datetime-local"
                  name="createdDate"
                  value={booking.createdDate}
                  onChange={onChangeCreatedDate}
                  style={controlStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>
                  Payment Plan Type
                  <InfoTip text="Auto-populated from the unit's payment schedule. You can change it for this booking." />
                </label>
                <select
                  name="paymentPlanType"
                  value={paymentSchedule?.paymentPlanType || ""}
                  onChange={changePaymentScheduleFields}
                  disabled={!paymentSchedule}
                  style={paymentSchedule ? controlStyle : readOnlyStyle}
                >
                  <option value="">NONE</option>
                  {PAYMENT_PLANS_TYPE.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                <div style={helperStyle}>
                  {paymentSchedule
                    ? "Populated from the unit; editable."
                    : "Select a unit to load the payment plan."}
                </div>
              </div>
            </div>
          </SectionCard>

          {/* 4. Unit Costing */}
          {paymentSchedule && (
            <SectionCard
              step={4}
              icon={FaMoneyBillWave}
              color="#f59e0b"
              title="Unit Costing"
              tip="Values are auto-populated from the selected unit. Edit them to apply a discount or adjustment for this booking."
            >
              <div style={gridStyle(200)}>
                {[
                  ["durationInMonths", "Duration In Months"],
                  ["actualAmount", "Actual Amount"],
                  ["developmentAmount", "Development Amount"],
                  ["miscellaneousAmount", "Miscellaneous Amount"],
                ].map(([name, label]) => (
                  <div key={name}>
                    <label style={labelStyle} htmlFor={name}>
                      {label}
                    </label>
                    <input
                      id={name}
                      type="text"
                      inputMode="decimal"
                      name={name}
                      value={paymentSchedule[name] ?? ""}
                      onChange={changePaymentScheduleFields}
                      style={controlStyle}
                    />
                    {name !== "durationInMonths" && (
                      <div style={helperStyle}>
                        {formatAmount(paymentSchedule[name])}
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ marginTop: "16px" }}>
                <AmountCard
                  label="Total Booking Amount"
                  value={formatAmount(totalBookingAmount)}
                  color="#0369a1"
                  bg="#f0f9ff"
                  tip="Actual Amount plus Miscellaneous Amount. Updates automatically when you edit the amounts above."
                />
              </div>
            </SectionCard>
          )}

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
                          <div className="flex items-end justify-center pb-1 mt-5 ">
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

          {/* 5. Existing Booking Details */}
          {bookingType === "EXISTING" && paymentSchedule && (
            <SectionCard
              step={5}
              icon={FaHistory}
              color="#8b5cf6"
              title="Existing Booking Details"
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  padding: "10px 12px",
                  marginBottom: "16px",
                  borderRadius: "8px",
                  background: "#eff6ff",
                  border: "1px solid #bfdbfe",
                  color: "#1e40af",
                  fontSize: "12px",
                  lineHeight: 1.5,
                }}
              >
                <FaInfoCircle
                  style={{ marginRight: "8px", marginTop: "2px", flexShrink: 0 }}
                />
                This booking was created before system onboarding. The already
                paid amount will update the customer account and payment
                schedule history. No journal entry will be created for the
                already paid amount. Only the remaining amount will be recorded
                as customer receivable.
              </div>
              <div style={{ maxWidth: "360px", marginBottom: "16px" }}>
                <label style={labelStyle} htmlFor="paidAmount">
                  Already Paid Amount
                  <InfoTip text="Enter the total amount received from the customer before this booking was added to the system." />
                </label>
                <input
                  id="paidAmount"
                  type="number"
                  min="0"
                  step="any"
                  inputMode="decimal"
                  placeholder="0"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  style={{
                    ...controlStyle,
                    borderColor:
                      paidAmount !== "" && paidAmountError
                        ? "#f87171"
                        : "#d1d5db",
                  }}
                />
                {paidAmount !== "" && paidAmountError ? (
                  <div style={{ ...helperStyle, color: "#dc2626" }} role="alert">
                    {paidAmountError}
                  </div>
                ) : (
                  <div style={helperStyle}>
                    Required. Cannot exceed the total booking amount.
                  </div>
                )}
              </div>
              <div style={gridStyle(200)}>
                <AmountCard
                  label="Total Booking Amount"
                  value={formatAmount(totalBookingAmount)}
                  color="#0369a1"
                  bg="#f0f9ff"
                />
                <AmountCard
                  label="Already Paid Amount"
                  value={formatAmount(paidAmountError ? 0 : parsedPaidAmount)}
                  color="#047857"
                  bg="#ecfdf5"
                />
                <AmountCard
                  label="Remaining Receivable"
                  value={formatAmount(paidAmountError ? 0 : remainingAmount)}
                  color="#b45309"
                  bg="#fffbeb"
                  tip="This amount is calculated automatically as Total Booking Amount minus Already Paid Amount."
                />
              </div>
            </SectionCard>
          )}

          {/* 6. Booking Summary */}
          <div
            style={{
              background: "linear-gradient(135deg, #eef2ff 0%, #f0f9ff 100%)",
              border: "1px solid #c7d2fe",
              borderRadius: "12px",
              padding: "16px 18px",
            }}
          >
            <h3
              className="text-sm font-bold text-gray-700 flex items-center"
              style={{ marginBottom: "14px" }}
            >
              <FaCheckCircle
                className="mr-2"
                style={{ fontSize: "14px", color: "#6366f1" }}
              />
              Booking Summary
            </h3>
            <div style={gridStyle(170)}>
              <SummaryItem
                label="Booking Type"
                value={selectedBookingType?.title}
              />
              <SummaryItem label="Project" value={projectName} />
              <SummaryItem label="Floor" value={floorName} />
              <SummaryItem label="Unit" value={unitName} />
              <SummaryItem label="Customer" value={selectedCustomer?.name} />
              <SummaryItem
                label="Payment Plan Type"
                value={paymentSchedule?.paymentPlanType}
              />
              <SummaryItem
                label="Total Booking Amount"
                value={paymentSchedule ? formatAmount(totalBookingAmount) : ""}
              />
              {bookingType === "EXISTING" && (
                <>
                  <SummaryItem
                    label="Already Paid Amount"
                    value={
                      paymentSchedule && !paidAmountError
                        ? formatAmount(parsedPaidAmount)
                        : ""
                    }
                  />
                  <SummaryItem
                    label="Remaining Receivable"
                    value={
                      paymentSchedule && !paidAmountError
                        ? formatAmount(remainingAmount)
                        : ""
                    }
                  />
                </>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 items-center">
            {isSubmitDisabled && missingFields.length > 0 && (
              <span style={{ ...helperStyle, marginRight: "auto" }}>
                Required: {missingFields.join(", ")}
              </span>
            )}
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
              disabled={isSubmitDisabled}
              className="bg-lightBlue-500 text-white font-bold uppercase text-xs px-5 py-2 rounded shadow-sm hover:shadow-lg outline-none focus:outline-none ease-linear transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center"
            >
              <FaCalendarCheck className="mr-1" style={{ color: "white" }} />
              {isSubmitting ? "Creating Booking..." : "Add Booking"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
