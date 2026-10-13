import axios from "axios";

const apiClient = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Response Interceptor for Global Error Handling
apiClient.interceptors.response.use(
  (response) => {
    // Any status code within 2xx triggers this function
    return response;
  },
  (error) => {
    let errorMessage = "An unexpected error occurred";

    if (error.response) {
      // 1. The server responded with a status code out of 2xx range
      const status = error.response.status;
      const serverMessage = error.response.data?.error || error.response.data?.message;

      switch (status) {
        case 400:
          errorMessage = serverMessage || "Bad Request: Check sent payload data.";
          break;
        case 401:
          errorMessage = serverMessage || "Unauthorized: Please log in again.";
          // Optional: Trigger logout or redirect to login page
          break;
        case 403:
          errorMessage = serverMessage || "Forbidden: You don't have access.";
          break;
        case 404:
          errorMessage = serverMessage || "Resource not found.";
          break;
        case 500:
          errorMessage = serverMessage || "Internal Server Error: Try again later.";
          break;
        default:
          errorMessage = serverMessage || `Server Error (${status})`;
      }
    } else if (error.request) {
      // 2. The request was made but no response was received (Network / Timeout error)
      errorMessage = "Network error: Unable to connect to server. Check your internet connection.";
    } else {
      // 3. Something happened setting up the request
      errorMessage = error.message;
    }

    // Attach custom message to error object for easy consumption in components
    error.formattedMessage = errorMessage;

    // Log the error globally (e.g., Sentry, console)
    console.error(`[API Error]: ${errorMessage}`, error);

    return Promise.reject(error);
  }
);

export default apiClient;