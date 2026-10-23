import {Router} from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { getDashboardEarnings, getDashboardSummary, getSupports, getTopSupporters } from "../controller/dashboard.controller.js";

const router = Router();

router.get('/summary', requireAuth, getDashboardSummary);
router.get('/earnings', requireAuth,  getDashboardEarnings);
router.get('/top-supporters', requireAuth,  getTopSupporters);
router.get('/supports', requireAuth,  getSupports);

export default router;