/* eslint-disable */
import React from "react";
import { hint, hintIcon, formatValue } from "../reportConfig";

const BACKEND_ICON_CLASSES = {
  FaUsers: "fas fa-users",
  FaUserClock: "fas fa-user-clock",
  FaUserCheck: "fas fa-user-check",
  FaUserPlus: "fas fa-user-plus",
  FaUserMinus: "fas fa-user-minus",
  FaBuilding: "fas fa-building",
  FaMoneyCheckDollar: "fas fa-money-bill-wave",
  FaMoneyBillWave: "fas fa-money-bill-wave",
  FaCoins: "fas fa-coins",
  FaCalendarCheck: "fas fa-calendar-check",
  FaClock: "fas fa-clock",
  FaBriefcase: "fas fa-briefcase",
};

/**
 * A single KPI tile. Mirrors the backend KpiCard DTO:
 * { key, label, value, formattedValue, changePercent, trend, colorHint, icon, type }
 */
export default function ReportKpiCard({ card }) {
  if (!card) return null;

  const theme = hint(card.colorHint);
  const display =
    card.formattedValue != null && card.formattedValue !== ""
      ? card.formattedValue
      : formatValue(card.value, card.type);

  const hasChange =
    card.changePercent !== null && card.changePercent !== undefined;
  const isUp = card.trend === "UP";
  const isDown = card.trend === "DOWN";
  const changeColor = isUp
    ? "text-emerald-600"
    : isDown
    ? "text-red-600"
    : "text-blueGray-500";
  const changeIcon = isUp
    ? "fas fa-arrow-up"
    : isDown
    ? "fas fa-arrow-down"
    : "fas fa-minus";

  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white rounded-12 shadow-lg h-full">
      <div className="flex-auto p-4">
        <div className="flex flex-wrap items-center">
          <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
            <h5 className="text-blueGray-400 uppercase font-bold text-xs">
              {card.label}
            </h5>
            <span className="font-semibold text-xl text-blueGray-700">
              {display}
            </span>
          </div>
          <div className="relative w-auto pl-4 flex-initial">
            <div
              className={
                "text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full " +
                theme.solid
              }
            >
              <i
                className={
                  card.iconClass ||
                  BACKEND_ICON_CLASSES[card.icon] ||
                  hintIcon(card.colorHint)
                }
              ></i>
            </div>
          </div>
        </div>

        {hasChange && (
          <p className="text-sm text-blueGray-400 mt-3 mb-0">
            <span className={`${changeColor} mr-2`}>
              <i className={`${changeIcon} mr-1`}></i>
              {Math.abs(card.changePercent).toFixed(1)}%
            </span>
            <span className="whitespace-nowrap">vs previous period</span>
          </p>
        )}
      </div>
    </div>
  );
}
