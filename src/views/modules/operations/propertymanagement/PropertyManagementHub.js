import React from "react";
import { Link } from "react-router-dom/cjs/react-router-dom.min";
import { FaHome, FaUserTie, FaFileInvoiceDollar, FaLandmark } from "react-icons/fa";
import "../../../../assets/styles/projects/project.css";

const cards = [
  {
    title: "Property Sellers",
    description: "Manage sellers (not vendors) for land/property acquisitions.",
    to: "/dashboard/property-sellers",
    icon: FaUserTie,
    color: "#0ea5e9",
  },
  {
    title: "Property Purchases",
    description: "Record purchases; creates payable + inventory journal & property asset.",
    to: "/dashboard/property-purchases",
    icon: FaFileInvoiceDollar,
    color: "#10b981",
  },
  {
    title: "New Purchase",
    description: "Create a purchase from a seller.",
    to: "/dashboard/add-property-purchase",
    icon: FaLandmark,
    color: "#8b5cf6",
  },
];

export default function PropertyManagementHub() {
  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6">
      <div className="mb-6 py-2 flex items-center gap-3">
        <FaHome className="text-xl text-blueGray-600" />
        <div>
          <h6 className="text-blueGray-700 text-lg font-bold uppercase">
            Property Management
          </h6>
          <p className="text-xs text-blueGray-500 mt-1">
            Sellers → Purchases → Partial payments → Property asset for projects.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap -mx-2">
        {cards.map((c) => (
          <div key={c.to} className="w-full md:w-6/12 xl:w-4/12 px-2 mb-4">
            <Link
              to={c.to}
              className="block bg-white rounded-xl shadow-lg border border-gray-200 p-6 h-full hover:shadow-xl transition-shadow"
            >
              <div className="flex items-start gap-4">
                <span
                  className="flex items-center justify-center w-12 h-12 rounded-lg shrink-0"
                  style={{ backgroundColor: `${c.color}18`, color: c.color }}
                >
                  <c.icon className="text-xl" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-gray-800">{c.title}</h3>
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">{c.description}</p>
                  <span className="inline-block mt-3 text-xs font-semibold text-blue-600">
                    Open →
                  </span>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
