import {Router} from "express";
import { createOrderValidator } from "../validators/payment.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import { createOrder, verifyPayment } from "../controller/payment.controller.js";

const router = Router();

router.post("/order", createOrderValidator, validate, createOrder);
router.post("/verify", verifyPayment);

export default router;