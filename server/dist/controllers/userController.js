"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.signup = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const prisma_1 = __importDefault(require("../config/prisma"));
const activityLogger_1 = require("../utils/activityLogger");
const enums_1 = require("../types/enums");
const generateAccessToken = (userId) => {
    return jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_SECRET || 'default_secret', {
        expiresIn: '10s',
    });
};
const generateRefreshToken = (userId) => {
    return jsonwebtoken_1.default.sign({ id: userId }, process.env.JWT_REFRESH_SECRET || 'default_refresh_secret', {
        expiresIn: '7d',
    });
};
// Save refresh token to the database
const saveRefreshToken = async (userId, token) => {
    await prisma_1.default.refreshToken.create({
        data: {
            userId,
            token,
        },
    });
};
// Clear existing refresh tokens for a user
const clearRefreshTokens = async (userId) => {
    await prisma_1.default.refreshToken.deleteMany({
        where: {
            userId,
        },
    });
};
// Set refresh token as an HTTP-only cookie
const setRefreshTokenCookie = (res, refreshToken) => {
    res.cookie('refreshToken', refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production', // Send only over HTTPS in production
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};
// Signup controller
const signup = async (req, res) => {
    const { email, password, name } = req.body;
    try {
        const existingUser = await prisma_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        const hashedPassword = await bcryptjs_1.default.hash(password, 10);
        const newUser = await prisma_1.default.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
            },
        });
        const accessToken = generateAccessToken(newUser.id);
        const refreshToken = generateRefreshToken(newUser.id);
        // Clear any existing refresh tokens for this user and save the new one
        await clearRefreshTokens(newUser.id);
        await saveRefreshToken(newUser.id, refreshToken);
        // Set refresh token in an HTTP-only cookie
        setRefreshTokenCookie(res, refreshToken);
        // Log successful signup activity
        await (0, activityLogger_1.logActivity)(req, newUser.id, enums_1.ActionType.CREATE, enums_1.EntityType.USER, newUser.id);
        res.status(201).json({ message: 'User created', accessToken });
    }
    catch (error) {
        console.error('Error creating user', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.signup = signup;
// Login controller
const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await prisma_1.default.user.findUnique({ where: { email } });
        if (!user || !user.password) {
            res.status(400).json({ message: 'Invalid email or password' });
            return;
        }
        const validPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!validPassword) {
            res.status(400).json({ message: 'Invalid email or password' });
            return;
        }
        const accessToken = generateAccessToken(user.id);
        const refreshToken = generateRefreshToken(user.id);
        // Clear existing refresh tokens and save the new one
        await clearRefreshTokens(user.id);
        await saveRefreshToken(user.id, refreshToken);
        // Set refresh token in an HTTP-only cookie
        setRefreshTokenCookie(res, refreshToken);
        // Log successful login activity
        await (0, activityLogger_1.logActivity)(req, user.id, enums_1.ActionType.LOGIN, enums_1.EntityType.USER, user.id);
        res.status(200).json({ message: 'Login successful', accessToken });
    }
    catch (error) {
        console.error('Error logging in', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
exports.login = login;
