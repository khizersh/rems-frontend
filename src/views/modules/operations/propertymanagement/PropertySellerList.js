import React, { useContext, useEffect, useState } from "react";
import { MainContext } from "context/MainContext";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";
import { FaUserTie, FaPlus, FaPen } from "react-icons/fa";
import * as PropertyApi from "service/PropertyManagementService";
import DynamicTableComponent from "../../../../components/table/DynamicTableComponent.js";
import "../../../../assets/styles/projects/project.css";

export default function PropertySellerList() {
  const { notifyError, setLoading } = useContext(MainContext);
  const history = useHistory();
  const [rows, setRows] = useState([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const organization = JSON.parse(localStorage.getItem("organization")) || {};

  const load = async () => {
    if (!organization.organizationId) return;
    setLoading(true);
    try {
      const res = await PropertyApi.getPropertySellersByOrg(organization.organizationId);
      setRows(Array.isArray(res.data) ? res.data : []);
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
    if (page >= Math.ceil(rows.length / pageSize)) {
      setPage(0);
    }
  }, [rows.length, page, pageSize]);

  const currentRows = rows.slice(page * pageSize, (page + 1) * pageSize);
  const totalElements = rows.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));

  const tableColumns = [
    { header: "Name", field: "name" },
    { header: "Phone", field: "phone" },
    { header: "Email", field: "email" },
  ];

  const actions = [
    {
      title: "Edit",
      icon: FaPen,
      onClick: (item) => history.push(`/dashboard/update-property-seller/${item.id}`),
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
      title="Property Sellers"
      firstButton={{
        title: "Add Seller",
        icon: FaPlus,
        onClick: () => history.push("/dashboard/add-property-seller"),
        className: "bg-emerald-500 hover:bg-emerald-600",
      }}
      actions={actions}
    />
  );
}
