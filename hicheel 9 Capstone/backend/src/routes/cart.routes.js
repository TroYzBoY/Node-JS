const express = require("express");
const {
  getMyCart,
  addToCart,
  updateCartItem,
  deleteCartItem,
} = require("../controllers/cart.controller");
const { protect } = require("../middleware/protect");
const { authorize } = require("../middleware/authorize");

const router = express.Router();

router.use(protect, authorize("CUSTOMER"));
router.get("/", getMyCart);
router.post("/items", addToCart);
router.patch("/items/:id", updateCartItem);
router.delete("/items/:id", deleteCartItem);

module.exports = router;
