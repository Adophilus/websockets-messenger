"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.start = exports.io = exports.app = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const morgan_1 = __importDefault(require("morgan"));
const body_parser_1 = __importDefault(require("body-parser"));
const tslog_1 = require("tslog");
const http_1 = __importDefault(require("http"));
const config_1 = __importDefault(require("./config"));
const websocket_service_1 = __importDefault(require("./services/websocket.service"));
const app = (0, express_1.default)();
exports.app = app;
const server = http_1.default.createServer(app);
const logger = new tslog_1.Logger();
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('combined'));
app.use(body_parser_1.default.urlencoded({ extended: true }));
const io = (0, websocket_service_1.default)(server);
exports.io = io;
const start = () => {
    server.listen(config_1.default.port, () => {
        logger.info(`Server running on port ${config_1.default.port}`);
    });
};
exports.start = start;
