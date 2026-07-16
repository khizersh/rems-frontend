/* eslint-disable */
import React, { useState, useMemo } from "react";
import DynamicTableComponent from "../../../../../components/table/DynamicTableComponent";
import { formatValue } from "../reportConfig";

/**
 * Wraps the shared DynamicTableComponent for a backend TableData DTO.
 * Report endpoints return the full row set in one payload, so pagination is
 * handled client-side here (slicing) while still using the standard table UI.
 *
 * TableData: { key, title, columns: [{ key, label, type }], rows: [{...}] }
 */
export default function ReportTable({ table }) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const rows = table?.rows || [];
  const totalElements = rows.length;
  const totalPages = Math.ceil(totalElements / pageSize) || 0;

  const columns = useMemo(
    () =>
      (table?.columns || []).map((c) => ({
        header: c.label,
        field: c.key,
        render: (val) => formatValue(val, c.type),
      })),
    [table]
  );

  const pageData = useMemo(
    () => rows.slice(page * pageSize, page * pageSize + pageSize),
    [rows, page, pageSize]
  );

  if (!table) return null;

  return (
    <DynamicTableComponent
      title={table.title}
      data={pageData}
      columns={columns}
      actions={[]}
      loading={false}
      page={page}
      setPage={setPage}
      pageSize={pageSize}
      setPageSize={(size) => {
        setPageSize(size);
        setPage(0);
      }}
      totalPages={totalPages}
      totalElements={totalElements}
      fetchDataFunction={() => setPage(0)}
    />
  );
}
