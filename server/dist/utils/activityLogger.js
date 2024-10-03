"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logActivity = void 0;
const prisma_1 = __importDefault(require("../config/prisma"));
const client_1 = require("@prisma/client");
const logActivity = async (req, userId, action, entity, entityId, outcome = client_1.ActionOutcome.SUCCESS // Default value for outcome
) => {
    const ipAddress = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'Unknown';
    await prisma_1.default.activityLog.create({
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
exports.logActivity = logActivity;
