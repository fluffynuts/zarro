"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const realSystem = Object.assign({}, require("system-wrapper"));
jest.doMock("system-wrapper", () => realSystem);
require("expect-even-more-jest");
describe(`nuget-update-self`, () => {
    const { spyOn } = jest;
    const path = require("path"), findLocalNuget = requireModule("find-local-nuget"), nugetUpdateSelf = requireModule("nuget-update-self"), os = require("os"), isWindows = os.platform() === "win32";
    it(`should run the update -self command`, async () => {
        // Arrange
        spyOn(realSystem, "system").mockImplementation((exe, args, options) => new realSystem.SystemResult(exe, args, 0, [], []));
        const nuget = await findLocalNuget();
        // Act
        await nugetUpdateSelf(nuget);
        // Assert
        if (isWindows) {
            expect(realSystem.system)
                .toHaveBeenCalledWith(nuget, ["update", "-self"], expect.anything());
        }
        else {
            const shim = path.join(path.dirname(nuget), "nuget");
            expect(realSystem.system)
                .toHaveBeenCalledWith(shim, ["update", "-self"], expect.anything());
        }
    }, 30000);
});
