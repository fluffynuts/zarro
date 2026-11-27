"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const path = __importStar(require("path"));
describe(`gulp-msbuild wrapper`, () => {
    beforeEach(() => {
        jest.resetModules();
    });
    it(`should not load gulp-msbuild until it is used`, () => {
        // Arrange
        const loaded = jest.fn();
        jest.doMock("gulp-msbuild", () => {
            loaded();
            return jest.fn();
        });
        // Act
        requireModule("gulp-msbuild");
        // Assert
        expect(loaded).not.toHaveBeenCalled();
    });
    it(`should call through to gulp-msbuild when used`, () => {
        // Arrange
        const stream = {}, real = jest.fn().mockReturnValue(stream), opts = { targets: ["Build"] };
        jest.doMock("gulp-msbuild", () => real);
        const sut = requireModule("gulp-msbuild");
        // Act
        const result = sut(opts);
        // Assert
        expect(real).toHaveBeenCalledOnceWith(opts);
        expect(result).toBe(stream);
    });
    describe(`the uuid it needs but does not declare`, () => {
        const reason = "gulp-msbuild 0.11.1+ requires uuid without declaring it, so zarro must supply it " +
            "(see .github/dependabot.yml); without it msbuild builds crash for consumers";
        it(`should be a dependency of zarro itself: ${reason}`, () => {
            var _a;
            // Arrange
            const pkg = require("../../../package.json");
            // Act
            const declared = (_a = pkg.dependencies) === null || _a === void 0 ? void 0 : _a.uuid;
            // Assert
            expect(declared)
                .toBeString();
        });
        it(`should be resolvable from where gulp-msbuild lives: ${reason}`, () => {
            // Arrange
            const gulpMsBuildFolder = path.dirname(require.resolve("gulp-msbuild"));
            // Act
            const resolve = () => require.resolve("uuid", { paths: [gulpMsBuildFolder] });
            // Assert
            expect(resolve)
                .not.toThrow();
        });
    });
});
