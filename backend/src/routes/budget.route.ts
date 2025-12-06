import { Router } from "express";
import {
  getBudgetStatusController,
  createBudgetController,
  updateBudgetController,
  deleteBudgetController,
  getUserBudgetsController,
  getBudgetByIdController,
  updateBudgetLimitController,
  createHouseholdController,
  joinHouseholdController,
  getUserHouseholdController,
  getBudgetStatusByHouseholdController,
} from "../controllers/budget.controller";
import { requireHouseholdRole, RequiredRole } from "../middlewares/role-based-access.middleware";

const budgetRoutes = Router();

// Household management (specific routes first)
budgetRoutes.post("/household/create", createHouseholdController);
budgetRoutes.post("/household/join", joinHouseholdController);
budgetRoutes.get("/household", getUserHouseholdController);

// Legacy household budget endpoints (specific routes before parameterized)
budgetRoutes.get("/status/:householdId", getBudgetStatusByHouseholdController);
budgetRoutes.put("/limit/:householdId", requireHouseholdRole(RequiredRole.OWNER), updateBudgetLimitController);

// Budget CRUD operations
budgetRoutes.get("/", getUserBudgetsController);
budgetRoutes.post("/create", createBudgetController);
budgetRoutes.get("/:budgetId/status", getBudgetStatusController); // Specific route before parameterized
budgetRoutes.get("/:budgetId", getBudgetByIdController);
budgetRoutes.put("/:budgetId", updateBudgetController);
budgetRoutes.delete("/:budgetId", deleteBudgetController);

export default budgetRoutes;
