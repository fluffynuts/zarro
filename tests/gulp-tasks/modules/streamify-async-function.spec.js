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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const through = __importStar(require("through2"));
const { streamify } = requireModule("streamify");
const { Sandbox } = require("filesystem-sandbox");
const gulp = requireModule("gulp");
describe(`streamify-async-function`, () => {
    const captured = {};
    async function foo(opts) {
        captured.opts = opts;
    }
    it(`should provide a new function taking the same arguments, which can be streamed`, async () => {
        // Arrange
        const sandbox = await Sandbox.create();
        await sandbox.writeFile("foo.txt", "moo-cow");
        // Act
        await new Promise(resolve => {
            gulp.src(`${sandbox.path}/**/*.txt`)
                .pipe(streamify(foo, (f) => {
                return { target: f.path, flag: true };
            }, "test plugin", "foo")).pipe(through.obj(function () {
                resolve();
            }));
        });
        // Assert
        expect(captured.opts.target)
            .toEqual(sandbox.fullPathFor("foo.txt"));
    });
    afterEach(async () => {
        await Sandbox.destroyAll();
    });
});
