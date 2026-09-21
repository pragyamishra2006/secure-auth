export function notFound(req, res) {
  res.status(404).json({
    success: false,
    message: "Endpoint not found."
  });
}

export function errorHandler(err, req, res, next) {
  console.error(err);

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.expose ? err.message : "Something went wrong. Please try again."
  });
}
