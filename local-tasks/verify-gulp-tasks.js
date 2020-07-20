"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
(function () {
    const Git = require("simple-git/promise"), gulp = requireModule("gulp");
    gulp.task("verify-gulp-tasks", async () => {
        const at = path_1.default.resolve(path_1.default.join(__dirname, "..", "gulp-tasks")), git = new Git(at), expected = "master", branchInfo = await git.branch();
        if (!branchInfo || branchInfo.current !== expected) {
            throw new Error(`Expected gulp-tasks to be checked out as master`);
        }
    });
})();
