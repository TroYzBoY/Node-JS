const { createError } = require("../utils/errors");

const validateCreateProduct = (req, res, next) => {
  const { name, price, stock, categoryId } = req.body;

  if (!name || price === undefined || stock === undefined || !categoryId) {
    return next(createError(400, "name, price, stock, categoryId are required"));
  }

  if (typeof name !== "string" || !name.trim()) {
    return next(createError(400, "name must be a non-empty string"));
  }

  if (Number(price) < 0 || Number.isNaN(Number(price))) {
    return next(createError(400, "price must be a valid number >= 0"));
  }

  if (!Number.isInteger(Number(stock)) || Number(stock) < 0) {
    return next(createError(400, "stock must be an integer >= 0"));
  }

  if (!Number.isInteger(Number(categoryId)) || Number(categoryId) <= 0) {
    return next(createError(400, "categoryId must be a positive integer"));
  }

  return next();
};

const validateUpdateProduct = (req, res, next) => {
  const allowed = ["name", "description", "price", "stock", "categoryId"];
  const incomingKeys = Object.keys(req.body);

  if (!incomingKeys.length) {
    return next(createError(400, "At least one field is required to update"));
  }

  const hasInvalid = incomingKeys.some((key) => !allowed.includes(key));
  if (hasInvalid) {
    return next(createError(400, "Invalid fields in request body"));
  }

  const { name, price, stock, categoryId } = req.body;

  if (name !== undefined && (typeof name !== "string" || !name.trim())) {
    return next(createError(400, "name must be a non-empty string"));
  }

  if (price !== undefined && (Number(price) < 0 || Number.isNaN(Number(price)))) {
    return next(createError(400, "price must be a valid number >= 0"));
  }

  if (stock !== undefined && (!Number.isInteger(Number(stock)) || Number(stock) < 0)) {
    return next(createError(400, "stock must be an integer >= 0"));
  }

  if (categoryId !== undefined && (!Number.isInteger(Number(categoryId)) || Number(categoryId) <= 0)) {
    return next(createError(400, "categoryId must be a positive integer"));
  }

  return next();
};

module.exports = {
  validateCreateProduct,
  validateUpdateProduct,
};
