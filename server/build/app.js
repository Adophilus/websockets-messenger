"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const body_parser_1 = __importDefault(require("body-parser"));
const dotenv_1 = __importDefault(require("dotenv"));
const tslog_1 = require("tslog");
dotenv_1.default.config();
const app = (0, express_1.default)();
exports.app = app;
const logger = new tslog_1.Logger();
const config = {
    port: process.env.PORT ? parseInt(process.env.PORT) : 5000
};
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('full'));
app.use(body_parser_1.default.urlencoded({ extended: true }));
const start = () => {
    app.listen(config.port, () => {
        logger.info(`Server running on port ${config.port}`);
    });
};
exports.start = start;
