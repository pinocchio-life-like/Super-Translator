"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const translationController_1 = require("../controllers/translationController");
const router = express_1.default.Router();
// Translation route
router.post('/translate', translationController_1.translation);
exports.default = router;
