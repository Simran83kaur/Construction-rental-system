export const notFoundHandler = (_req, res) => {
  res.status(404).json({ message: "Route not found" });
};

export const errorHandler = (error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({
    message: error.message || "Something went wrong",
  });
};
