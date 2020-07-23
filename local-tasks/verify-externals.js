"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
(function () {
    const Git = require("simple-git/promise"), fs = requireModule("fs"), gulp = requireModule("gulp");
    gulp.task("verify-externals", async () => {
        const externals = path_1.default.resolve(path_1.default.join(__dirname, "..", "gulp-tasks", "ext")), contents = await fs.readdir(externals);
        for (let dir of contents) {
            switch (dir) {
                case "gulp-nunit-runner":
                    await verifyGulpNunitRunnerExternalAt(path_1.default.join(externals, dir));
                    break;
                default:
                    throw new Error(`External ${dir} is not tested!`);
            }
        }
    });
    async function verifyGulpNunitRunnerExternalAt(at) {
        const expected = "v2.0.3", git = new Git(at), branchInfo = await git.branch();
        if (!branchInfo || branchInfo.current !== expected) {
            throw new Error(`Expected tag ${expected} for ext at ${at}`);
        }
    }
})();