"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const translationRoutes_1 = __importDefault(require("./routes/translationRoutes"));
const prisma_1 = __importDefault(require("./config/prisma"));
const authMiddleware_1 = require("./utils/authMiddleware");
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware setup
app.use((0, cors_1.default)({
    origin: ['https://super-translator-demo.vercel.app', 'http://localhost:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true,
}));
app.options('*', (0, cors_1.default)());
app.use(body_parser_1.default.json());
app.use((0, cookie_parser_1.default)());
// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ message: 'API is healthy' });
});
app.get('/', (req, res) => {
    res.status(200).json({ message: 'Welcome to the Super Translator API' });
});
// User routes
app.use('/api/users', userRoutes_1.default);
// Translation routes
app.use('/api/translate', authMiddleware_1.authenticateToken, translationRoutes_1.default);
app.get('/protected', authMiddleware_1.authenticateToken, (req, res) => {
    res.json({ message: 'This is a protected route' });
});
// Gracefully disconnect Prisma when the app is terminated
process.on('SIGINT', async () => {
    await prisma_1.default.$disconnect();
    process.exit();
});
exports.default = app;
