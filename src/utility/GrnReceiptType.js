export const GRN_RECEIPT_TYPES = {
  STOCK: "STOCK",
  DIRECT: "DIRECT",
};

const LEGACY_RECEIPT_TYPE_MAP = {
  WAREHOUSE_STOCK: GRN_RECEIPT_TYPES.STOCK,
  DIRECT_CONSUME: GRN_RECEIPT_TYPES.DIRECT,
};

export const normalizeGrnReceiptType = (receiptType) => {
  if (!receiptType) return null;
  return LEGACY_RECEIPT_TYPE_MAP[receiptType] || receiptType;
};

export const getGrnReceiptTypeLabel = (receiptType) => {
  const normalized = normalizeGrnReceiptType(receiptType);
  if (normalized === GRN_RECEIPT_TYPES.STOCK) return "Stock to Warehouse";
  if (normalized === GRN_RECEIPT_TYPES.DIRECT) return "Direct to Project";
  return "N/A";
};

export const GRN_RECEIPT_TYPE_OPTIONS = [
  {
    id: GRN_RECEIPT_TYPES.STOCK,
    name: "Stock to Warehouse",
    shortName: "Stock",
    description: "Material is received into warehouse inventory.",
  },
  {
    id: GRN_RECEIPT_TYPES.DIRECT,
    name: "Direct to Project",
    shortName: "Direct",
    description: "Material is consumed by project without stock entry.",
  },
];
