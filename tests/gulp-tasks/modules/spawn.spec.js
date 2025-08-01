"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const { Sandbox } = require("filesystem-sandbox");
const faker_1 = require("@faker-js/faker");
const yafs_1 = require("yafs");
const spy_on_console_1 = require("../../test-helpers/spy-on-console");
describe(`spawn`, () => {
    const { last } = requireModule("linq"), os = require("os"), isWindows = os.platform() === "win32";
    (0, spy_on_console_1.spyOnConsole)();
    const spawn = requireModule("spawn");
    it(`should be a function`, async () => {
        // Arrange
        // Act
        expect(spawn)
            .toBeFunction();
        // Assert
    });
    describe(`given command`, () => {
        // it(`should run single command item`, async () => {
        //   // Arrange
        //   spyOn(console, "log");
        //   spyOn(console, "error");
        //   // Act
        //   await expect(spawn("whoami", [], { suppressOutput: true }))
        //     .resolves.not.toThrow();
        //   // Assert
        // });
        it(`should return the output from the command item`, async () => {
            // Arrange
            spyOn(console, "log");
            spyOn(console, "error");
            const username = os.userInfo().username.toLowerCase();
            // Act
            const result = await spawn("whoami");
            // Assert
            const stored = result.stdout[0].trim().toLowerCase();
            if (isWindows) {
                const withoutDomain = last(stored.split("\\"));
                expect(withoutDomain)
                    .toEqual(username);
            }
            else {
                expect(stored)
                    .toEqual(username);
            }
        });
    });
    describe(`given command and arguments`, () => {
        it(`should run the command with arguments`, async () => {
            // Arrange
            const sandbox = await Sandbox.create(), fileName = faker_1.faker.system.fileName(), file = await sandbox.writeFile(fileName, "");
            // Act
            if (isWindows) {
                await spawn("cmd", ["/c", `echo foo >> ${file}`]);
            }
            else {
                await spawn("/bin/sh", ["-c", `echo foo >> ${file}`]);
            }
            // Assert
            const contents = await (0, yafs_1.readTextFile)(file);
            expect(contents.trim())
                .toEqual("foo");
        });
    });
    describe(`given long commandline`, () => {
        it(`should spawn with default shell`, async () => {
            // Arrange
            const sandbox = await Sandbox.create(), fileName = faker_1.faker.system.fileName(), file = await sandbox.writeFile(fileName, "");
            // Act
            if (isWindows) {
                await spawn(`echo foo >> ${file}`);
            }
            else {
                await spawn(`echo foo >> ${file}`);
            }
            // Assert
            const contents = await (0, yafs_1.readTextFile)(file);
            expect(contents.trim())
                .toEqual("foo");
        });
    });
    it(`should suppress output on demand`, async () => {
        // Arrange
        jest.spyOn(console, "log");
        jest.spyOn(console, "error");
        // Act
        const result = await spawn("npm", ["publish", "--help"], {
            suppressOutput: true
        });
        // Assert
        expect(result.stdout)
            .not.toBeEmptyArray();
        expect(console.log)
            .not.toHaveBeenCalled();
        expect(console.error)
            .not.toHaveBeenCalled();
    });
});
