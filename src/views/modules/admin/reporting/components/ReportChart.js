/* eslint-disable */
import React, { useEffect, useRef } from "react";
import Chart from "chart.js";
import { CHART_PALETTE, hint } from "../reportConfig";

/**
 * Renders a backend ChartData payload using Chart.js v2 (the version bundled in this app).
 * Supports: LINE, AREA, BAR, STACKED_BAR, PIE, DONUT.
 *
 * ChartData: { key, title, type, labels: string[], series: [{ name, data, colorHint }] }
 */
export default function ReportChart({ chart }) {
  const canvasRef = useRef(null);
  const instanceRef = useRef(null);

  useEffect(() => {
    if (!chart || !canvasRef.current) return;
    const labels = chart.labels || [];
    const series = chart.series || [];

    if (instanceRef.current) {
      instanceRef.current.destroy();
      instanceRef.current = null;
    }

    const ctx = canvasRef.current.getContext("2d");
    const type = chart.type || "BAR";
    const isPieLike = type === "PIE" || type === "DONUT";
    const isStacked = type === "STACKED_BAR";

    let chartType = "bar";
    if (type === "LINE" || type === "AREA") chartType = "line";
    else if (type === "PIE") chartType = "pie";
    else if (type === "DONUT") chartType = "doughnut";

    let datasets;
    if (isPieLike) {
      const first = series[0] || { data: [] };
      datasets = [
        {
          data: first.data || [],
          backgroundColor: labels.map(
            (_, i) => CHART_PALETTE[i % CHART_PALETTE.length],
          ),
          borderColor: "#ffffff",
          borderWidth: 2,
        },
      ];
    } else {
      datasets = series.map((s, i) => {
        const color = s.colorHint
          ? hint(s.colorHint).hex
          : CHART_PALETTE[i % CHART_PALETTE.length];
        const filled = type === "AREA";
        return {
          label: s.name,
          data: s.data || [],
          borderColor: color,
          backgroundColor:
            chartType === "line" ? (filled ? `${color}26` : color) : color,
          fill: chartType === "line" ? filled : true,
          tension: 0.4,
          borderWidth: 2,
          pointRadius: chartType === "line" ? 3 : 0,
          pointBackgroundColor: color,
          maxBarThickness: 42,
        };
      });
    }

    const baseOptions = {
      responsive: true,
      maintainAspectRatio: false,
      title: { display: false },
      tooltips: { mode: "index", intersect: false },
      hover: { mode: "nearest", intersect: true },
      legend: {
        display: isPieLike || series.length > 1,
        labels: { fontColor: "rgba(0,0,0,.5)", boxWidth: 12, padding: 14 },
        align: "center",
        position: "bottom",
      },
    };

    const scaleOptions = isPieLike
      ? {}
      : {
          scales: {
            xAxes: [
              {
                stacked: isStacked,
                gridLines: {
                  display: false,
                  color: "rgba(33, 37, 41, 0.1)",
                  borderDash: [2],
                },
                ticks: { fontColor: "rgba(0,0,0,.5)" },
              },
            ],
            yAxes: [
              {
                stacked: isStacked,
                ticks: {
                  beginAtZero: true,
                  fontColor: "rgba(0,0,0,.5)",
                  callback: (v) =>
                    typeof v === "number" ? v.toLocaleString() : v,
                },
                gridLines: {
                  color: "rgba(33, 37, 41, 0.12)",
                  borderDash: [2],
                  drawBorder: false,
                },
              },
            ],
          },
        };

    instanceRef.current = new Chart(ctx, {
      type: chartType,
      data: { labels, datasets },
      options: { ...baseOptions, ...scaleOptions },
    });

    return () => {
      if (instanceRef.current) {
        instanceRef.current.destroy();
        instanceRef.current = null;
      }
    };
  }, [chart]);

  if (!chart) return null;

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h2 className="text-blueGray-700 text-base font-semibold">
          {chart.title}
        </h2>
      </div>
      <div className="flex-auto">
        <div className="relative" style={{ height: "280px" }}>
          <canvas ref={canvasRef}></canvas>
        </div>
      </div>
    </div>
  );
}
