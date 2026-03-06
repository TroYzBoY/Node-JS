const express = require("express");
const { getUsers, getOrders, updateOrderStatus } = require("../controllers/admin.controller");
const { protect } = require("../middleware/protect");
const { authorize } = require("../middleware/authorize");

const router = express.Router();

router.use(protect, authorize("ADMIN"));
router.get("/users", getUsers);
router.get("/orders", getOrders);
router.patch("/orders/:id/status", updateOrderStatus);

module.exports = router;

