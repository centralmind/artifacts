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
});
