import httpService from "../utility/httpService";

/**
 * Property Management API (backend: /api/property/)
 */

export const addPropertySeller = (payload) =>
  httpService.post("/property/seller/add", payload);

export const updatePropertySeller = (payload) =>
  httpService.post("/property/seller/update", payload);

export const getPropertySellerById = (id) =>
  httpService.get(`/property/seller/${id}`);

export const getPropertySellersByOrg = (organizationId) =>
  httpService.get(`/property/seller/by-org/${organizationId}`);

export const addPropertyPurchase = (payload) =>
  httpService.post("/property/purchase/add", payload);

export const getPropertyPurchaseById = (id) =>
  httpService.get(`/property/purchase/${id}`);

export const getPropertyPurchasesByOrg = (organizationId) =>
  httpService.get(`/property/purchase/by-org/${organizationId}`);

export const addPropertyPayment = (payload) =>
  httpService.post("/property/payment/add", payload);

export const getPropertyPaymentsByPurchase = (purchaseId) =>
  httpService.get(`/property/payment/by-purchase/${purchaseId}`);

export const getPropertyAssetById = (id) =>
  httpService.get(`/property/asset/${id}`);
