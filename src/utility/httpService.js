const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "https://bapi.propertydhoondo.com/api";
  // process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");

  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Default response format
const defaultResponse = {
  responseCode: "UNKNOWN",
  responseMessage: "No response body received",
  data: null,
};

const handleResponse = async (response) => {
  let result;

  try {
    result = await response.json();
  } catch {
    result = { ...defaultResponse };
  }

  if (response.status === 403) {
    result = {
      responseCode: "403",
      responseMessage: "Permission Denied!",
      data: "You don’t have permission to access this resource.",
    };
  }

  if (result.responseCode !== "0000") {
    const error = new Error(result.responseMessage || "Something went wrong");
    error.code = result.responseCode;
    error.message = result.responseMessage;
    error.data = result.data;
    throw error;
  }

  return result;
};

const httpService = {
  BASE_URL,
  get: async (url, headers = {}) => {

    const response = await fetch(`${BASE_URL}${url}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...headers,
      },
    });
    return handleResponse(response);
  },

  post: async (url, data, headers = {}) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...headers,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  put: async (url, data, headers = {}) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...headers,
      },
      body: JSON.stringify(data),
    });
    return handleResponse(response);
  },

  delete: async (url, headers = {}) => {
    const response = await fetch(`${BASE_URL}${url}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
        ...headers,
      },
    });
    return handleResponse(response);
  },
};

export default httpService;
