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
const child_process_1 = require("child_process");
const path = __importStar(require("path"));
const scriptPath = path.resolve(__dirname, "../../.github/scripts/is-shipping-change.js");
const { isShippingChange } = require("../../.github/scripts/is-shipping-change");
describe(`is-shipping-change`, () => {
    describe(`changes which do not ship`, () => {
        const notShipping = [
            ["only tests", ["tests/gulp-tasks/modules/foo.spec.ts", "tests/gulp-tasks/modules/foo.spec.js"]],
            ["a test resource", ["tests/resources/dotnet-core-unit-tests/package.json"]],
            ["only workflows and scripts under .github", [".github/workflows/release.yml", ".github/scripts/next-release-version.js"]],
            ["markdown, wherever it is", ["README.md", "RELEASING.md", "docs/guide.md"]],
            ["only the lockfile", ["package-lock.json"]],
            ["a nested lockfile", ["gulp-tasks/modules/fetch-github-release/package-lock.json"]],
            ["only .gitignore", [".gitignore"]],
            ["a mixture of all of the above", ["tests/a.ts", ".github/workflows/x.yml", "README.md", "package-lock.json", ".gitignore"]]
        ];
        for (const [name, files] of notShipping) {
            it(`should not ship: ${name}`, () => {
                // Arrange
                // Act
                const result = isShippingChange(files);
                // Assert
                expect(result)
                    .toBeFalse();
            });
        }
        it(`should not ship when nothing changed`, () => {
            // Arrange
            // Act
            const result = isShippingChange([]);
            // Assert
            expect(result)
                .toBeFalse();
        });
    });
    describe(`changes which ship`, () => {
        const shipping = [
            ["a gulp task", "gulp-tasks/build.js"],
            ["a gulp task source file", "gulp-tasks/build.ts"],
            ["a gulp module", "gulp-tasks/modules/env.js"],
            ["an index module", "index-modules/load-defaults.js"],
            ["the entry point", "index.js"],
            ["the typings", "types.d.ts"],
            ["package.json (dependencies, scripts, version...)", "package.json"],
            ["tsconfig.json", "tsconfig.json"]
        ];
        for (const [name, file] of shipping) {
            it(`should ship: ${name}`, () => {
                // Arrange
                // Act
                const result = isShippingChange([file]);
                // Assert
                expect(result)
                    .toBeTrue();
            });
        }
        it(`should ship when just one file among many ships`, () => {
            // Arrange
            const files = ["tests/a.ts", "README.md", "package-lock.json", "gulp-tasks/build.js", ".github/workflows/x.yml"];
            // Act
            const result = isShippingChange(files);
            // Assert
            expect(result)
                .toBeTrue();
        });
        it(`should not be fooled by a path which merely contains a non-shipping name`, () => {
            // Arrange
            const files = ["gulp-tasks/tests/helper.js", "src/.github-thing.js", "gulp-tasks/readme.md.js"];
            // Act
            const result = isShippingChange(files);
            // Assert
            expect(result)
                .toBeTrue();
        });
    });
    describe(`command line`, () => {
        function run(stdin) {
            return (0, child_process_1.spawnSync)("node", [scriptPath], { input: stdin, encoding: "utf8" });
        }
        it(`should print true when a listed file ships`, () => {
            // Arrange
            // Act
            const result = run("tests/a.ts\ngulp-tasks/build.js\n");
            // Assert
            expect(result.status)
                .toEqual(0);
            expect(result.stdout)
                .toEqual("true\n");
        });
        it(`should print false when no listed file ships`, () => {
            // Arrange
            // Act
            const result = run("tests/a.ts\nREADME.md\n");
            // Assert
            expect(result.status)
                .toEqual(0);
            expect(result.stdout)
                .toEqual("false\n");
        });
        it(`should print false for empty input, ignoring blank lines`, () => {
            // Arrange
            // Act
            const result = run("\n\n");
            // Assert
            expect(result.stdout)
                .toEqual("false\n");
        });
    });
});
