import React, { useEffect, useRef } from "react";
import Chart from "chart.js";

export default function CustomerPaymentChart({ data, title }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Destroy existing chart if present
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");

    const labels = data.map((item) => `${item.monthName} ${item.year}`);
    const paidAmounts = data.map((item) => item.totalPaidAmount);
    const dueAmounts = data.map((item) => item.totalDueAmount);

    const config = {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: "Amount Paid",
            backgroundColor: "#10b981",
            borderColor: "#10b981",
            data: paidAmounts,
            barThickness: 12,
          },
          {
            label: "Amount Due",
            backgroundColor: "#f59e0b",
            borderColor: "#f59e0b",
            data: dueAmounts,
            barThickness: 12,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        title: {
          display: false,
        },
        legend: {
          labels: {
            fontColor: "#4a5568",
          },
          align: "end",
          position: "top",
        },
        tooltips: {
          mode: "index",
          intersect: false,
          callbacks: {
            label: function (tooltipItem, data) {
              const label = data.datasets[tooltipItem.datasetIndex].label || "";
              const value = tooltipItem.yLabel.toLocaleString();
              return `${label}: Rs. ${value}`;
            },
          },
        },
        hover: {
          mode: "nearest",
          intersect: true,
        },
        scales: {
          xAxes: [
            {
              ticks: {
                fontColor: "#4a5568",
              },
              display: true,
              gridLines: {
                display: false,
              },
            },
          ],
          yAxes: [
            {
              ticks: {
                fontColor: "#4a5568",
                callback: function (value) {
                  return "Rs. " + value.toLocaleString();
                },
              },
              display: true,
              gridLines: {
                borderDash: [3],
                borderDashOffset: [3],
                drawBorder: false,
                color: "rgba(0, 0, 0, 0.1)",
              },
            },
          ],
        },
      },
    };

    chartInstance.current = new Chart(ctx, config);

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [data]);

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-12">
      <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full max-w-full flex-grow flex-1">
            <h6 className="uppercase text-blueGray-400 mb-1 text-xs font-semibold">
              Payment Trends
            </h6>
            <h2 className="text-blueGray-700 text-xl font-semibold">
              {title || "Monthly Payments"}
            </h2>
          </div>
        </div>
      </div>
      <div className="p-4 flex-auto">
        <div className="relative" style={{ height: "300px" }}>
          {!data || data.length === 0 ? (
            <div className="flex items-center justify-center h-full text-blueGray-400">
              No payment data available
            </div>
          ) : (
            <canvas ref={chartRef}></canvas>
          )}
        </div>
      </div>
    </div>
  );
}
