const sut = require("../../../gulp-tasks/modules/increment-version") as IncrementVersion;
const {
  currentShortSHA,
  init
} = (require("../../../gulp-tasks/modules/git-sha") as GitSha);
import "expect-even-more-jest";

describe(`increment-version`, function () {
  const env = requireModule<Env>("env");
  beforeAll(async () => {
    await init();
  });
  it(`should be a function`, async () => {
    // Arrange
    // Act
    expect(sut).toBeFunction();
    // Assert
  });

  describe(`strategy: prerelease`, () => {
    describe(`when no prior prerelease version`, () => {
      it(`should (default) increment minor and tack a datestamp and sha onto the version`, async () => {
        // Arrange
        const
          now = Date.now(),
          d = new Date(now);
        spyOn(Date, "now").and.callFake(() => now);
        const
          input = "1.1.1",
          year = `${ d.getFullYear() }`.substring(2),
          month = zeroPad(d.getMonth() + 1),
          day = zeroPad(d.getDate()),
          hour = zeroPad(d.getHours()),
          minute = zeroPad(d.getMinutes()),
          sha = currentShortSHA(),
          expected = `1.1.2-${ year }${ month }${ day }${ hour }${ minute }.${ sha }`;
        // Act
        const result = sut(input, "prerelease");
        // Assert
        expect(result)
          .toEqual(expected);
      });
    });

    describe(`when PACK_INCREMENT_MINOR_ON_FIRST_RELEASE is falsy`, () => {
      beforeEach(() => {
        process.env[env.PACK_INCREMENT_MINOR_ON_FIRST_PRERELEASE] = "0";
      });
      afterEach(() => {
        delete process.env[env.PACK_INCREMENT_MINOR_ON_FIRST_PRERELEASE]
      });
      it(`should not increment minor`, async () => {
        // Arrange
        const
          now = Date.now(),
          d = new Date(now);
        spyOn(Date, "now").and.callFake(() => now);
        const
          input = "1.1.1",
          year = `${ d.getFullYear() }`.substring(2),
          month = zeroPad(d.getMonth() + 1),
          day = zeroPad(d.getDate()),
          hour = zeroPad(d.getHours()),
          minute = zeroPad(d.getMinutes()),
          sha = currentShortSHA(),
          expected = `1.1.1-${ year }${ month }${ day }${ hour }${ minute }.${ sha }`;
        // Act
        const result = sut(input, "prerelease");
        // Assert
        expect(result)
          .toEqual(expected);
      });
    });

    describe(`when have prior prerelease version`, () => {
      it(`should drop prior prerelease info`, async () => {
        // Arrange
        const
          now = Date.now(),
          d = new Date(now);
        spyOn(Date, "now").and.callFake(() => now);
        const
          input = "1.1.1-2301011112.abcdef0",
          year = `${ d.getFullYear() }`.substring(2),
          month = zeroPad(d.getMonth() + 1),
          day = zeroPad(d.getDate()),
          hour = zeroPad(d.getHours()),
          minute = zeroPad(d.getMinutes()),
          sha = currentShortSHA(),
          expected = `1.1.1-${ year }${ month }${ day }${ hour }${ minute }.${ sha }`;
        // Act
        const result = sut(input, "prerelease");
        // Assert
        expect(result)
          .toEqual(expected);
      });
    });

    function zeroPad(num: number): string {
      return num < 10 ? `0${ num }` : `${ num }`;
    }
  });

  describe(`strategy: major`, () => {
    it(`should increment major version`, async () => {
      // Arrange
      const
        input = "1.1.1",
        expected = "2.1.1";
      // Act
      const result = sut(input, "major", false, 1);
      // Assert
      expect(result)
        .toEqual(expected);
    });

    it(`should zero others if required`, async () => {
      // Arrange
      const
        input = "1.1.2",
        expected = "2.0.0";
      // Act
      const result = sut(input, "major", true, 1);
      // Assert
      expect(result)
        .toEqual(expected);
    });
  });

  describe(`strategy: minor`, () => {
    it(`should increment minor version`, async () => {
      // Arrange
      const
        input = "1.1.1",
        expected = "1.2.1";
      // Act
      const result = sut(input, "minor", false, 1);
      // Assert
      expect(result)
        .toEqual(expected);
    });

    it(`should zero others if required`, async () => {
      // Arrange
      const
        input = "1.1.2",
        expected = "1.2.0";
      // Act
      const result = sut(input, "minor", true, 1);
      // Assert
      expect(result)
        .toEqual(expected);
    });

    it(`should use provided increment`, async () => {
      // Arrange
      const
        input = "1.1.2",
        expected = "1.4.0";
      // Act
      const result = sut(input, "minor", true, 3);
      // Assert
      expect(result)
        .toEqual(expected);
    });
  });

  describe(`strategy: patch`, () => {
    it(`should increment patch version`, async () => {
      // Arrange
      const
        input = "1.1.1",
        expected = "1.1.2";
      // Act
      const result = sut(input, "patch", false, 1);
      // Assert
      expect(result)
        .toEqual(expected);
    });

    it(`should not care about zeros`, async () => {
      // Arrange
      const
        input = "1.1.2",
        expected = "1.1.3";
      // Act
      const result = sut(input, "patch", true, 1);
      // Assert
      expect(result)
        .toEqual(expected);
    });

    it(`should use provided increment`, async () => {
      // Arrange
      const
        input = "1.1.2",
        expected = "1.1.7";
      // Act
      const result = sut(input, "patch", true, 5);
      // Assert
      expect(result)
        .toEqual(expected);
    });
    describe(`when was prerelease`, () => {
      it(`should only drop the prerelease part`, async () => {
        // Arrange
        const
          input = "1.1.2-2301011112.abcdef0",
          expected = "1.1.2";
        // Act
        const result = sut(input, "patch", true, 1);
        // Assert
        expect(result)
          .toEqual(expected);
      });
    });
  });
});
