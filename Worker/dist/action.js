"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateDirectMessage = exports.createDirectMessage = exports.updateMessage = exports.createMessage = void 0;
const db_1 = require("./db");
const createMessage = ({ message }) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield db_1.db.message.create({
            data: Object.assign({}, message)
        });
    }
    catch (error) {
        console.log(error);
    }
});
exports.createMessage = createMessage;
const updateMessage = ({ message }) => __awaiter(void 0, void 0, void 0, function* () {
    const { content, id } = message;
    yield db_1.db.message.update({
        where: { id },
        data: { content }
    });
});
exports.updateMessage = updateMessage;
const createDirectMessage = ({ message }) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.db.directMessage.create({
        data: Object.assign({}, message)
    });
});
exports.createDirectMessage = createDirectMessage;
const updateDirectMessage = ({ message }) => __awaiter(void 0, void 0, void 0, function* () {
    const { content, id } = message;
    yield db_1.db.directMessage.update({
        where: { id },
        data: { content }
    });
});
exports.updateDirectMessage = updateDirectMessage;
