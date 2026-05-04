const sendSuccess = (res, data = null, message = 'OK', pagination = null, statusCode = 200) => {
  const response = { success: true, message, data };
  if (pagination) response.pagination = pagination;
  return res.status(statusCode).json(response);
};

const sendError = (res, error = 'An error occurred', details = [], statusCode = 500) => {
  return res.status(statusCode).json({ success: false, error, details });
};

module.exports = { sendSuccess, sendError };
