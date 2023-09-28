import "expect-even-more-jest";
import { faker } from "@faker-js/faker";

describe(`log`, () => {
  const log = requireModule<Log>("log");
  describe(`when threshold at or lower than log level`, () => {
    beforeEach(() => {
      log.setThreshold(log.LogLevels.Info);
      log.showTimestamps();
    });

    const testCases = [
      { fn: "fail", level: log.LogLevels.Error },
      { fn: "fail", level: log.LogLevels.Warning },
      { fn: "fail", level: log.LogLevels.Notice },
      { fn: "fail", level: log.LogLevels.Info },
      { fn: "fail", level: log.LogLevels.Debug },

      { fn: "error", level: log.LogLevels.Error },
      { fn: "error", level: log.LogLevels.Warning },
      { fn: "error", level: log.LogLevels.Notice },
      { fn: "error", level: log.LogLevels.Info },
      { fn: "error", level: log.LogLevels.Debug },

      { fn: "warn", level: log.LogLevels.Warning },
      { fn: "warn", level: log.LogLevels.Notice },
      { fn: "warn", level: log.LogLevels.Info },
      { fn: "warn", level: log.LogLevels.Debug },

      { fn: "warning", level: log.LogLevels.Warning },
      { fn: "warning", level: log.LogLevels.Notice },
      { fn: "warning", level: log.LogLevels.Info },
      { fn: "warning", level: log.LogLevels.Debug },

      { fn: "notice", level: log.LogLevels.Notice },
      { fn: "notice", level: log.LogLevels.Info },
      { fn: "notice", level: log.LogLevels.Debug },

      { fn: "info", level: log.LogLevels.Info },
      { fn: "info", level: log.LogLevels.Debug },

      { fn: "debug", level: log.LogLevels.Debug },
    ] as ({fn: keyof Logger, level: number })[];
    testCases.forEach(testCase => {
        const {
          fn,
          level
        } = testCase;
        it(`should output for log.${ fn } when threshold is ${ level }`, async () => {
          // Arrange
          spyOn(console, "log").and.stub();
          const
            expected = faker.word.words(),
            method = (log as any)[fn];
          expect(method)
            .toExist();
          const sut = method.bind(log);
          log.setThreshold(level);
          log.suppressTimestamps();
          // Act
          sut(expected);
          // Assert
          expect(console.log)
            .toHaveBeenCalledWith(
              expect.stringContaining(expected)
            );
        });
      });
  });

  describe(`when threshold higher than log level`, () => {
    beforeEach(() => {
      log.setThreshold(log.LogLevels.Info);
      log.showTimestamps();
    });

    const testCases = [
      { fn: "warn", level: log.LogLevels.Error },

      { fn: "warning", level: log.LogLevels.Error },

      { fn: "notice", level: log.LogLevels.Warning },
      { fn: "notice", level: log.LogLevels.Error },

      { fn: "info", level: log.LogLevels.Warning },
      { fn: "info", level: log.LogLevels.Error },
      { fn: "info", level: log.LogLevels.Notice },

      { fn: "debug", level: log.LogLevels.Error },
      { fn: "debug", level: log.LogLevels.Warning  },
      { fn: "debug", level: log.LogLevels.Notice },
      { fn: "debug", level: log.LogLevels.Info },
    ] as ({fn: keyof Logger, level: number })[];
    testCases.forEach(testCase => {
        const {
          fn,
          level
        } = testCase;
        it(`should not output for log.${ fn } when threshold is ${ level }`, async () => {
          // Arrange
          spyOn(console, "log").and.stub();
          const
            expected = faker.word.words(),
            method = (log as any)[fn];
          expect(method)
            .toExist();
          const sut = method.bind(log);
          log.setThreshold(level);
          log.suppressTimestamps();
          // Act
          sut(expected);
          // Assert
          expect(console.log)
            .not.toHaveBeenCalledWith(
              expect.stringContaining(expected)
            );
        });
      });
  });
});
