"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseBool = void 0;
const truthy = [
    "1",
    "yes",
    "true"
], falsey = [
    "0",
    "no",
    "false"
];
function parseBool(value) {
    if (truthy.indexOf(value === null || value === void 0 ? void 0 : value.toString()) > -1) {
        return true;
    }
    if (falsey.indexOf(value === null || value === void 0 ? void 0 : value.toString()) > -1) {
        return false;
    }
    throw new Error(`could not parse '${value}' as a boolean value`);
}
exports.parseBool = parseBool;
