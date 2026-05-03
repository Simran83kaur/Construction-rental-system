import { Router } from "express";
import { getItems } from "../controllers/itemController.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.get("/", asyncHandler(getItems));

export default router;
