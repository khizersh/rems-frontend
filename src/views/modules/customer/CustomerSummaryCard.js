import React from "react";
import PropTypes from "prop-types";

export default function CustomerSummaryCard({
  title,
  value,
  iconName,
  iconColor,
  isLoading,
}) {
  return (
    <div className="relative flex flex-col min-w-0 break-words bg-white mb-6 shadow-lg rounded-12">
      <div className="flex-auto p-4">
        <div className="flex flex-wrap">
          <div className="relative w-full pr-4 max-w-full flex-grow flex-1">
            <h5 className="text-blueGray-400 uppercase font-bold text-xs">
              {title}
            </h5>
            <span className="font-semibold text-xl text-blueGray-700">
              {isLoading ? (
                <span className="animate-pulse">Loading...</span>
              ) : (
                value
              )}
            </span>
          </div>
          <div className="relative w-auto pl-4 flex-initial">
            <div
              className={
                "text-white p-3 text-center inline-flex items-center justify-center w-12 h-12 shadow-lg rounded-full " +
                iconColor
              }
            >
              <i className={iconName}></i>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

CustomerSummaryCard.defaultProps = {
  title: "Title",
  value: "0",
  iconName: "fas fa-chart-bar",
  iconColor: "bg-lightBlue-500",
  isLoading: false,
};

CustomerSummaryCard.propTypes = {
  title: PropTypes.string,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  iconName: PropTypes.string,
  iconColor: PropTypes.string,
  isLoading: PropTypes.bool,
};
