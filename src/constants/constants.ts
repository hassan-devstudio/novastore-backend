// A central dictionary defining standard HTTP status codes for structured API responses

export default {
  // --- SUCCESS STATUSES ---

  // 200: The request was successful
  OK: 200,

  // 201: A new resource was successfully created
  CREATED: 201,

  // --- CLIENT ERROR STATUSES ---

  // 400: The request is invalid or contains invalid input
  // Commonly used for Yup/schema validation errors
  BAD_REQUEST: 400,

  // 401: The user is unauthenticated or has invalid/expired credentials
  UNAUTHORIZED: 401,

  // 403: The user is authenticated but does not have permission
  FORBIDDEN: 403,

  // 404: The requested resource or endpoint could not be found
  NOT_FOUND: 404,

  // --- SERVER ERROR STATUSES ---

  // 500: An unexpected server-side error occurred
  SERVER_ERROR: 500,
};
