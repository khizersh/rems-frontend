import React, { useEffect, useRef } from "react";
import Chart from "chart.js";

export default function CustomerPaymentModeChart({ data, title }) {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Destroy existing chart if present
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    const ctx = chartRef.current.getContext("2d");

    const labels = data.map((item) => item.paymentMode);
    const amounts = data.map((item) => item.totalAmount);

    const backgroundColors = [
      "rgba(59, 130, 246, 0.8)", // blue
      "rgba(16, 185, 129, 0.8)", // green
      "rgba(245, 158, 11, 0.8)", // yellow
      "rgba(139, 92, 246, 0.8)", // purple
      "rgba(239, 68, 68, 0.8)", // red
    ];

    const borderColors = [
      "rgba(59, 130, 246, 1)",
      "rgba(16, 185, 129, 1)",
      "rgba(245, 158, 11, 1)",
      "rgba(139, 92, 246, 1)",
      "rgba(239, 68, 68, 1)",
    ];

    const config = {
      type: "doughnut",
      data: {
        labels: labels,
        datasets: [
          {
            data: amounts,
            backgroundColor: backgroundColors.slice(0, data.length),
            borderColor: borderColors.slice(0, data.length),
            borderWidth: 2,
          },
        ],
      },
      options: {
        maintainAspectRatio: false,
        responsive: true,
        legend: {
          position: "right",
          labels: {
            fontColor: "#4a5568",
            padding: 15,
          },
        },
        tooltips: {
          callbacks: {
            label: function (tooltipItem, chartData) {
              const label = chartData.labels[tooltipItem.index] || "";
              const value = chartData.datasets[0].data[tooltipItem.index];
              const total = chartData.datasets[0].data.reduce((a, b) => a + b, 0);
              const percentage = ((value / total) * 100).toFixed(1);
              return `${label}: Rs. ${value.toLocaleString()} (${percentage}%)`;
            },
          },
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
              Payment Methods
            </h6>
            <h2 className="text-blueGray-700 text-xl font-semibold">
              {title || "Payment Distribution"}
            </h2>
          </div>
        </div>
      </div>
      <div className="p-4 flex-auto">
        <div className="relative" style={{ height: "300px" }}>
          {!data || data.length === 0 ? (
            <div className="flex items-center justify-center h-full text-blueGray-400">
              No payment mode data available
            </div>
          ) : (
            <canvas ref={chartRef}></canvas>
          )}
        </div>
      </div>
    </div>
  );
}
