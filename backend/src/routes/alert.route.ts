import { Router } from "express";
import {
  getUserAlertsController,
  markAlertAsReadController,
  triggerBudgetCheckController,
} from "../controllers/alert.controller";

const alertRoutes = Router();

alertRoutes.get("/", getUserAlertsController);
alertRoutes.put("/:alertId/read", markAlertAsReadController);
alertRoutes.post("/check/:budgetId", triggerBudgetCheckController);

export default alertRoutes;

