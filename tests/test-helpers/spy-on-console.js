"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.spyOnConsole = void 0;
const noop_1 = require("./noop");
const { spyOn } = jest;
function spyOnConsole(outputs) {
    const out = outputs !== null && outputs !== void 0 ? outputs : ["debug", "info", "log", "warn", "error"];
    for (const k of out) {
        spyOn(console, k).mockImplementation(noop_1.noop);
    }
}
exports.spyOnConsole = spyOnConsole;
