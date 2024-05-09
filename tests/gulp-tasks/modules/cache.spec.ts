import "expect-even-more-jest";
import { faker } from "@faker-js/faker";

describe(`cache`, () => {
  const cache = requireModule<Cache>("cache");
  const sleep = requireModule<Sleep>("sleep");
  it(`should export a cache instance`, async () => {
    // Arrange
    // Act
    expect(cache)
      .toExist();
    expect(cache.read)
      .toBeFunction();
    expect(cache.write)
      .toBeFunction();
    expect(cache.through)
      .toBeFunction();
    expect(cache.throughSync)
      .toBeFunction();
    expect(cache.create)
      .toBeFunction();
    // Assert
  });

  describe(`create`, () => {
    it(`should create a new cache`, async () => {
      // Arrange
      // Act
      const result1 = cache.create();
      const result2 = cache.create();
      // Assert
      expect(result1.constructor)
        .toBe(cache.constructor);
      expect(result2.constructor)
        .toBe(cache.constructor);
      expect(result1)
        .not.toBe(result2);
    });
  });

  describe(`read and write`, () => {
    it(`should write and read within ttl time`, async () => {
      // Arrange
      const
        sut = cache.create(),
        key = faker.string.alphanumeric(),
        value = faker.number.int();
      // Act
      sut.write(key, value, 120);
      const result = sut.read<number>(key);
      // Assert
      expect(result)
        .toEqual(value);
    });

    it(`should not return an expired value`, async () => {
      // Arrange
      const
        sut = cache.create(),
        key = faker.string.alphanumeric(),
        originalValue = 420,
        fallbackValue = 69;
      // Act
      sut.write(key, originalValue, 0.1);
      await sleep(200);
      const result = sut.read<number>(key, fallbackValue);
      // Assert
      expect(result)
        .toEqual(fallbackValue);
    });
  });

  describe(`through`, () => {
    describe(`synchronous variant`, () => {
      it(`should only call the function once when invoked within ttl`, async () => {
        // Arrange
        let calls = 0;
        const
          sut = cache.create(),
          key = faker.string.alphanumeric(),
          expected = faker.number.int(),
          generator = () => {
            calls++;
            return expected;
          }
        // Act
        const result1 = sut.throughSync(key, generator, 5);
        const result2 = sut.throughSync(key, generator, 5);
        // Assert
        expect(result1)
          .toEqual(expected);
        expect(result2)
          .toEqual(expected);
        expect(calls)
          .toEqual(1);
      });

      it(`should call again if invoked outside ttl`, async () => {
        // Arrange
        let calls = 0;
        const
          sut = cache.create(),
          key = faker.string.alphanumeric(),
          expected = faker.number.int(),
          generator = () => {
            calls++;
            return expected;
          }
        // Act
        const result1 = sut.throughSync(key, generator, 0.2);
        await sleep(500);
        const result2 = sut.throughSync(key, generator, 0.2);
        // Assert
        expect(result1)
          .toEqual(expected);
        expect(result2)
          .toEqual(expected);
        expect(calls)
          .toEqual(2);
      });
    });
    describe(`async variant`, () => {
      it(`should only call the function once when invoked within ttl`, async () => {
        // Arrange
        let calls = 0;
        const
          sut = cache.create(),
          key = faker.string.alphanumeric(),
          expected = faker.number.int(),
          generator = async () => {
            calls++;
            await sleep(1);
            return expected;
          }
        // Act
        const result1 = await sut.through(key, generator, 5);
        const result2 = await sut.through(key, generator, 5);
        // Assert
        expect(result1)
          .toEqual(expected);
        expect(result2)
          .toEqual(expected);
        expect(calls)
          .toEqual(1);
      });

      it(`should call again if invoked outside ttl`, async () => {
        // Arrange
        let calls = 0;
        const
          sut = cache.create(),
          key = faker.string.alphanumeric(),
          expected = faker.number.int(),
          generator = async () => {
            calls++;
            await sleep(1);
            return expected;
          }
        // Act
        const result1 = await sut.through(key, generator, 0.2);
        await sleep(500);
        const result2 = await sut.through(key, generator, 0.2);
        // Assert
        expect(result1)
          .toEqual(expected);
        expect(result2)
          .toEqual(expected);
        expect(calls)
          .toEqual(2);
      });
    });
  });
});
