import React, { useContext, useEffect, useState } from "react";
import { MainContext } from "context/MainContext";
import { useHistory, useParams } from "react-router-dom/cjs/react-router-dom.min";
import { IoArrowBackOutline } from "react-icons/io5";
import { FaUserTie, FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";
import * as PropertyApi from "service/PropertyManagementService";
import "../../../../assets/styles/projects/project.css";

export default function UpdatePropertySeller() {
  const { notifySuccess, notifyError, setLoading } = useContext(MainContext);
  const history = useHistory();
  const { sellerId } = useParams();
  const organization = JSON.parse(localStorage.getItem("organization")) || {};

  const [form, setForm] = useState({
    id: "",
    name: "",
    phone: "",
    email: "",
    address: "",
    organizationId: "",
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await PropertyApi.getPropertySellerById(sellerId);
        const s = res.data;
        if (!s) throw new Error("Seller not found");
        setForm({
          id: s.id,
          name: s.name || "",
          phone: s.phone || "",
          email: s.email || "",
          address: s.address || "",
          organizationId: s.organizationId,
        });
      } catch (e) {
        notifyError(e.message, e.data, 4000);
        history.push("/dashboard/property-sellers");
      } finally {
        setLoading(false);
      }
    };
    if (sellerId) load();
  }, [sellerId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        id: Number(form.id),
        organizationId: Number(organization.organizationId || form.organizationId),
      };
      await PropertyApi.updatePropertySeller(payload);
      notifySuccess("Seller updated.", 3500);
      history.push("/dashboard/property-sellers");
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6">
      <div className="mb-4 py-4">
        <h6 className="text-blueGray-700 text-lg font-bold uppercase flex items-center">
          <button onClick={() => history.goBack()} className="mr-3">
            <IoArrowBackOutline className="text-xl" style={{ color: "#64748b" }} />
          </button>
          <FaUserTie className="mr-2" style={{ color: "#0ea5e9" }} />
          Update Property Seller
        </h6>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
              <FaUserTie className="text-sky-500" style={{ fontSize: "14px" }} />
              Seller Details
            </h3>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-6/12 px-2 mb-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-300"
                />
              </div>
              <div className="w-full lg:w-6/12 px-2 mb-3">
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <FaPhone className="text-slate-400" /> Phone
                </label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-300"
                />
              </div>
              <div className="w-full lg:w-6/12 px-2 mb-3">
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <FaEnvelope className="text-slate-400" /> Email
                </label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-300"
                />
              </div>
              <div className="w-full px-2 mb-3">
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <FaMapMarkerAlt className="text-slate-400" /> Address
                </label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-100 focus:border-sky-300"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 px-2 pb-4">
            <button type="button" onClick={() => history.goBack()} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-indigo-500 hover:bg-indigo-600 rounded-lg">
              Update Seller
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
