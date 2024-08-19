export abstract class BuilderConstants {
  static readonly WASM_URL = "https://cdn.jsdelivr.net/npm/esbuild-wasm@0.23.0/esbuild.wasm";
  static readonly CDN_BASE_DATA = "https://data.jsdelivr.com/v1/package/npm";
  static readonly CDN_BASE_NPM = "https://cdn.jsdelivr.net/npm";
  static readonly CDN_BASE_GH = "https://cdn.jsdelivr.net/gh";
  static readonly SUFFIXES = [
    ".ts",
    ".tsx",
    ".js",
    ".jsx",
    ".mjs",
    ".d.ts",
    "/index.ts",
    "/index.tsx",
    "/index.js",
    "/index.mjs",
    "/index.jsx",
    "/index.d.ts",
  ];
}