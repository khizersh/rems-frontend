import React, { useEffect, useRef } from "react";
import Chart from "chart.js";
import { MONTH_LABELS } from "utility/Utility";

export default function BarChartDynamic({
  chartData = null,
  title = "Total Orders",
  subtitle = "Performance",
}) {
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  useEffect(() => {
    if (!chartData || !chartRef.current) return;

    // Destroy previous chart instance if it exists
    if (chartInstanceRef.current) {
      chartInstanceRef.current.destroy();
      chartInstanceRef.current = null;
    }

    const ctx = chartRef.current.getContext("2d");

    // Extract Y values and calculate buffered min/max
    const allYValues = chartData.datasets.flatMap((ds) => ds.data || []);
    const minY = Math.min(...allYValues);
    const maxY = Math.max(...allYValues);
    const buffer = 10;

    const bufferedMin = 0;
    const bufferedMax = maxY;

    chartInstanceRef.current = new Chart(ctx, {
      type: "bar",
      data: chartData,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        title: { display: false },
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
              gridLines: {
                color: "rgba(33, 37, 41, 0.3)",
                borderDash: [2],
              },
            },
          ],
          yAxes: [
            {
              display: true,
              ticks: {
                min: bufferedMin < 0 ? 0 : bufferedMin,
                max: bufferedMax,
              },
              gridLines: {
                color: "rgba(33, 37, 41, 0.2)",
                borderDash: [2],
                drawBorder: false,
              },
            },
          ],
        },
      },
    });

    // Cleanup when component unmounts
    return () => {
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
        chartInstanceRef.current = null;
      }
    };
  }, [chartData]);

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded-12">
      <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full max-w-full flex-grow flex-1">
            <h6 className="uppercase text-blueGray-400 mb-1 text-xs font-semibold">
              {subtitle}
            </h6>
            <h2 className="text-blueGray-700 text-xl font-semibold">
              {title}
            </h2>
          </div>
        </div>
      </div>
      <div className="p-4 flex-auto">
        <div className="relative" style={{ height: "350px" }}>
          <canvas ref={chartRef}></canvas>
        </div>
      </div>
    </div>
  );
}
