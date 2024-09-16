"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("dotenv/config");
const cors_1 = __importDefault(require("cors"));
const message_controller_1 = require("./controllers/message.controller");
const direct_message_controller_1 = require("./controllers/direct-message.controller");
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.route('/message').post(message_controller_1.createMessage);
app.route("/message/:id")
    .delete(message_controller_1.deleteMessage)
    .put(message_controller_1.updateMessage);
app.route("/direct-message").post(direct_message_controller_1.createDirectMessage);
app.route("/direct-message/:id")
    .delete(direct_message_controller_1.deleteDirectMessage)
    .put(direct_message_controller_1.updateDirectMessage);
app.listen(8000, () => {
    console.log('Message Service running on port 8000');
});
