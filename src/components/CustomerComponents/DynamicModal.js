import React, { useState } from "react";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import "../../assets/styles/custom/custom.css";
import { RxCross2 } from "react-icons/rx";

const RenderObject = ({ data, level = 0 }) => {
  const [openKeys, setOpenKeys] = useState({});

  const toggleKey = (key) => {
    setOpenKeys((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div>
      {Object.entries(data).map(([key, value]) => (
        <div key={`${key}-${level}`} className="mb-1">
          {(typeof value === "object" && value !== null) ? (
            <div className="ml-3 mb-2">
              <button
                onClick={() => toggleKey(key)}
                className="flex items-center text-sm font-semibold focus:outline-none"
              >
                {key}
                {openKeys[key] ? (
                  <FaChevronDown className="ml-1 mt-1" />
                ) : (
                  <FaChevronRight className="ml-1 mt-1" />
                )}
              </button>
              {openKeys[key] && (
                <div className="pl-4 border-l border-gray-300 ml-2 mt-1">
                  {Array.isArray(value) ? (
                    value.map((item, index) => (
                      <div key={`${key}-${index}`} className="mb-1">
                        <button
                          onClick={() => toggleKey(`${key}-${index}`)}
                          className="flex items-center text-sm font-medium focus:outline-none"
                        >
                          S# {index + 1}
                          {openKeys[`${key}-${index}`] ? (
                            <FaChevronDown className="ml-1 mt-1" />
                          ) : (
                            <FaChevronRight className="ml-1 mt-1" />
                          )}
                        </button>
                        {openKeys[`${key}-${index}`] && (
                          <div className="pl-4 border-l border-gray-200 ml-2 mt-1">
                            {typeof item === "object" && item !== null ? (
                              <RenderObject data={item} level={level + 1} />
                            ) : (
                              <div className="pl-3 text-sm">{String(item)}</div>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  ) : (
                    <RenderObject data={value} level={level + 1} />
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="pl-3 flex text-sm">
              <span className="font-medium mr-1 capitalize">{key}:</span>
              <span>{String(value)}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};


const DynamicDetailsModal = ({ isOpen, onClose, data, title = "Details" }) => {
  if (!isOpen) return null;

  return (
    <>
      <div className="rounded fixed-left-13p inset-0 z-50 mx-auto  modal-width modal-height">
        <div className="bg-white rounded shadow-lg w-full p-4">
          <div className="flex justify-between items-center border-b pb-2 mb-4">
            <h2 className="text-lg font-bold">{title}</h2>
            <button
              onClick={onClose}
              className="text-red-500   outline-none focus:outline-none ease-linear transition-all duration-150"
            >
              <RxCross2 className="w-5 h-5" />
            </button>
          </div>

          {/* Sections grid */}
          <div className="flex flex-wrap -mx-2">
            {Object.entries(data).map(([sectionKey, sectionValue]) => (
              <div key={sectionKey} className="w-full lg:w-6/12 px-2 mb-4">
                <div className="border rounded  h-full ">
                  <h3 className="p-4 text-md font-semibold mb-2 border-b pb-1  bg-gray-50">
                    {sectionKey}
                  </h3>
                  <RenderObject data={sectionValue} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 text-right">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DynamicDetailsModal;
