import React, { useContext, useEffect, useState } from "react";
import { MainContext } from "context/MainContext";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { FaLandmark, FaPlus, FaEye } from "react-icons/fa";
import * as PropertyApi from "service/PropertyManagementService";
import DynamicTableComponent from "../../../../components/table/DynamicTableComponent.js";
import "../../../../assets/styles/projects/project.css";

export default function PropertyPurchaseList() {
  const { notifyError, setLoading } = useContext(MainContext);
  const history = useHistory();
  const organization = JSON.parse(localStorage.getItem("organization")) || {};
  const [purchases, setPurchases] = useState([]);
  const [sellerMap, setSellerMap] = useState({});
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const load = async () => {
    if (!organization.organizationId) return;
    setLoading(true);
    try {
      const [pRes, sRes] = await Promise.all([
        PropertyApi.getPropertyPurchasesByOrg(organization.organizationId),
        PropertyApi.getPropertySellersByOrg(organization.organizationId),
      ]);
      const plist = Array.isArray(pRes.data) ? pRes.data : [];
      setPurchases(plist);
      const smap = {};
      (Array.isArray(sRes.data) ? sRes.data : []).forEach((s) => {
        smap[s.id] = s.name;
      });
      setSellerMap(smap);
    } catch (e) {
      notifyError(e.message, e.data, 4000);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (page >= Math.ceil(purchases.length / pageSize)) {
      setPage(0);
    }
  }, [purchases.length, page, pageSize]);

  const currentRows = purchases.slice(page * pageSize, (page + 1) * pageSize);
  const totalElements = purchases.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));

  const tableColumns = [
    { header: "Seller", field: "propertySellerId", render: (value) => sellerMap[value] || `#${value}` },
    { header: "Total Amount", field: "totalAmount" },
    { header: "Paid Amount", field: "paidAmount" },
    { header: "Remaining", field: "remainingAmount" },
  ];

  const actions = [
    {
      title: "Details / Pay",
      icon: FaEye,
      onClick: (item) => history.push(`/dashboard/property-purchase-details/${item.id}`),
    },
  ];

  return (
    <DynamicTableComponent
      fetchDataFunction={load}
      setPage={setPage}
      page={page}
      data={currentRows}
      columns={tableColumns}
      pageSize={pageSize}
      setPageSize={setPageSize}
      totalPages={totalPages}
      totalElements={totalElements}
      loading={false}
      title="Property Purchases"
      firstButton={{
        title: "New Purchase",
        icon: FaPlus,
        onClick: () => history.push("/dashboard/add-property-purchase"),
        className: "bg-emerald-500 hover:bg-emerald-600",
      }}
      actions={actions}
    />
  );
}
