import React, { useContext, useEffect } from "react";
import Chart from "chart.js";
import { MONTH_LABELS } from "utility/Utility";
import httpService from "utility/httpService";
import { MainContext } from "context/MainContext";

export default function CardBarChart() {

  const { setLoading, notifyError } = useContext(MainContext);


  const fetchCountData = async () => {
    setLoading(true);
    try {

      const organization = JSON.parse(localStorage.getItem("organization")) || null;

      const response = await httpService.get(
        `/analytics/getBookingCount/${organization.organizationId}`
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
      currentYearData[monthIndex] = item.count;
    });

    // Fill last year data
    apiData.lastYear?.forEach(item => {
      const monthIndex = item.month - 1;
      lastYearData[monthIndex] = item.count;
    });

    // Return chart.js compatible structure
    return {
      labels: MONTH_LABELS,
      datasets: [
        {
          label: currentYear,
          backgroundColor: "#ed64a6",
          borderColor: "#ed64a6",
          data: currentYearData,
          fill: false,
          barThickness: 8,
        },
        {
          label: lastYear,
          backgroundColor: "#4c51bf",
          borderColor: "#4c51bf",
          data: lastYearData,
          fill: false,
          barThickness: 8,
        },
      ],
    };
  }

  function prepareChartFullData(dataset) {
    let config = {
      type: "bar",
      data: dataset,
      options: {
        maintainAspectRatio: false,
        responsive: true,
        title: {
          display: false,
          text: "Orders Chart",
        },
        tooltips: {
          mode: "index",
          intersect: false,
        },
        hover: {
          mode: "nearest",
          intersect: true,
        },
        legend: {
          labels: {
            fontColor: "rgba(0,0,0,.4)",
          },
          align: "end",
          position: "bottom",
        },
        scales: {
          xAxes: [
            {
              display: false,
              scaleLabel: {
                display: true,
                labelString: "Month",
              },
              gridLines: {
                borderDash: [2],
                borderDashOffset: [2],
                color: "rgba(33, 37, 41, 0.3)",
                zeroLineColor: "rgba(33, 37, 41, 0.3)",
                zeroLineBorderDash: [2],
                zeroLineBorderDashOffset: [2],
              },
            },
          ],
          yAxes: [
            {
              display: true,
              scaleLabel: {
                display: false,
                labelString: "Value",
              },
              gridLines: {
                borderDash: [2],
                drawBorder: false,
                borderDashOffset: [2],
                color: "rgba(33, 37, 41, 0.2)",
                zeroLineColor: "rgba(33, 37, 41, 0.15)",
                zeroLineBorderDash: [2],
                zeroLineBorderDashOffset: [2],
              },
            },
          ],
        },
      },
    };
    let ctx = document.getElementById("bar-chart").getContext("2d");
    window.myBar = new Chart(ctx, config);
  }

  useEffect(() => {
    fetchCountData()
  }, []);


  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-12">
        <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
          <div className="flex flex-wrap items-center">
            <div className="relative w-full max-w-full flex-grow flex-1">
              <h6 className="uppercase text-blueGray-400 mb-1 text-xs font-semibold">
                Performance
              </h6>
              <h2 className="text-blueGray-700 text-xl font-semibold">
                Total orders
              </h2>
            </div>
          </div>
        </div>
        <div className="p-4 flex-auto">
          {/* Chart */}
          <div className="relative h-350-px">
            <canvas id="bar-chart"></canvas>
          </div>
        </div>
      </div>
    </>
  );
}
