"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.App = void 0;
const express_1 = __importDefault(require("express"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
class App {
    constructor() {
        this.PORT = process.env.PORT;
        this.app = (0, express_1.default)();
        this.configuration();
    }
    configuration() {
        this.app.use(express_1.default.json());
        this.app.use((0, cookie_parser_1.default)());
        this.app.get("/test", (req, res, next) => {
            res.send("Test successfully");
        });
    }
    routes() { }
    handleError() { }
    run() {
        this.app.listen(this.PORT, () => {
            console.log(`Server running on `);
        });
    }
}
exports.App = App;
