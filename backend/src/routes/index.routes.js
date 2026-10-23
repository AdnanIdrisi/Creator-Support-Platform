import { Router } from "express";
import authRoutes from "./auth.routes.js";
import creatorsRoutes from './creators.routes.js';
import paymentsRoutes from './payments.routes.js';
import dashboardRoutes from './dashboard.routes.js';

const router = Router();

router.use("/auth", authRoutes);
router.use("/creators", creatorsRoutes);
router.use("/payments", paymentsRoutes);
router.use("/dashboard", dashboardRoutes);

export default router;
