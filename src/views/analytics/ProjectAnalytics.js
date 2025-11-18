import React, { useEffect, useState, useContext } from "react";
import httpService from "../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponent from "../../components/table/DynamicTableComponent.js";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min.js";
import { FaEye, FaPen, FaTrashAlt } from "react-icons/fa";
import Card from "./Card.js";
import CardBarChart from "components/Cards/CardBarChart.js";
import BarChartDynamic from "components/CustomerComponents/BarChartDynamic.js";

export default function ProjectAnalytics() {
  const { loading, setLoading, notifyError } = useContext(MainContext);
  const history = useHistory();

  const { projectId } = useParams();
  const [bookingList, setBookingList] = useState([]);
  const [projects, setProjects] = useState([]);
  const [projectDetail, setProjectDetail] = useState(null);
  const [fileteredId, setFileteredId] = useState("");
  const [filteredBy, setFilteredBy] = useState("organization");
  const [page, setPage] = useState(0);
  const [unitCount, setUnitCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [salesChart, setSalesChart] = useState(null);
  const [recievedamountChart, setRecievedamountChart] = useState(null);
  const [clientCountChart, setClientCountChart] = useState(null);
  const [expenseChart, setExpenseChart] = useState(null);
  const pageSize = 10;

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    fetchBookingList();
  }, []);

  useEffect(() => {
    let id = fileteredId || projectId || 0;
    if (id != 0) {
      fetchAnalytics(id);
      fetchSalesData(id);
      fetchReceivedAmountData(id);
      fetchClientCountData(id);
      fetchExpenseData(id);
    }
  }, [fileteredId]);

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

  const fetchAnalytics = async (projectId) => {
    try {
      const response = await httpService.get(
        `/project-analytics/get/${projectId}`
      );

      let unitCount = response.data?.project?.floorList?.reduce(
        (sum, floor) => sum + (floor.unitList?.length || 0),
        0
      );

      setUnitCount(unitCount);

      setProjectDetail(response.data);
    } catch (err) {
      notifyError("Failed to load projects", 4000);
    }
  };

  const fetchBookingList = async () => {
    setLoading(true);
    try {
      const requestBody = {
        id: fileteredId,
        filteredBy: filteredBy,
        page,
        size: pageSize,
        sortBy: "id",
        sortDir: "desc",
      };

      if (!fileteredId) {
        let organizationLocal = JSON.parse(
          localStorage.getItem("organization")
        );
        if (organizationLocal) {
          requestBody.id = organizationLocal.organizationId;
        }
        requestBody.filteredBy = "organization";
      }

      const response = await httpService.post(`/booking/getByIds`, requestBody);

      setBookingList(response?.data?.content || []);
      setTotalPages(response?.data?.totalPages || 0);
      setTotalElements(response?.data?.totalElements || 0);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const fetchSalesData = async (projectid) => {
    setLoading(true);
    try {
      const response = await httpService.get(
        `/project-analytics/getProjectSales/${projectid}`
      );
      let data = prepareSalesChartData(response.data, "#4c51bf", "Sales");
      setSalesChart(data);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const fetchReceivedAmountData = async (projectid) => {
    setLoading(true);
    try {
      const response = await httpService.get(
        `/project-analytics/getProjectReceivedAmount/${projectid}`
      );
      let data = prepareSalesChartData(
        response.data,
        "#13ba82",
        "Received amount"
      );
      setRecievedamountChart(data);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const fetchClientCountData = async (projectid) => {
    setLoading(true);
    try {
      const response = await httpService.get(
        `/project-analytics/getProjectClientCount/${projectid}`
      );
      let data = prepareSalesChartData(
        response.data,
        "#0ea5e9",
        "Clients Count"
      );
      setClientCountChart(data);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenseData = async (projectid) => {
    setLoading(true);
    try {
      const response = await httpService.get(
        `/project-analytics/getProjectExpense/${projectid}`
      );
      let purchased = prepareSalesChartData(
        response.data.purchase,
        "#4c51bf",
        "Purchased Amount"
      );
      let paid = prepareSalesChartData(
        response.data.paid,
        "#13ba82",
        "Paid Amount"
      );
      let credit = prepareSalesChartData(
        response.data.credit,
        "#ef4444",
        "Credit Amount"
      );
      paid.datasets.push(purchased.datasets[0]);
      paid.datasets.push(credit.datasets[0]);

      setExpenseChart(paid);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const changeSelectedProjected = (projectId) => {
    if (projectId) {
      setFileteredId(projectId);
    } else {
      setFileteredId("");
    }
  };

  const tableColumns = [
    { header: "Customer Name", field: "customerName" },
    { header: "Unit Serial", field: "unitSerial" },
    { header: "Project", field: "project" },
    { header: "Floor No", field: "floorNo" },
    { header: "Total Amount", field: "totalAmount" },
    { header: "Created By", field: "createdBy" },
    { header: "Updated By", field: "updatedBy" },
    { header: "Created Date", field: "createdDate" },
    { header: "Updated Date", field: "updatedDate" },
  ];

  const hanldeCustomerAccount = (customer) => {
    if (!customer) {
      return notifyError("Invalid Customer!", 4000);
    }
    history.push(`/dashboard/customer-account/?cId=${customer.customerId}`);
  };

  const handleEdit = (floor) => {
    console.log("Edit Floor:", floor);
  };

  const handleDelete = (floor) => {
    console.log("Delete Floor:", floor);
  };

  const actions = [
    {
      icon: FaEye,
      onClick: hanldeCustomerAccount,
      title: "Customer Account",
      className: "text-green-600",
    },
    { icon: FaPen, onClick: handleEdit, title: "Edit", className: "yellow" },
    {
      icon: FaTrashAlt,
      onClick: handleDelete,
      title: "Delete",
      className: "text-red-600",
    },
  ];

  function prepareSalesChartData(rawData, color = "#4c51bf", label) {
    const MONTH_LABELS = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];

    // Step 1: Map month => amount
    const monthMap = {};
    rawData.forEach(({ month, amount }) => {
      monthMap[month] = amount;
    });

    // Step 2: Determine min & max months
    const months = rawData.map((item) => item.month);
    const minMonth = Math.min(...months);
    const maxMonth = Math.max(...months);

    // Step 3: Fill labels and data from min to max month
    const labels = [];
    const data = [];

    for (let m = minMonth; m <= maxMonth; m++) {
      labels.push(MONTH_LABELS[m - 1]); // 0-based index
      data.push(monthMap[m] || 0);
    }

    // Step 4: Return Chart.js compatible object
    return {
      labels,
      datasets: [
        {
          label: label,
          backgroundColor: color,
          data,
          barThickness: 8,
        },
      ],
    };
  }

  return (
    <>
      <div className="container mx-auto p-4 sm:mt-10">
        <div className="w-full mb-6 ">
          <div className="flex flex-wrap">
            <div className="lg:w-8/12 md:w-full">
              <div className="flex flex-wrap justify-between">
                <div className="w-47 md:w-47 md:w-50 sm:w-100 bg-white  rounded-12 shadow-lg  m-2 p-3">
                  <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                    Select Project
                  </h5>
                  <select
                    value={fileteredId}
                    onChange={(e) => changeSelectedProjected(e.target.value)}
                    className=" rounded px-3 py-2 w-full"
                    style={{ border: "none" }}
                  >
                    <option value="">All Projects</option>
                    {projects.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="w-47 md:w-47 md:w-50 sm:w-100 m-2">
                  <Card
                    props={{
                      statSubtitle: "Total Amount",
                      statTitle: projectDetail?.project?.totalAmount,
                      statIconName: "far fa-chart-bar",
                      statIconColor: "bg-red-500",
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-wrap justify-between">
                <div className="w-47 md:w-47 md:w-50 sm:w-100 m-2">
                  <Card
                    props={{
                      statSubtitle: "Received Amount",
                      statTitle: projectDetail?.totalReceivedAmount,
                      statIconName: "far fa-chart-bar",
                      statIconColor: "bg-red-500",
                    }}
                  />
                </div>
                <div className="w-47 md:w-47 md:w-50 sm:w-100 m-2">
                  <Card
                    props={{
                      statSubtitle: "Profit",
                      statTitle: projectDetail?.totalProfit,
                      statIconName: "far fa-chart-bar",
                      statIconColor: "bg-red-500",
                    }}
                  />
                </div>
              </div>
            </div>
            <div className="lg:w-4/12 md:w-full">
              <div className="w-100 ml-2 mt-2 shadow-lg bg-white py-5 pl-6 rounded-12 text-sm">
                <p className="">
                  <span className="font-semibold pr-2">Project Title:</span>{" "}
                  {projectDetail?.project?.name}
                </p>
                <p className="">
                  <span className="font-semibold pr-2">Purchasing Amount:</span>{" "}
                  {projectDetail?.project?.purchasingAmount}
                </p>
                <p className="">
                  <span className="font-semibold pr-2">
                    Construction Amount:
                  </span>{" "}
                  {projectDetail?.project?.constructionAmount}
                </p>
                <p className="">
                  <span className="font-semibold pr-2">Additonal Amount:</span>{" "}
                  {projectDetail?.project?.additionalAmount}
                </p>
                <p className="">
                  <span className="font-semibold pr-2">
                    Duration In Months:
                  </span>{" "}
                  {projectDetail?.project?.monthDuration}
                </p>
                <p className="">
                  <span className="font-semibold pr-2">Floors:</span>{" "}
                  {projectDetail?.project?.floors}
                </p>
                <p className="">
                  <span className="font-semibold pr-2">Total Units: </span> 
                  {unitCount}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="flex flex-wrap">
          <div className="lg:w-4/12 md:w-6 sm:w-12 px-2">
            <BarChartDynamic
              chartData={salesChart}
              title="Sales"
              subtitle="Monthly Summary"
            />
          </div>
          <div className="lg:w-4/12 md:w-6 sm:w-12 px-2">
            <BarChartDynamic
              chartData={recievedamountChart}
              title="Recieved Amount"
              subtitle="Monthly Summary"
            />
          </div>
          <div className="lg:w-4/12 md:w-6 sm:w-12 px-2">
            <BarChartDynamic
              chartData={clientCountChart}
              title="Client Count"
              subtitle="Monthly Summary"
            />
          </div>
          <div className="w-full px-2">
            <BarChartDynamic
              chartData={expenseChart}
              title="Expense"
              subtitle="Monthly Summary"
            />
          </div>
          {/* <div className="lg:w-4/12">
                        <DynamicTableComponent
                            fetchDataFunction={fetchBookingList}
                            setPage={setPage}
                            page={page}
                            data={bookingList}
                            columns={tableColumns}
                            pageSize={pageSize}
                            totalPages={totalPages}
                            totalElements={totalElements}
                            loading={loading}
                            title="Booking List"
                            actions={actions}
                        />
                    </div> */}
        </div>
      </div>
    </>
  );
}
