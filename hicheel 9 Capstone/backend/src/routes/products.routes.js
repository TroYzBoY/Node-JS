const express = require("express");
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} = require("../controllers/products.controller");
const { protect } = require("../middleware/protect");
const { authorize } = require("../middleware/authorize");
const { validateCreateProduct, validateUpdateProduct } = require("../middleware/validate");

const router = express.Router();

router.get("/", getProducts);
router.get("/:id", getProductById);
router.post("/", protect, authorize("ADMIN", "SELLER"), validateCreateProduct, createProduct);
router.patch("/:id", protect, authorize("ADMIN", "SELLER"), validateUpdateProduct, updateProduct);
router.delete("/:id", protect, authorize("ADMIN", "SELLER"), deleteProduct);

module.exports = router;
