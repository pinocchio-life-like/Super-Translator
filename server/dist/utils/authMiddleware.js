"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const generateAccessToken = (userId) => {
    return jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_SECRET || 'default_secret', {
        expiresIn: '10s',
    });
};
// Middleware to verify access token and refresh it if expired
const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    const refreshToken = req.cookies.refreshToken;
    if (!token) {
        res.status(401).send('Access token missing');
        return;
    }
    jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'default_secret', async (err, user) => {
        if (err) {
            if (err.name === 'TokenExpiredError') {
                // If access token expired, check refresh token
                if (!refreshToken) {
                    res.status(403).send('Refresh token missing');
                    return;
                }
                const storedToken = await prisma_1.default.refreshToken.findFirst({ where: { token: refreshToken } });
                if (!storedToken) {
                    res.status(403).send('Invalid refresh token');
                    return;
                }
                jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET || 'default_refresh_secret', (refreshErr, decoded) => {
                    if (refreshErr) {
                        res.status(403).send('Invalid or expired refresh token');
                        return;
                    }
                    // Generate a new access token
                    const newAccessToken = generateAccessToken(decoded.id);
                    // Optionally, set the new access token in the response header
                    res.setHeader('Authorization', `Bearer ${newAccessToken}`);
                    // Attach the new access token to the request object and continue
                    req.headers['authorization'] = `Bearer ${newAccessToken}`;
                    req.user = decoded;
                    next(); // Continue with the original request
                });
            }
            else {
                // Invalid token for reasons other than expiration
                res.status(403).send('Invalid token');
                return;
            }
        }
        else {
            // Token is valid, continue the request
            req.user = user;
            next();
        }
    });
};
exports.authenticateToken = authenticateToken;
