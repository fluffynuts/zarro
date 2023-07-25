"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
const { Sandbox } = require("filesystem-sandbox");
const faker_1 = require("@faker-js/faker");
const yafs_1 = require("yafs");
describe(`spawn`, () => {
    const { last } = requireModule("linq"), os = require("os"), isWindows = os.platform() === "win32";
    const spawn = requireModule("spawn");
    it(`should be a function`, async () => {
        // Arrange
        // Act
        expect(spawn)
            .toBeFunction();
        // Assert
    });
    describe(`given command`, () => {
        it(`should run single command item`, async () => {
            // Arrange
            spyOn(console, "log");
            // Act
            await expect(spawn("whoami"))
                .resolves.not.toThrow();
            // Assert
        });
        it(`should return the output from the command item`, async () => {
            // Arrange
            spyOn(console, "log");
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
});
