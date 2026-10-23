import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { updateCreatorValidator } from "../validators/creators.validator.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  getCreatorByUsername,
  getCreatorLeaderboard,
  updateCreator,
} from "../controller/creators.controller.js";

const router = Router();

router.patch(
  "/me",
  updateCreatorValidator,
  validate,
  requireAuth,
  updateCreator,
);
router.get("/:username", getCreatorByUsername);
router.get("/:username/leaderboard", getCreatorLeaderboard);

export default router;
