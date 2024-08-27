import { BuilderUtils } from "../../src/builder/builder-utils";

describe("BuilderUtils", () => {
  describe("sleep", () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.spyOn(global, "setTimeout");
    });

    afterEach(() => {
      jest.useRealTimers();
      jest.restoreAllMocks();
    });

    it("should resolve after the specified time", async () => {
      const ms = 25000;
      const sleepPromise = BuilderUtils.sleep(ms);

      // Fast-forward until all timers have been executed
      jest.advanceTimersByTime(ms);

      await expect(sleepPromise).resolves.toBeUndefined();
    });

    it("should call setTimeout with the correct duration", () => {
      const ms = 25000;
      BuilderUtils.sleep(ms);

      expect(setTimeout).toHaveBeenCalledWith(expect.any(Function), ms);
    });
  });

  describe("runOnce", () => {
    beforeEach(() => {
      // Clear any global variables set by previous tests
      (global as any)._x_test_initialized = undefined;
      (global as any)._x_test_initializing = undefined;
    });

    it("should run the function only once", async () => {
      const mockFn = jest.fn().mockResolvedValue(undefined);

      await BuilderUtils.runOnce("test", mockFn);
      await BuilderUtils.runOnce("test", mockFn);
      await BuilderUtils.runOnce("test", mockFn);
      await BuilderUtils.runOnce("test", mockFn);

      expect(mockFn).toHaveBeenCalledTimes(1);
    });
  });

  describe("stripStart", () => {
    it("should strip a single string from the start", () => {
      const result = BuilderUtils.stripStart("Hello", "Hello, World!");
      expect(result).toBe(", World!");
    });

    it("should strip the first matching string from an array", () => {
      const result = BuilderUtils.stripStart(["Hi", "Hello"], "Hello, World!");
      expect(result).toBe(", World!");
    });

    it("should return the original string if no match is found", () => {
      const result = BuilderUtils.stripStart("Goodbye", "Hello, World!");
      expect(result).toBe("Hello, World!");
    });

    it("should handle empty strings", () => {
      const result = BuilderUtils.stripStart("", "Hello, World!");
      expect(result).toBe("Hello, World!");
    });
  });

  describe("stripEnd", () => {
    it("should strip a single string from the end", () => {
      const result = BuilderUtils.stripEnd("World!", "Hello, World!");
      expect(result).toBe("Hello, ");
    });

    it("should strip the first matching string from an array", () => {
      const result = BuilderUtils.stripEnd(["World!", "Universe!"], "Hello, World!");
      expect(result).toBe("Hello, ");
    });

    it("should return the original string if no match is found", () => {
      const result = BuilderUtils.stripEnd("Goodbye", "Hello, World!");
      expect(result).toBe("Hello, World!");
    });

    it("should handle empty strings", () => {
      const result = BuilderUtils.stripEnd("", "Hello, World!");
      expect(result).toBe("Hello, World!");
    });
  });
});
