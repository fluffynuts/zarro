"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
describe(`nuget-update-self`, () => {
    const systemMock = jest.fn();
    jest.doMock("../../../gulp-tasks/modules/system", () => systemMock);
    const path = require("path"), SystemResult = requireModule("system-result"), findLocalNuget = requireModule("find-local-nuget"), nugetUpdateSelf = requireModule("nuget-update-self"), os = require("os"), isWindows = os.platform() === "win32";
    it(`should run the update -self command`, async () => {
        // Arrange
        const nuget = await findLocalNuget();
        // Act
        await nugetUpdateSelf(nuget);
        // Assert
        if (isWindows) {
            expect(systemMock)
                .toHaveBeenCalledWith(nuget, ["update", "-self"], expect.anything());
        }
        else {
            const shim = path.join(path.dirname(nuget), "nuget");
            expect(systemMock)
                .toHaveBeenCalledWith(shim, ["update", "-self"], expect.anything());
        }
    }, 30000);
    beforeEach(() => setupSystemMock());
    function setupSystemMock() {
        systemMock.mockImplementation((exe, args, opts) => {
            return Promise.resolve(new SystemResult(exe, args, 0, [], []));
        });
    }
});
