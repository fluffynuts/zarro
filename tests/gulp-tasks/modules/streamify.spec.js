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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const through = __importStar(require("through2"));
const plugin_error_1 = __importDefault(require("plugin-error"));
const faker_1 = require("@faker-js/faker");
const { streamify } = requireModule("streamify");
const spawn = requireModule("spawn");
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
        const txtFile = await sandbox.writeFile("foo.txt", "moo-cow");
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
            .toEqual(txtFile);
    });
    it(`should surface outputs when a SpawnError is caught`, async () => {
        // Arrange
        spyOn(console, "log");
        spyOn(console, "error");
        const sandbox = await Sandbox.create();
        await sandbox.writeFile("foo.txt", "moo-cow");
        const regularMessage = faker_1.faker.word.words(5);
        const errorMessage = faker_1.faker.word.words(5);
        const errorJs = await sandbox.writeFile("error.js", `
    console.log("${regularMessage}");
    throw new Error("${errorMessage}");
    `);
        let captured;
        // Act
        await new Promise(resolve => {
            gulp.src(`${sandbox.path}/**/*.txt`)
                .pipe(streamify((opts) => Promise.resolve(), async (f) => {
                await spawn("node", [errorJs]);
                // shouldn't get here...
                return {};
            }, "test plugin", "foo")).on("error", e => {
                captured = e;
                resolve();
            });
        });
        // Assert
        expect(captured)
            .toExist();
        expect(captured)
            .toBeA(plugin_error_1.default);
        expect(captured.message)
            .toContain(errorMessage);
        expect(captured.message)
            .toContain(regularMessage);
    });
    beforeEach(() => {
        for (const k of Object.keys(captured)) {
            delete captured[k];
        }
    });
    afterEach(async () => {
        await Sandbox.destroyAll();
    });
});
