import React, { useEffect, useState, useContext } from "react";
import httpService from "../../utility/httpService.js";
import { MainContext } from "context/MainContext.js";
import DynamicTableComponentDateRange from "../../components/table/DynamicTableComponentDateRange.js";
import {
  useHistory,
  useParams,
} from "react-router-dom/cjs/react-router-dom.min.js";
import { FaEye, FaPen, FaTrashAlt } from "react-icons/fa";
import Card from "./Card.js";
import CardBarChart from "components/Cards/CardBarChart.js";
import BarChartDynamic from "components/CustomerComponents/BarChartDynamic.js";
import { TENURE_LIST } from "utility/Utility.js";
import { getFormattedDateNDaysAgo } from "utility/Utility.js";
import LineChartDynamic from "components/CustomerComponents/LineChartDynamic.js";

export default function RevenueAnalytics() {
  const { loading, setLoading, notifyError } = useContext(MainContext);
  const history = useHistory();

  const [salesChart, setSalesChart] = useState(null);
  const [accountBalance, setAccountBalance] = useState(null);
  const [payables, setPayables] = useState(null);
  const [selectTransactionType, setSelectTransactionType] = useState("CREDIT");
  const [accounts, setAccounts] = useState([]);
  const [expenseDetail, setExpenseDetail] = useState(null);
  const [accountFileteredId, setAccountFileteredId] = useState("");
  const [expenseTenure, setExpenseTenure] = useState(7);
  const [dateRange, setDateRange] = useState([null, null]);
  const [dateRangeSales, setDateRangeSales] = useState([null, null]);

  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [accountDetailRequest, setAccountDetailRequest] = useState({
    organizationId: 1,
    startDate: null,
    endDate: null,
    transactionType: "CREDIT",
    page: 0,
    size: 10,
    sortBy: "created_date",
    sortDir: "desc",
  });

  const [saleChartRequest, setSaleChartRequest] = useState({
    organizationId: 1,
    startDate: null,
    endDate: null,
  });
  const [accountDetailList, setAccountDetailList] = useState({
    sum: 0,
    pageData: [],
  });
  const pageSize = 10;
  const [startDate, endDate] = dateRange;
  const [startDateSales, endDateSales] = dateRangeSales;

  const changeTransactionType = (type) => {
    setSelectTransactionType(type);
    setAccountDetailRequest({
      ...accountDetailRequest,
      transactionType: type,
    });
  };
  const handleDateRangeChange = (update) => {
    setDateRange(update);
    if (update[0] != null && update[1] != null) {
      let startingDate = update[0]?.toLocaleDateString().split("/");
      startingDate =
        startingDate[1] + "-" + startingDate[0] + "-" + startingDate[2];
      let endingDate = update[1]?.toLocaleDateString().split("/");
      endingDate = endingDate[1] + "-" + endingDate[0] + "-" + endingDate[2];

      setAccountDetailRequest({
        ...accountDetailRequest,
        startDate: startingDate,
        endDate: endingDate,
      });
    }
  };
  const handleDateRangeChangeSales = (update) => {
    setDateRangeSales(update);
    if (update[0] != null && update[1] != null) {
      let startingDate = update[0]?.toLocaleDateString().split("/");
      startingDate =
        startingDate[1] + "-" + startingDate[0] + "-" + startingDate[2];
      let endingDate = update[1]?.toLocaleDateString().split("/");
      endingDate = endingDate[1] + "-" + endingDate[0] + "-" + endingDate[2];

      
      setSaleChartRequest({
        ...saleChartRequest,
        startDate: startingDate,
        endDate: endingDate,
      });
    }
  };

  useEffect(() => {
    fetchAccounts();
    fetchPayables();
  }, []);

  useEffect(() => {
    fetchAccountSum(accountFileteredId);
  }, [accountFileteredId]);

  useEffect(() => {
    fetchExpenseDetail(expenseTenure);
  }, [expenseTenure]);

  useEffect(() => {
    fetchOrgAccountDetails();
  }, [accountDetailRequest]);

  useEffect(() => {
    fetchSalesData();
  }, [saleChartRequest]);

  const fetchAccounts = async () => {
    try {
      const sidebarData =
        JSON.parse(localStorage.getItem("organization")) || null;
      if (sidebarData) {
        const response = await httpService.get(
          `/organizationAccount/getAccountByOrgId/${sidebarData.organizationId}`
        );
        setAccounts(response.data || []);
      }
    } catch (err) {
      notifyError("Failed to load accounts", 4000);
    }
  };

  const fetchAccountSum = async (accountId) => {
    try {
      let filterBy = accountId ? "account" : "organization";
      let request = {
        id: 1,
        id2: accountId,
        filteredBy: filterBy,
      };

      const organization =
        JSON.parse(localStorage.getItem("organization")) || null;
      if (organization) {
        request.id = organization.organizationId;
      }
      const response = await httpService.post(
        `/revenue-analytics/getOrgAccount`,
        request
      );
      setAccountBalance(response.data);
    } catch (err) {
      notifyError("Failed to load projects", 4000);
    }
  };

  const fetchExpenseDetail = async (tenure) => {
    try {
      let request = {
        orgId: 0,
        tenure: tenure,
      };

      const organization =
        JSON.parse(localStorage.getItem("organization")) || null;
      if (organization) {
        request.orgId = organization.organizationId;
      }
      const response = await httpService.post(
        `/revenue-analytics/getExpenseDetailByTenure`,
        request
      );
      setExpenseDetail(response.data);
    } catch (err) {
      notifyError("Failed to expense detail", 4000);
    }
  };

  const fetchPayables = async () => {
    try {
      const organization =
        JSON.parse(localStorage.getItem("organization")) || null;
      if (organization) {
        const response = await httpService.get(
          `/revenue-analytics/getAnalyticsByORgId/${organization.organizationId}`
        );
        setPayables(response.data);
      }
    } catch (err) {
      notifyError("Failed to load projects", 4000);
    }
  };

  const fetchOrgAccountDetails = async () => {
    try {
      const organization =
        JSON.parse(localStorage.getItem("organization")) || null;
      if (organization) {
        accountDetailRequest.organizationId = organization.organizationId;

        if (!accountDetailRequest.startDate || !accountDetailRequest.endDate) {
          accountDetailRequest.startDate = getFormattedDateNDaysAgo(0);
          accountDetailRequest.endDate = getFormattedDateNDaysAgo(7);
        }

        const response = await httpService.post(
          `/revenue-analytics/getOrgAcctDetailByDateRange`,
          accountDetailRequest
        );
        let data = {
          sum: response.data.sum,
          pageData: response.data?.pageData?.content,
        };

        setTotalElements(response.data.pageData?.totalElements);
        setTotalPages(response.data.pageData?.totalPages);
        setAccountDetailList(data);
      }
    } catch (err) {
      notifyError("Failed to load projects", 4000);
    }
  };

  const changeSelectedAccount = (accountId) => {
    if (accountId) {
      setAccountFileteredId(accountId);
    } else {
      setAccountFileteredId("");
    }
  };

  const changeExpenseTenure = (tenure) => {
    setExpenseTenure(tenure);
  };

  const tableColumns = [
    { header: "Amount", field: "amount" },
    { header: "Project", field: "projectName" },
    {
      header: "Type",
      field: "transactionType",
      render: (value) => {
        const baseClass = "font-semibold uppercase";
        if (value === "CREDIT")
          return (
            <span>
              <i className="fas fa-arrow-up text-emerald-500 mr-1"></i>
              {value}
            </span>
          );
        if (value === "DEBIT")
          return (
            <span>
              <i className="fas fa-arrow-down text-red-500 mr-1"></i>
              {value}
            </span>
          );
        else
          return (
            <span>
              <i className="fas fa-arrow-up text-emerald-500 mr-4"></i>
              <i className="fas fa-arrow-down text-red-500 mr-4"></i>
              {value}
            </span>
          );
      },
    },
    { header: "Date", field: "createdDate" },
  ];

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const organization =
        JSON.parse(localStorage.getItem("organization")) || {};

      saleChartRequest.organizationId = organization.organizationId;
      if (!saleChartRequest.startDate || !saleChartRequest.endDate) {
        saleChartRequest.startDate = getFormattedDateNDaysAgo(60);
        saleChartRequest.endDate = getFormattedDateNDaysAgo(0);
      }

      console.log("saleChartRequest :: ",saleChartRequest);
      

      const response = await httpService.post(
        `/revenue-analytics/getOrgSalesByDate`,
        saleChartRequest
      );
      const data = prepareSalesChartData(response.data, "#4c51bf", "Sales");
      setSalesChart(data);
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

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

    const sortedData = [...rawData].sort((a, b) => {
      return a.year === b.year ? a.month - b.month : a.year - b.year;
    });

    const labels = sortedData.map(
      ({ month, year }) => `${MONTH_LABELS[month - 1]} ${year}`
    );
    const data = sortedData.map(({ amount }) => amount || 0);

    return {
      labels,
      datasets: [
        {
          label,
          data,
          fill: true,
          borderColor: color,
          backgroundColor: `${color}20`,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: color,
        },
      ],
    };
  }

  const setPage = (pageNo) => {
    setAccountDetailRequest({ ...accountDetailRequest, page: pageNo });
  };
  return (
    <>
      <div className="container mx-auto p-4 mt-12">
        <div className="w-full mb-6 ">
          <div className="flex flex-wrap">
            <div className="w-full">
              <div className="flex flex-wrap justify-between">
                <div className="w-47 md:w-47 sm:w-100 bg-white shadow-lg m-2 p-4 rounded-12">
                  <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                    Account Balance
                  </h5>
                  <div className="flex flex-wrap justify-between">
                    <div
                      style={{ paddingTop: "3%" }}
                      className="text-green-600"
                    >
                      <i
                        className={
                          "text-white p-3 text-center inline-flex items-center justify-center w-8 h-8 shadow-lg rounded-full bg-red-500 fas fa-dollar-sign"
                        }
                      ></i>
                      <p className="d-inline ml-2">{accountBalance}</p>
                    </div>
                    <div className="w-30P w-50P">
                      <select
                        value={accountFileteredId}
                        onChange={(e) => changeSelectedAccount(e.target.value)}
                        className=" rounded px-3 mt-1 w-full"
                        style={{ border: "none" }}
                      >
                        <option value="">All Account</option>
                        {accounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="w-47 md:w-47 sm:w-100 bg-white shadow-lg m-2 p-4 rounded-12">
                  <h5 className="text-blueGray-400 uppercase font-bold text-xs">
                    <i
                      className={
                        "text-white p-3 mr-1 text-center inline-flex items-center justify-center w-4 h-4 shadow-lg rounded-full bg-red-500 fas fa-dollar-sign"
                      }
                    ></i>
                    Expense Detail
                  </h5>
                  <div className="flex flex-wrap justify-between">
                    <div
                      style={{ paddingTop: "1%" }}
                      className="text-green-600"
                    >
                      <p className="text-blueGray-400 uppercase font-bold text-xs">
                        Total Expense:{" "}
                        <text className="text-green-600">
                          {expenseDetail?.totalAmount}
                        </text>{" "}
                      </p>
                      <p className="text-blueGray-400 uppercase font-bold text-xs">
                        Paid Amount:{" "}
                        <text className="text-green-600">
                          {expenseDetail?.amountPaid}
                        </text>{" "}
                      </p>
                      <p className="text-blueGray-400 uppercase font-bold text-xs">
                        Credit Amount:{" "}
                        <text className="text-green-600">
                          {expenseDetail?.creditAmount}
                        </text>{" "}
                      </p>
                      {/* <i className={"text-white p-3 text-center inline-flex items-center justify-center w-8 h-8 shadow-lg rounded-full bg-red-500 fas fa-dollar-sign"}></i>
                                            <p className="d-inline ml-2">{accountBalance}</p> */}
                    </div>
                    <div className="w-30P w-50P">
                      <select
                        value={expenseTenure}
                        onChange={(e) => changeExpenseTenure(e.target.value)}
                        className=" rounded px-3 mt-1 w-full"
                        style={{ border: "none" }}
                      >
                        {TENURE_LIST.map((tenure) => (
                          <option key={tenure.value} value={tenure.value}>
                            {tenure.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap justify-between">
                <div className="w-47 md:w-47 m-2 sm:w-100">
                  <Card
                    props={{
                      statSubtitle: "Total Payables",
                      statTitle: payables?.totalPayableAmount,
                      statIconName: "far fa-chart-bar",
                      statIconColor: "bg-red-500",
                    }}
                  />
                </div>
                <div className="w-47 md:w-47 m-2 sm:w-100">
                  <Card
                    props={{
                      statSubtitle: "Total Receivables",
                      statTitle: payables?.totalReceivableAmount,
                      statIconName: "far fa-chart-bar",
                      statIconColor: "bg-red-500",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto p-4">
        <div className="flex flex-wrap">
          <div className="w-full">
            <LineChartDynamic
              chartData={salesChart}
              title="Sales"
              subtitle="Monthly Summary"
              onChangeDate={handleDateRangeChangeSales}
              startDate={startDateSales}
              endDate={endDateSales}
            />
          </div>
        </div>
      </div>
      <div className="container mx-auto p-4">
        <div className="flex flex-wrap">
          <div className="w-full">
            <DynamicTableComponentDateRange
              fetchDataFunction={fetchOrgAccountDetails}
              setPage={setPage}
              page={accountDetailRequest.page}
              data={accountDetailList.pageData}
              columns={tableColumns}
              pageSize={pageSize}
              totalPages={totalPages}
              totalElements={totalElements}
              loading={loading}
              title="Account Detail"
              actions={[]}
              onChangeDate={handleDateRangeChange}
              startDate={startDate}
              endDate={endDate}
              changeTransactionType={changeTransactionType}
              selectTransactionType={selectTransactionType}
            />
          </div>
        </div>
      </div>
    </>
  );
}
