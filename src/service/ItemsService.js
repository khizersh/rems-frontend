import httpService from "../utility/httpService";

/**
 * Items & Units Management Service
 * Handles Items and Item Units CRUD operations
 */

// =====================
// Items APIs
// =====================

/**
 * Get paginated items for organization
 * @param {number|string} orgId - Organization ID
 * @param {Object} paginationParams - { page, size, sortBy, sortDir }
 * @returns {Promise<Object>} - Paginated items
 */
export const getAllItems = async (orgId, paginationParams = {}) => {
  const body = {
    page: paginationParams.page || 0,
    size: paginationParams.size || 20,
    sortBy: paginationParams.sortBy || "createdDate",
    sortDir: paginationParams.sortDir || "desc",
    ...paginationParams,
  };
  const response = await httpService.post(`/items/${orgId}/getAll`, body);
  return response.data;
};

/**
 * Get all items without pagination
 * @param {number|string} orgId - Organization ID
 * @returns {Promise<Array>} - List of all items
 */
export const getItemsList = async (orgId) => {
  const response = await httpService.get(`/items/${orgId}/list`);
  return response.data;
};

/**
 * Get item by ID
 * @param {number|string} itemId - Item ID
 * @returns {Promise<Object>} - Item details
 */
export const getItemById = async (itemId) => {
  const response = await httpService.get(`/items/getById/${itemId}`);
  return response.data;
};

/**
 * Create a new item
 * @param {Object} itemData - { name, code, description, organizationId }
 * @param {number|string} unitId - Unit ID
 * @returns {Promise<Object>} - Created item
 */
export const createItem = async (itemData, unitId) => {
  const response = await httpService.post(`/items/create?unitId=${unitId}`, itemData);
  return response.data;
};

/**
 * Update an existing item
 * @param {Object} itemData - { id, name, code, description, organizationId }
 * @param {number|string} unitId - Unit ID
 * @returns {Promise<Object>} - Updated item
 */
export const updateItem = async (itemData, unitId) => {
  const response = await httpService.post(`/items/update?unitId=${unitId}`, itemData);
  return response.data;
};

// =====================
// Item Units APIs
// =====================

/**
 * Get all units without pagination
 * @param {number|string} orgId - Organization ID
 * @returns {Promise<Array>} - List of all units
 */
export const getUnitsList = async (orgId) => {
  const response = await httpService.get(`/items/unit/${orgId}/list`);
  return response.data;
};

/**
 * Get paginated units for organization
 * @param {number|string} orgId - Organization ID
 * @param {Object} paginationParams - { page, size, sortBy, sortDir }
 * @returns {Promise<Object>} - Paginated units
 */
export const getAllUnits = async (orgId, paginationParams = {}) => {
  const body = {
    page: paginationParams.page || 0,
    size: paginationParams.size || 10,
    sortBy: paginationParams.sortBy || "createdDate",
    sortDir: paginationParams.sortDir || "desc",
    ...paginationParams,
  };
  const response = await httpService.post(`/items/unit/${orgId}/getAll`, body);
  return response.data;
};

/**
 * Create or update a unit
 * @param {Object} unitData - { id?, name, symbol, organizationId }
 * @returns {Promise<Object>} - Created/updated unit
 */
export const createOrUpdateUnit = async (unitData) => {
  const response = await httpService.post(`/items/unit/createOrUpdate`, unitData);
  return response.data;
};

// =====================
// Export all as default object
// =====================

const ItemsService = {
  // Items
  getAllItems,
  getItemsList,
  getItemById,
  createItem,
  updateItem,

  // Units
  getUnitsList,
  getAllUnits,
  createOrUpdateUnit,
};

export default ItemsService;
