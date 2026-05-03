import { Router } from "express";
import {
  getCustomerById,
  getCustomers,
} from "../controllers/customerController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getCustomers));
router.get("/:id", asyncHandler(getCustomerById));

export default router;
