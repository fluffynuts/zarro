"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const yafs_1 = require("yafs");
const faker_1 = require("@faker-js/faker");
const filesystem_sandbox_1 = require("filesystem-sandbox");
describe(`create-temp-file`, () => {
    const createTempFile = requireModule("create-temp-file"), os = require("os"), isWindows = os.platform() === "win32", tempDir = isWindows
        ? resolveFirstEnvVarFolder("TEMP", "TMP")
        : "/tmp";
    describe(`when no contents provided`, () => {
        it(`should create a temporary file with no contents`, async () => {
            // Arrange
            // Act
            const sut = await create();
            // Assert
            expect(sut.path)
                .toBeFile();
            const contents = await (0, yafs_1.readTextFile)(sut.path);
            expect(contents)
                .toBeEmptyString();
            sut.destroy();
            expect(sut.path)
                .not.toBeFile();
        });
    });
    describe(`when contents provided`, () => {
        it(`should create the temp file with contents`, async () => {
            // Arrange
            // Act
            const expected = faker_1.faker.word.words(), sut = await create(expected);
            // Assert
            expect(sut.path)
                .toBeFile();
            const contents = await (0, yafs_1.readTextFile)(sut.path);
            expect(contents)
                .toEqual(expected);
            sut.destroy();
            expect(sut.path)
                .not.toBeFile();
        });
    });
    describe(`when target folder is provided`, () => {
        it(`should use it`, async () => {
            // Arrange
            const sandbox = await filesystem_sandbox_1.Sandbox.create(), expected = faker_1.faker.word.words(), target = sandbox.fullPathFor(faker_1.faker.word.sample()), sut = await create(expected, target);
            // Act
            expect(sut.path)
                .toBeFile();
            expect(sut.path)
                .toEqual(target);
            const contents = await (0, yafs_1.readTextFile)(sut.path);
            expect(contents)
                .toEqual(expected);
            sut.destroy();
            expect(sut.path)
                .not.toBeFile();
            // Assert
        });
        afterEach(async () => {
            await filesystem_sandbox_1.Sandbox.destroyAll();
        });
    });
    async function create(contents, at) {
        return createTempFile(contents, at);
    }
    async function resolveFirstEnvVarFolder(...vars) {
        const firstDefined = vars.reduce((acc, cur) => {
            if (acc) {
                return acc;
            }
            if (!!process.env[cur]) {
                return process.env[cur];
            }
            return undefined;
        }, undefined);
        if (!firstDefined) {
            throw new Error(`Can't find defined env var amongst: '${vars}'`);
        }
        if (!await (0, yafs_1.folderExists)(firstDefined)) {
            await (0, yafs_1.mkdir)(firstDefined);
        }
        return firstDefined;
    }
});
