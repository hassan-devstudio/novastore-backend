// A central dictionary defining standard HTTP status codes for structured API responses
export default {
  // --- SUCCESS STATUSES ---
  // 200: The request was successful (commonly used for GET and PUT requests)
  OK: 200,

  // 201: A new resource was successfully created on the server (used for POST registration/inserts)
  CREATED: 201,

  // --- CLIENT ERROR STATUSES ---
  // 400: The request has malformed inputs or failed schema validations
  VALIDATION_ERROR: 400,

  // 401: The user is unauthenticated or has an invalid/expired token
  UNAUTHORIZED: 401,

  // 403: The user is authenticated but does not have permission to access the resource
  FORBIDDEN: 403,

  // 404: The server cannot find the requested resource or endpoint path
  NOT_FOUND: 404,

  // --- SERVER ERROR STATUSES ---
  // 500: An unexpected internal server crash or database connection exception occurred
  SERVER_ERROR: 500,
};
