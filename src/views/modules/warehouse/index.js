/**
 * Warehouse Management Module
 * 
 * This module provides comprehensive warehouse and inventory management features:
 * 
 * Components:
 * - WarehouseList: View, filter, and manage all warehouses
 * - AddWarehouse: Create or edit a warehouse
 * - StockOverview: Dashboard showing inventory levels per warehouse
 * - StockTransfer: Transfer stock between warehouses
 * - StockAdjustment: Manually increase or decrease stock
 * - StockLedger: View complete transaction history/audit trail
 * - MaterialIssue: Issue material from warehouse to projects
 * 
 * Service:
 * - WarehouseService: API service for all warehouse operations
 * 
 * Routes (to be added to your router):
 * - /dashboard/warehouse/list - Warehouse list
 * - /dashboard/warehouse/add - Add warehouse
 * - /dashboard/warehouse/edit/:id - Edit warehouse
 * - /dashboard/warehouse/stock-overview - Stock dashboard
 * - /dashboard/warehouse/stock-transfer - Transfer stock
 * - /dashboard/warehouse/stock-adjustment - Adjust stock
 * - /dashboard/warehouse/stock-ledger - Ledger view
 * - /dashboard/warehouse/material-issue - Issue material
 */

export { default as WarehouseList } from './WarehouseList';
export { default as AddWarehouse } from './AddWarehouse';
export { default as StockOverview } from './StockOverview';
export { default as StockTransfer } from './StockTransfer';
export { default as StockAdjustment } from './StockAdjustment';
export { default as StockLedger } from './StockLedger';
export { default as MaterialIssue } from './MaterialIssue';
