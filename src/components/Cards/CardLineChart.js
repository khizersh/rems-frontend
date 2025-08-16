import React, { useContext } from "react";
import Chart from "chart.js";
import { MainContext } from "context/MainContext";
import { MONTH_LABELS } from "utility/Utility";
import httpService from "utility/httpService";

export default function CardLineChart() {

  const { setLoading, notifyError } = useContext(MainContext);


  const fetchSumData = async () => {
    setLoading(true);
    try {

      const organization = JSON.parse(localStorage.getItem("organization")) || null;

      const response = await httpService.get(
        `/analytics/getBookingAmountSum/${organization.organizationId}`
      );

      const dataSet = prepareDataSet(response.data);

      prepareChartFullData(dataSet)

    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  }


  function prepareDataSet(apiData) {
    const currentYear = new Date().getFullYear();
    const lastYear = currentYear - 1;

    // Initialize arrays with 0 for each month
    const currentYearData = new Array(12).fill(0);
    const lastYearData = new Array(12).fill(0);

    // Fill current year data
    apiData.currentYear?.forEach(item => {
      const monthIndex = item.month - 1;
      currentYearData[monthIndex] = item.amount;
    });

    // Fill last year data
    apiData.lastYear?.forEach(item => {
      const monthIndex = item.month - 1;
      lastYearData[monthIndex] = item.amount;
    });

    // Return chart.js compatible structure
    return {
      labels: MONTH_LABELS,
      datasets: [
        {
          label: currentYear,
          backgroundColor: "#4c51bf",
          borderColor: "#4c51bf",
          data: currentYearData,
          fill: false,
          barThickness: 8,
        },
        {
          label: lastYear,
          backgroundColor: "#fff",
          borderColor: "#fff",
          data: lastYearData,
          fill: false,
          barThickness: 8,
        },
      ],
    };
  }

  function prepareChartFullData(dataset) {
    var config = {
      type: "line",
      data: dataset,
      options: {
        maintainAspectRatio: false,
        responsive: true,
        title: {
          display: false,
          text: "Sales Charts",
          fontColor: "white",
        },
        legend: {
          labels: {
            fontColor: "white",
          },
          align: "end",
          position: "bottom",
        },
        tooltips: {
          mode: "index",
          intersect: false,
        },
        hover: {
          mode: "nearest",
          intersect: true,
        },
        scales: {
          xAxes: [
            {
              ticks: {
                fontColor: "rgba(255,255,255,.7)",
              },
              display: true,
              scaleLabel: {
                display: false,
                labelString: "Month",
                fontColor: "white",
              },
              gridLines: {
                display: false,
                borderDash: [2],
                borderDashOffset: [2],
                color: "rgba(33, 37, 41, 0.3)",
                zeroLineColor: "rgba(0, 0, 0, 0)",
                zeroLineBorderDash: [2],
                zeroLineBorderDashOffset: [2],
              },
            },
          ],
          yAxes: [
            {
              ticks: {
                fontColor: "rgba(255,255,255,.7)",
              },
              display: true,
              scaleLabel: {
                display: false,
                labelString: "Value",
                fontColor: "white",
              },
              gridLines: {
                borderDash: [3],
                borderDashOffset: [3],
                drawBorder: false,
                color: "rgba(255, 255, 255, 0.15)",
                zeroLineColor: "rgba(33, 37, 41, 0)",
                zeroLineBorderDash: [2],
                zeroLineBorderDashOffset: [2],
              },
            },
          ],
        },
      },
    };
    var ctx = document.getElementById("line-chart").getContext("2d");
    window.myLine = new Chart(ctx, config);
  }

  React.useEffect(() => {
    fetchSumData()
  }, []);
  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words w-full mb-6 shadow-lg rounded-12 bg-blueGray-700">
        <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full max-w-full flex-grow flex-1">
              <h6 className="uppercase text-blueGray-100 mb-1 text-xs font-semibold">
                Overview
              </h6>
              <h2 className="text-white text-xl font-semibold">Sales value</h2>
            </div>
          </div>
        </div>
        <div className="p-4 flex-auto">
          {/* Chart */}
          <div className="relative h-350-px">
            <canvas id="line-chart"></canvas>
          </div>
        </div>
      </div>
    </>
  );
}
