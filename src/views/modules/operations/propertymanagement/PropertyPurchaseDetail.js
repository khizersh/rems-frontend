import React, { useContext, useEffect, useMemo, useState } from "react";
import { MainContext } from "context/MainContext";
import { useHistory, useParams } from "react-router-dom/cjs/react-router-dom.min";
import { IoArrowBackOutline } from "react-icons/io5";
import {
  FaLandmark,
  FaMoneyBillWave,
  FaCreditCard,
  FaReceipt,
  FaCalendarAlt,
  FaClipboardList,
  FaUser,
  FaInfoCircle,
  FaPercentage,
} from "react-icons/fa";
import httpService from "utility/httpService";
import * as PropertyApi from "service/PropertyManagementService";
import { paymentTypes } from "utility/Utility";
import DynamicTableComponent from "../../../../components/table/DynamicTableComponent.js";
import "../../../../assets/styles/projects/project.css";

const PAY_TYPES = paymentTypes.filter((p) => p.id !== "CREDIT");

function formatIsoDate(val) {
  if (!val) return "—";
  const s = String(val);
  return s.includes("T") ? s.split("T")[0] : s.slice(0, 10);
}

function paymentTypeLabel(code) {
  if (!code) return "—";
  const hit = paymentTypes.find((p) => p.id === code || p.id === String(code));
  return hit?.name || code;
}

export default function PropertyPurchaseDetail() {
  const { purchaseId } = useParams();
  const history = useHistory();
  const { notifySuccess, notifyError, setLoading } = useContext(MainContext);
  const organization = JSON.parse(localStorage.getItem("organization")) || {};

  const [purchase, setPurchase] = useState(null);
  const [payments, setPayments] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [sellerName, setSellerName] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [payForm, setPayForm] = useState({
    organizationAccountId: "",
    amount: "",
    paymentType: "CASH",
    paymentDocNo: "",
    paymentDocDate: "",
    comments: "",
  });

  const loadAll = async () => {
    if (!purchaseId || !organization.organizationId) return;
    setLoading(true);
    try {
      const [pRes, payRes] = await Promise.all([
        PropertyApi.getPropertyPurchaseById(purchaseId),
        PropertyApi.getPropertyPaymentsByPurchase(purchaseId),
      ]);
      const p = pRes.data;
      setPurchase(p);
      setPayments(Array.isArray(payRes.data) ? payRes.data : []);

      if (p?.propertySellerId) {
        try {
          const sRes = await PropertyApi.getPropertySellerById(p.propertySellerId);
          if (sRes.data?.name) setSellerName(sRes.data.name);
        } catch {
          setSellerName(`#${p.propertySellerId}`);
        }
      }

      const accRes = await httpService.get(`/organizationAccount/getAccountByOrgId/${organization.organizationId}`);
      setAccounts(Array.isArray(accRes.data) ? accRes.data : []);
    } catch (e) {
      notifyError(e.message, e.data, 4000);
      history.push("/dashboard/property-purchases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, [purchaseId]);

  useEffect(() => {
    const tp = Math.max(1, Math.ceil(payments.length / pageSize));
    if (page >= tp) setPage(0);
  }, [payments.length, page, pageSize]);

  const handlePayChange = (e) => {
    const { name, value } = e.target;
    setPayForm((prev) => ({ ...prev, [name]: value }));
  };

  const submitPayment = async (e) => {
    e.preventDefault();
    if (!purchase) return;
    setLoading(true);
    try {
      const payload = {
        organizationId: Number(organization.organizationId),
        propertyPurchaseId: Number(purchaseId),
        organizationAccountId: Number(payForm.organizationAccountId),
        amount: Number(payForm.amount),
        paymentType: payForm.paymentType,
        paymentDocNo: payForm.paymentDocNo || undefined,
        paymentDocDate: payForm.paymentDocDate || undefined,
        comments: payForm.comments || undefined,
      };
      await PropertyApi.addPropertyPayment(payload);
      notifySuccess("Payment recorded.", 3500);
      setPayForm({
        organizationAccountId: "",
        amount: "",
        paymentType: "CASH",
        paymentDocNo: "",
        paymentDocDate: "",
        comments: "",
      });
      await loadAll();
    } catch (err) {
      notifyError(err.message, err.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  const paymentRows = useMemo(
    () => payments.slice(page * pageSize, (page + 1) * pageSize),
    [payments, page, pageSize],
  );

  const totalElements = payments.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));

  const paymentColumns = useMemo(
    () => [
      { header: "Payment ID", field: "id" },
      { header: "Amount", field: "amount" },
      {
        header: "Account",
        field: "organizationAccountId",
        render: (_, item) =>
          accounts.find((a) => Number(a.id) === Number(item.organizationAccountId))?.name ||
          `#${item.organizationAccountId}`,
      },
      {
        header: "Payment type",
        field: "paymentType",
        render: (_, item) => paymentTypeLabel(item.paymentType),
      },
      { header: "Doc no", field: "paymentDocNo" },
      {
        header: "Doc date",
        field: "paymentDocDate",
        render: (_, item) =>
          item.paymentDocDate != null && item.paymentDocDate !== ""
            ? formatIsoDate(item.paymentDocDate)
            : formatIsoDate(item.createdDate),
      },
      { header: "Comments", field: "comments" },
    ],
    [accounts],
  );

  if (!purchase) {
    return (
      <div className="text-sm text-gray-500 py-10 text-center">
        Loading purchase…
      </div>
    );
  }

  const total = Number(purchase.totalAmount) || 0;
  const paid = Number(purchase.paidAmount) || 0;
  const pct = total > 0 ? Math.min(100, Math.round((paid / total) * 100)) : 0;

  return (
    <div className="relative flex flex-col min-w-0 break-words w-full mb-6">
      <div className="rounded-xl border border-emerald-100 bg-gradient-to-br from-emerald-50/90 via-white to-violet-50/80 shadow-sm px-5 py-5 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
          <div>
            <h6 className="text-blueGray-800 text-lg font-bold uppercase flex items-center flex-wrap gap-2">
              <button type="button" onClick={() => history.goBack()} className="mr-1">
                <IoArrowBackOutline className="text-xl text-blueGray-500 hover:text-blueGray-700" />
              </button>
              <FaLandmark className="text-emerald-600" />
              <span>Purchase #{purchase.id}</span>
            </h6>
            <p className="text-sm text-blueGray-600 mt-2 ml-0 sm:ml-8 flex items-center gap-2">
              <FaUser className="text-blueGray-400 shrink-0" />
              <span>
                Seller: <span className="font-semibold text-blueGray-800">{sellerName || `#${purchase.propertySellerId}`}</span>
              </span>
            </p>
            {(purchase.referenceNo || purchase.remarks) && (
              <div className="mt-3 ml-0 sm:ml-8 flex flex-wrap gap-2">
                {purchase.referenceNo && (
                  <span className="inline-flex items-center rounded-full bg-white/80 border border-gray-200 px-3 py-1 text-xs font-medium text-blueGray-700">
                    Ref: {purchase.referenceNo}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5">
          <div className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
            <FaMoneyBillWave className="text-emerald-500" /> Balances
          </div>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between gap-2">
              <span className="text-gray-600">Total</span>
              <span className="font-bold text-gray-800 tabular-nums">{total.toLocaleString()}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-gray-600">Paid</span>
              <span className="font-semibold text-emerald-700 tabular-nums">{paid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between border-t border-gray-100 pt-3 gap-2">
              <span className="text-gray-600">Remaining</span>
              <span className="font-bold text-amber-700 tabular-nums">{Number(purchase.remainingAmount).toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5">
          <div className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
            <FaInfoCircle className="text-sky-500" /> Purchase details
          </div>
          <dl className="space-y-2 text-sm text-blueGray-700">
            <div className="flex justify-between gap-2">
              <dt className="text-gray-500">Reference</dt>
              <dd className="font-medium text-right">{purchase.referenceNo || "—"}</dd>
            </div>
            <div className="flex justify-between gap-2 items-start">
              <dt className="text-gray-500 shrink-0">Remarks</dt>
              <dd className="text-right text-gray-800 max-w-[65%]">{purchase.remarks || "—"}</dd>
            </div>
            <div className="flex justify-between gap-2 border-t border-gray-100 pt-2">
              <dt className="text-gray-500">Created</dt>
              <dd className="tabular-nums text-right">{formatIsoDate(purchase.createdDate)}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-gray-500">Last updated</dt>
              <dd className="tabular-nums text-right">{formatIsoDate(purchase.updatedDate)}</dd>
            </div>
          </dl>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5">
          <div className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-2">
            <FaPercentage className="text-violet-500" /> Settlement
          </div>
          <p className="text-sm text-blueGray-700 mb-3">
            <span className="font-semibold text-blueGray-900">{pct}%</span>
            <span className="text-gray-500"> of total recorded as paid</span>
          </p>
          <div className="h-2.5 w-full rounded-full bg-gray-100 overflow-hidden mb-2">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="text-xs text-gray-500">
            Outstanding balance drives the maximum amount you can post in the form below.
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-5 mb-6">
        <div className="text-xs font-bold text-gray-500 uppercase mb-4 flex items-center gap-2">
          <FaCreditCard className="text-violet-500" /> Record payment to seller
        </div>
        <form onSubmit={submitPayment} className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-12 gap-4 items-end">
          <div className="sm:col-span-2 xl:col-span-4">
            <label className="block text-xs font-medium text-gray-700 mb-1">Bank / Cash account *</label>
            <select
              name="organizationAccountId"
              value={payForm.organizationAccountId}
              onChange={handlePayChange}
              required
              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none"
            >
              <option value="">Select account</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
          <div className="xl:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Amount *</label>
            <input
              name="amount"
              type="number"
              min="0.01"
              step="0.01"
              max={purchase.remainingAmount}
              value={payForm.amount}
              onChange={handlePayChange}
              required
              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none"
            />
          </div>
          <div className="xl:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1">Payment type *</label>
            <select
              name="paymentType"
              value={payForm.paymentType}
              onChange={handlePayChange}
              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm bg-white focus:ring-2 focus:ring-violet-200 focus:border-violet-400 outline-none"
            >
              {PAY_TYPES.map((pt) => (
                <option key={pt.id} value={pt.id}>
                  {pt.name}
                </option>
              ))}
            </select>
          </div>
          <div className="xl:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FaReceipt className="text-gray-400" /> Doc no
            </label>
            <input
              name="paymentDocNo"
              value={payForm.paymentDocNo}
              onChange={handlePayChange}
              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-200 outline-none"
            />
          </div>
          <div className="xl:col-span-2">
            <label className="block text-xs font-medium text-gray-700 mb-1 flex items-center gap-1">
              <FaCalendarAlt className="text-gray-400" /> Doc date
            </label>
            <input
              name="paymentDocDate"
              type="date"
              value={payForm.paymentDocDate}
              onChange={handlePayChange}
              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-200 outline-none"
            />
          </div>
          <div className="sm:col-span-2 xl:col-span-8">
            <label className="block text-xs font-medium text-gray-700 mb-1">Comments</label>
            <input
              name="comments"
              value={payForm.comments}
              onChange={handlePayChange}
              className="w-full p-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-violet-200 outline-none"
            />
          </div>
          <div className="sm:col-span-2 xl:col-span-4 xl:flex xl:justify-end pb-0.5">
            <button
              type="submit"
              className="w-full xl:w-auto px-5 py-2.5 text-xs font-bold text-white bg-violet-500 hover:bg-violet-600 rounded-lg shadow-sm transition-colors"
            >
              Post payment
            </button>
          </div>
        </form>
      </div>

      <DynamicTableComponent
        fetchDataFunction={loadAll}
        setPage={setPage}
        page={page}
        data={paymentRows}
        columns={paymentColumns}
        pageSize={pageSize}
        setPageSize={setPageSize}
        totalPages={totalPages}
        totalElements={totalElements}
        loading={false}
        title={
          <span className="inline-flex items-center gap-2">
            <FaClipboardList className="text-blueGray-500" />
            Payment history
          </span>
        }
        actions={[]}
      />
    </div>
  );
}
