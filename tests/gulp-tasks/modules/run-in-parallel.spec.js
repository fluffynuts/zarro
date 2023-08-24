"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("expect-even-more-jest");
describe(`concurrency-limiter`, () => {
    const sut = requireModule("run-in-parallel");
    const sleep = requireModule("sleep");
    const seed = requireModule("seed");
    it(`should run 1 job at a time when concurrency is 1`, async () => {
        // Arrange
        const current = [];
        let calls = 0;
        // Act
        await sut(1, async () => {
            current.push(1);
            calls++;
            await sleep(1000);
            expect(current)
                .toEqual([1]);
            current.splice(0, 1);
        }, async () => {
            current.push(2);
            calls++;
            await sleep(1000);
            expect(current)
                .toEqual([2]);
            current.splice(0, 1);
        });
        // Assert
        expect(calls)
            .toEqual(2);
    });
    it(`should run all the jobs without exceeding maxConcurrency`, async () => {
        // Arrange
        const active = new Set();
        let calls = 0;
        let maxActive = 0;
        const concurrency = 8;
        const total = 32;
        const tasks = seed(total).map((_, idx) => {
            return async () => {
                calls++;
                active.add(idx);
                maxActive = Math.max(maxActive, active.size);
                await sleep(100);
                active.delete(idx);
            };
        });
        // Act
        await sut(concurrency, ...tasks);
        // Assert
        expect(calls)
            .toEqual(total);
        expect(maxActive)
            .toEqual(concurrency);
    });
});
