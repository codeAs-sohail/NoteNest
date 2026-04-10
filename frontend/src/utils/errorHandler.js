/**
 * safely parses Django REST Framework error responses
 * and returns a readable string for the frontend UI.
 */
export const parseBackendError = (error) => {
  // If we couldn't even reach the backend (network error)
  if (!error.response) {
    return "Network error: Unable to connect to servers.";
  }

  const data = error.response.data;

  // Sometimes Django returns an HTML string for 500 errors
  if (typeof data === 'string') {
    if (data.includes('<html')) return "A server error occurred. Please try again later.";
    return data;
  }

  // If it's a structural object
  if (typeof data === 'object' && data !== null) {
    // If we have a direct general "error" key (our custom views often do this)
    if (data.error) {
      if (typeof data.error === 'string') return data.error;
      if (Array.isArray(data.error)) return data.error[0];
    }

    // Check for common DRF fallback keys
    if (data.detail) return data.detail;
    if (data.non_field_errors) return data.non_field_errors[0];

    // If it's field-level validation errors (e.g. { username: ["User already exists."] })
    const keys = Object.keys(data);
    if (keys.length > 0) {
      const firstKey = keys[0];
      const firstError = data[firstKey];
      
      let message = Array.isArray(firstError) ? firstError[0] : firstError;
      
      // Clean up the key name to be readable (e.g. 'first_name' -> 'First name')
      const readableKey = firstKey.charAt(0).toUpperCase() + firstKey.slice(1).replace(/_/g, ' ');

      // If the message is nested object, fallback
      if (typeof message === 'object') {
         return "Validation failed on your input data.";
      }
      
      return `${readableKey}: ${message}`;
    }
  }

  return "An unexpected error occurred. Please try again.";
};
