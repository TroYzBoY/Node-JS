const express = require("express");
const { getCategories, createCategory } = require("../controllers/categories.controller");
const { protect } = require("../middleware/protect");
const { authorize } = require("../middleware/authorize");

const router = express.Router();

router.get("/", getCategories);
router.post("/", protect, authorize("ADMIN"), createCategory);

module.exports = router;

