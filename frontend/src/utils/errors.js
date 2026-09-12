export function isNotFoundError(error) {
  if (!error) return false;
  const status = error.status || error.response?.status;
  if (status === 404) return true;
  const message = typeof error === 'string' ? error : error.message || '';
  return /not found|404/i.test(message);
}

export function apiError(message, status) {
  const err = new Error(message);
  err.status = status;
  return err;
}
