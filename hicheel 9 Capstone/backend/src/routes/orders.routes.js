const express = require("express");
const { createOrder, getMyOrders, getMyOrderById } = require("../controllers/orders.controller");
const { protect } = require("../middleware/protect");
const { authorize } = require("../middleware/authorize");

const router = express.Router();

router.use(protect, authorize("CUSTOMER"));
router.post("/", createOrder);
router.get("/", getMyOrders);
router.get("/:id", getMyOrderById);

module.exports = router;
