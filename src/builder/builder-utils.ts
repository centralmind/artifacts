import * as esbuild from "esbuild-wasm";
import { BuilderConstants } from "./builder-constants";

export abstract class BuilderUtils {
  static async sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  static async runOnce(key: string, fn: () => Promise<void>) {
    const global = globalThis as unknown as {
      [key: string]: boolean;
    };

    const getInitialized = () => global[`_x_${key}_initialized`];
    const getInitializing = () => global[`_x_${key}_initializing`];
    const setInitialized = (initialized: boolean) => (global[`_x_${key}_initialized`] = initialized);
    const setInitializing = (initializing: boolean) => (global[`_x_${key}_initializing`] = initializing);

    if (getInitialized()) return;
    if (getInitializing()) {
      await new Promise((resolve) => {
        const interval = setInterval(() => {
          if (!getInitializing()) {
            clearInterval(interval);
            resolve(null);
          }
        }, 5);
      });
    }

    if (getInitialized()) return;
    setInitializing(true);

    if (fn) {
      await fn();
    }

    setInitialized(true);
    setInitializing(false);
  }

  static stripStart(start: string | string[], str: string) {
    const starts = Array.isArray(start) ? start : [start];
    return starts.reduce((s, val) => (val && s.startsWith(val) ? s.slice(val.length) : s), str);
  }

  static stripEnd(end: string | string[], str: string) {
    const ends = Array.isArray(end) ? end : [end];
    return ends.reduce((s, val) => (val && s.endsWith(val) ? s.slice(0, -val.length) : s), str);
  }

  static async hashString(input: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(input);
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");

    return hashHex;
  }

  static contentsToString(contents: string | Uint8Array) {
    if (contents instanceof Uint8Array) {
      return new TextDecoder().decode(contents);
    }

    return contents;
  }

  static resolve(path: string, sets: Set<string> | Set<string>[]) {
    if (!Array.isArray(sets)) {
      sets = [sets];
    }

    for (const paths of sets) {
      if (paths.has(path)) {
        return path;
      }

      const stripped = BuilderUtils.stripEnd("/", path);
      for (const suffix of BuilderConstants.DEFAULT_SUFFIXES) {
        const current = `${stripped}${suffix}`;

        if (paths.has(current)) {
          return current;
        }
      }
    }

    return null;
  }

  static getBasePath(path: string) {
    const lastSlashIndex = path.lastIndexOf("/");
    const lastDotIndex = path.lastIndexOf(".");

    if (lastDotIndex === -1 || lastDotIndex < lastSlashIndex) {
      return path;
    }

    const retValue = lastSlashIndex !== -1 ? path.substring(0, lastSlashIndex) : "";
    return retValue;
  }

  static isPackagePath(path: string) {
    if (path.startsWith("./") || path.startsWith("../") || path.startsWith("/") || path.startsWith("@/")) {
      return false;
    }

    return true;
  }

  static getPackageName(path: string) {
    path = BuilderUtils.stripStart("/node_modules/", path);
    const isPackagePath = BuilderUtils.isPackagePath(path);
    if (!isPackagePath) {
      return { packageName: null, packagePath: null };
    }

    const parts = path.split("/");
    let packageName = parts.shift();
    if (packageName?.startsWith("@")) {
      const packageNameInner = parts.shift();
      packageName = `${packageName}/${packageNameInner}`;
    }

    let packagePath = parts.join("/");
    if (packagePath.length > 0) {
      packagePath = `/${packagePath}`;
    }

    return { packageName, packagePath };
  }

  static getFileName(path: string) {
    const lastSlashIndex = path.lastIndexOf("/");

    if (lastSlashIndex === -1) {
      return { base: "", fileName: path };
    }

    const fileName = path.substring(lastSlashIndex + 1);
    const base = path.substring(0, lastSlashIndex);

    return { base, fileName };
  }

  static getLoader(path: string): esbuild.Loader {
    path = path.toLowerCase();

    if (path.endsWith(".ts")) return "ts";
    if (path.endsWith(".d.ts")) return "ts";
    if (path.endsWith(".tsx")) return "tsx";
    if (path.endsWith(".js")) return "js";
    if (path.endsWith(".jsx")) return "jsx";
    if (path.endsWith(".json")) return "json";
    if (path.endsWith(".css")) return "css";
    if (path.endsWith(".scss")) return "css";
    if (path.endsWith(".vue")) return "ts";

    return "tsx";
  }
}
