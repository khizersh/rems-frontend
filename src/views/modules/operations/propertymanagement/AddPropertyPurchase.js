import React, { useContext, useEffect, useState } from "react";
import { MainContext } from "context/MainContext";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { IoArrowBackOutline } from "react-icons/io5";
import { FaLandmark, FaMoneyBillWave, FaUserTie } from "react-icons/fa";
import * as PropertyApi from "service/PropertyManagementService";
import "../../../../assets/styles/projects/project.css";

export default function AddPropertyPurchase() {
  const { notifySuccess, notifyError, setLoading } = useContext(MainContext);
  const history = useHistory();
  const organization = JSON.parse(localStorage.getItem("organization")) || {};

  const [sellers, setSellers] = useState([]);
  const [form, setForm] = useState({
    propertySellerId: "",
    totalAmount: "",
    remarks: "",
    referenceNo: "",
  });

  useEffect(() => {
    const loadSellers = async () => {
      if (!organization.organizationId) return;
      try {
        const res = await PropertyApi.getPropertySellersByOrg(organization.organizationId);
        setSellers(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        notifyError(e.message, e.data, 4000);
      }
    };
    loadSellers();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        organizationId: Number(organization.organizationId),
        propertySellerId: Number(form.propertySellerId),
        totalAmount: Number(form.totalAmount),
        remarks: form.remarks || undefined,
        referenceNo: form.referenceNo || undefined,
      };
      const res = await PropertyApi.addPropertyPurchase(payload);
      notifySuccess("Purchase recorded. Journal & property asset created.", 4500);
      const bundle = res.data;
      if (bundle?.propertyPurchase?.id) {
        history.push(`/dashboard/property-purchase-details/${bundle.propertyPurchase.id}`);
      } else {
        history.push("/dashboard/property-purchases");
      }
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
          <FaLandmark className="mr-2" style={{ color: "#10b981" }} />
          New Property Purchase
        </h6>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-200">
        <div className="p-6">
          <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
            <h3 className="text-sm font-bold text-gray-700 mb-4 flex items-center gap-2 border-b border-gray-200 pb-2">
              <FaUserTie className="text-emerald-500" style={{ fontSize: "14px" }} />
              Purchase Details
            </h3>
            <div className="flex flex-wrap">
              <div className="w-full lg:w-6/12 px-2 mb-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">Property Seller *</label>
                <select
                  name="propertySellerId"
                  value={form.propertySellerId}
                  onChange={handleChange}
                  required
                  className="w-full p-2 border rounded-lg text-sm bg-white"
                >
                  <option value="">Select seller</option>
                  {sellers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="w-full lg:w-6/12 px-2 mb-3">
                <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
                  <FaMoneyBillWave className="text-slate-400" /> Total Amount *
                </label>
                <input
                  name="totalAmount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.totalAmount}
                  onChange={handleChange}
                  required
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300"
                />
              </div>
              <div className="w-full lg:w-6/12 px-2 mb-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">Reference No</label>
                <input
                  name="referenceNo"
                  value={form.referenceNo}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300"
                />
              </div>
              <div className="w-full px-2 mb-3">
                <label className="block text-xs font-medium text-slate-700 mb-1">Remarks</label>
                <textarea
                  name="remarks"
                  value={form.remarks}
                  onChange={handleChange}
                  rows={2}
                  className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-100 focus:border-emerald-300"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 px-2 pb-4">
            <button type="button" onClick={() => history.goBack()} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-xs font-semibold text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg">
              Save Purchase
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
