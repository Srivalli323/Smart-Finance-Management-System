import { Request, Response, NextFunction } from "express";
import HouseholdModel, { HouseholdRoleEnum } from "../models/household.model";
import { ForbiddenException, UnauthorizedException } from "../utils/app-error";

export enum RequiredRole {
  OWNER = "OWNER",
  MEMBER = "MEMBER", // Owner or Member
  VIEWER = "VIEWER", // Owner, Member, or Viewer
}

/**
 * Middleware to enforce role-based access control for household operations
 * @param requiredRole - Minimum role required to access the resource
 */
export const requireHouseholdRole = (requiredRole: RequiredRole = RequiredRole.VIEWER) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user?._id) {
        throw new UnauthorizedException("User not authenticated");
      }
      const userId = String(req.user._id);

      // Get householdId from params or body
      const householdId = req.params.householdId || req.body.householdId;
      if (!householdId) {
        throw new UnauthorizedException("Household ID is required");
      }

      // Find household and check user's role
      const household = await HouseholdModel.findById(householdId);
      if (!household) {
        throw new UnauthorizedException("Household not found");
      }

      const member = household.members.find(
        (m) => m.userId.toString() === userId
      );

      if (!member) {
        throw new ForbiddenException("You are not a member of this household");
      }

      // Check role hierarchy: OWNER > MEMBER > VIEWER
      const roleHierarchy = {
        [HouseholdRoleEnum.OWNER]: 3,
        [HouseholdRoleEnum.MEMBER]: 2,
        [HouseholdRoleEnum.VIEWER]: 1,
      };

      const requiredRoleLevel = {
        [RequiredRole.OWNER]: 3,
        [RequiredRole.MEMBER]: 2,
        [RequiredRole.VIEWER]: 1,
      };

      const userRoleLevel = roleHierarchy[member.role] || 0;
      const minRequiredLevel = requiredRoleLevel[requiredRole];

      if (userRoleLevel < minRequiredLevel) {
        throw new ForbiddenException(
          `This action requires ${requiredRole} role or higher`
        );
      }

      // Attach household and member info to request for use in controllers
      (req as any).household = household;
      (req as any).householdMember = member;

      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to check if user owns a resource (budget, etc.)
 */
export const requireResourceOwnership = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user?._id) {
      throw new UnauthorizedException("User not authenticated");
    }

    // This will be extended based on specific resource types
    // For now, it's a placeholder that can be customized per route
    next();
  } catch (error) {
    next(error);
  }
};

