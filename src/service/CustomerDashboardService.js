import httpService from "utility/httpService";

/**
 * Customer Dashboard API Service
 * All methods automatically use JWT token from localStorage
 * No customer ID needed - derived from authenticated user
 */
const customerDashboardService = {
  // ==================== DASHBOARD APIs ====================

  /**
   * Get customer summary with KPIs
   * @returns {Promise<CustomerSummary>}
   */
  getSummary: async () => {
    const response = await httpService.get("/customer/dashboard/summary");
    return response.data;
  },

  /**
   * Get monthly payment chart data
   * @returns {Promise<Array<PaymentChartData>>}
   */
  getPaymentChart: async () => {
    const response = await httpService.get("/customer/dashboard/payment-chart");
    return response.data;
  },

  /**
   * Get payment mode distribution
   * @returns {Promise<Array<PaymentModeDistribution>>}
   */
  getPaymentModes: async () => {
    const response = await httpService.get("/customer/dashboard/payment-modes");
    return response.data;
  },

  /**
   * Get recent payment transactions
   * @param {number} limit - Number of recent payments (default: 10)
   * @returns {Promise<Array<RecentPayment>>}
   */
  getRecentPayments: async (limit = 10) => {
    const response = await httpService.get(
      `/customer/dashboard/recent-payments?limit=${limit}`,
    );
    return response.data;
  },

  /**
   * Get all customer accounts with status (dashboard)
   * @returns {Promise<Array<AccountStatus>>}
   */
  getDashboardAccounts: async () => {
    const response = await httpService.get("/customer/dashboard/accounts");
    return response.data;
  },

  // ==================== ACCOUNTS APIs ====================

  /**
   * Get all customer accounts with pagination
   * @param {Object} params - Pagination params
   * @returns {Promise<PaginatedResponse>}
   */
  getAllAccounts: async (params = {}) => {
    const requestBody = {
      page: params.page || 0,
      size: params.size || 10,
      sortBy: params.sortBy || "createdDate",
      sortDir: params.sortDir || "desc",
      id: params.id || 0,
      filteredBy: params.filteredBy || "",
    };
    const response = await httpService.post(
      "/customer/accounts/getAll",
      requestBody,
    );
    return response.data;
  },

  /**
   * Get account by ID
   * @param {number} accountId - Account ID
   * @returns {Promise<Account>}
   */
  getAccountById: async (accountId) => {
    const response = await httpService.get(`/customer/accounts/${accountId}`);
    return response.data;
  },

  /**
   * Get account summary
   * @returns {Promise<AccountSummary>}
   */
  getAccountSummary: async () => {
    const response = await httpService.get("/customer/accounts/summary");
    return response.data;
  },

  /**
   * Get accounts by project
   * @param {number} projectId - Project ID
   * @param {Object} params - Pagination params
   * @returns {Promise<PaginatedResponse>}
   */
  getAccountsByProject: async (projectId, params = {}) => {
    const requestBody = {
      page: params.page || 0,
      size: params.size || 10,
      sortBy: params.sortBy || "createdDate",
      sortDir: params.sortDir || "desc",
      id: params.id || 0,
      filteredBy: params.filteredBy || "",
    };
    const response = await httpService.post(
      `/customer/accounts/getByProject/${projectId}`,
      requestBody,
    );
    return response.data;
  },

  // ==================== PAYMENTS APIs ====================

  /**
   * Get all customer payments with pagination
   * @param {Object} params - Pagination params
   * @returns {Promise<Array<Payment>>}
   */
  getAllPayments: async (params = {}) => {
    const requestBody = {
      page: params.page || 0,
      size: params.size || 10,
      sortBy: params.sortBy || "paidDate",
      sortDir: params.sortDir || "desc",
      id: params.id || 0,
      filteredBy: params.filteredBy || "",
    };
    const response = await httpService.post(
      "/customer/payments/getAll",
      requestBody,
    );
    return response.data;
  },

  /**
   * Get payments by account
   * @param {number} accountId - Account ID
   * @param {Object} params - Pagination params
   * @returns {Promise<Array<Payment>>}
   */
  getPaymentsByAccount: async (accountId, params = {}) => {
    const requestBody = {
      page: params.page || 0,
      size: params.size || 10,
      sortBy: params.sortBy || "paidDate",
      sortDir: params.sortDir || "desc",
      id: accountId,
      filteredBy: params.filteredBy || "",
    };
    const response = await httpService.post(
      `/customer/payments/getByAccount/${accountId}`,
      requestBody,
    );
    return response.data;
  },

  /**
   * Get payment by ID
   * @param {number} paymentId - Payment ID
   * @returns {Promise<Payment>}
   */
  getPaymentById: async (paymentId) => {
    const response = await httpService.get(`/customer/payments/${paymentId}`);
    return response.data;
  },

  /**
   * Get payments by status
   * @param {string} status - PAID, UNPAID, PENDING
   * @param {Object} params - Pagination params
   * @returns {Promise<Array<Payment>>}
   */
  getPaymentsByStatus: async (status, params = {}) => {
    const requestBody = {
      page: params.page || 0,
      size: params.size || 10,
      sortBy: params.sortBy || "paidDate",
      sortDir: params.sortDir || "desc",
      id: params.id || 0,
      filteredBy: params.filteredBy || "",
    };
    const response = await httpService.post(
      `/customer/payments/getByStatus/${status}`,
      requestBody,
    );
    return response.data;
  },

  /**
   * Get payments by date range
   * @param {string} startDate - Start date (YYYY-MM-DD)
   * @param {string} endDate - End date (YYYY-MM-DD)
   * @param {Object} params - Pagination params
   * @returns {Promise<Array<Payment>>}
   */
  getPaymentsByDateRange: async (startDate, endDate, params = {}) => {
    const requestBody = {
      page: params.page || 0,
      size: params.size || 10,
      sortBy: params.sortBy || "paidDate",
      sortDir: params.sortDir || "desc",
      id: params.id || 0,
      filteredBy: params.filteredBy || "",
    };
    const response = await httpService.post(
      `/customer/payments/getByDateRange?startDate=${startDate}&endDate=${endDate}`,
      requestBody,
    );
    return response.data;
  },

  /**
   * Get payment summary
   * @returns {Promise<PaymentSummary>}
   */
  getPaymentSummary: async () => {
    const response = await httpService.get("/customer/payments/summary");
    return response.data;
  },

  // ==================== LEDGER APIs ====================

  /**
   * Get complete customer ledger
   * @param {Object} params - Pagination params
   * @returns {Promise<Array<LedgerEntry>>}
   */
  getAllLedger: async (params = {}) => {
    const requestBody = {
      page: params.page || 0,
      size: params.size || 20,
      sortBy: params.sortBy || "createdDate",
      sortDir: params.sortDir || "desc",
      id: params.id || 0,
      filteredBy: params.filteredBy || "",
    };
    const response = await httpService.post(
      "/customer/ledger/getAll",
      requestBody,
    );
    return response.data;
  },

  /**
   * Get ledger by account
   * @param {number} accountId - Account ID
   * @param {Object} params - Pagination params
   * @returns {Promise<Array<LedgerEntry>>}
   */
  getLedgerByAccount: async (accountId, params = {}) => {
    const requestBody = {
      page: params.page || 0,
      size: params.size || 20,
      sortBy: params.sortBy || "createdDate",
      sortDir: params.sortDir || "desc",
      id: params.id || 0,
      filteredBy: params.filteredBy || "",
    };
    const response = await httpService.post(
      `/customer/ledger/getByAccount/${accountId}`,
      requestBody,
    );
    return response.data;
  },

  /**
   * Get ledger by payment type
   * @param {string} paymentType - CASH, BANK_TRANSFER, CHEQUE, ONLINE_PAYMENT
   * @param {Object} params - Pagination params
   * @returns {Promise<Array<LedgerEntry>>}
   */
  getLedgerByPaymentType: async (paymentType, params = {}) => {
    const requestBody = {
      page: params.page || 0,
      size: params.size || 20,
      sortBy: params.sortBy || "createdDate",
      sortDir: params.sortDir || "desc",
      id: params.id || 0,
      filteredBy: params.filteredBy || "",
    };
    const response = await httpService.post(
      `/customer/ledger/getByPaymentType/${paymentType}`,
      requestBody,
    );
    return response.data;
  },

  /**
   * Get ledger summary
   * @returns {Promise<LedgerSummary>}
   */
  getLedgerSummary: async () => {
    const response = await httpService.get("/customer/ledger/summary");
    return response.data;
  },
};

export default customerDashboardService;
