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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ensureDirExist = exports.mkdir = exports.exists = void 0;
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const exists = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield fs_1.default.promises.access(filePath);
        return true;
    }
    catch (_a) {
        return false;
    }
});
exports.exists = exists;
const mkdir = (dirname) => __awaiter(void 0, void 0, void 0, function* () {
    const isExist = yield (0, exports.exists)(dirname);
    if (!isExist) {
        yield fs_1.default.promises.mkdir(dirname, { recursive: true });
    }
});
exports.mkdir = mkdir;
const ensureDirExist = (filePath) => __awaiter(void 0, void 0, void 0, function* () {
    const dirname = path_1.default.dirname(filePath);
    yield (0, exports.mkdir)(dirname);
});
exports.ensureDirExist = ensureDirExist;
