import prisma from "../config/prisma";
import { Request } from "express";
import { ActionType, EntityType, ActionOutcome } from "@prisma/client";

export const logActivity = async (
  req: Request,
  userId: string,
  action: ActionType,
  entity: EntityType,
  entityId?: string,
  outcome: ActionOutcome = ActionOutcome.SUCCESS // Default value for outcome
) => {
  const ipAddress =
    req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
  const userAgent = req.get("User-Agent") || "Unknown";

  await prisma.activityLog.create({
    data: {
      userId,
      action,
      entity,
      entityId: entityId || null, // Nullable if the action does not involve a specific entity
      ipAddress: ipAddress?.toString(),
      userAgent,
      outcome,
    },
  });
};
