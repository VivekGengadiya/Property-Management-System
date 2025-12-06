import { apiCall } from "../services/api";

export const apiFetch = (endpoint, options = {}) => {
  return apiCall(endpoint, options);
};
