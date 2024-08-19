import * as esbuild from "esbuild-wasm";
import { BuilderUtils } from "./builder-utils";
import { BuilderConstants } from "./builder-constants";
import { BuilderCache } from "./builder-cache";
import { BuilderPreset, Files } from "../presets/types";

export interface CreateSessionOptions {
  cache: BuilderCache;
  preset: BuilderPreset;
  options?: Record<string, string | number | boolean>;
  files: Files;
  progress?: (filesProcessed: number) => void;
}

export interface BuilderContext {
  cache: BuilderCache;
  preset: BuilderPreset;
  includes: string[];
  state: Record<string, string | number | boolean>;
  files: Files;
  buildResult?: esbuild.BuildResult;
  errors?: string[];
}

export class Builder {
  protected constructor(
    protected _context: BuilderContext,
    protected _progress?: (progress: number) => void
  ) {}

  static async createSession(options: CreateSessionOptions) {
    await BuilderUtils.runOnce("esbuild", async () =>
      esbuild.initialize({
        wasmURL: BuilderConstants.WASM_URL,
        worker: true,
      })
    );

    const context: BuilderContext = {
      cache: options.cache,
      preset: options.preset,
      includes: [],
      state: { ...options.options },
      files: { ...options.preset.files, ...options.files },
    };

    return new Builder(context, options.progress);
  }

  async build() {
    for (const hook of this._context.preset.hooks ?? []) {
      await hook.beforeBuild(this._context);
    }

    const errors: string[] = [];
    let buildResult: esbuild.BuildResult | undefined;

    try {
      buildResult = await esbuild.build({
        bundle: true,
        write: false,
        minify: true,
        target: ["es2020"],
        outfile: "bundle.js",
        platform: "browser",
        jsxFragment: "React.Fragment",
        jsxFactory: "React.createElement",
        inject: this._context.preset.inject,
        entryPoints: this._context.preset.entryPoints,
        plugins: [this.getVFSPlugin()],
        loader: {
          ".svg": "dataurl",
          ".jpg": "dataurl",
          ".jpeg": "dataurl",
          ".png": "dataurl",
          ".woff": "dataurl",
        },
        define: {
          "process.env.NODE_ENV": '"production"',
        },
      });
    } catch (error: unknown) {
      if (typeof error === "object") {
        const buildErrors = (error as { errors: esbuild.Message[] }).errors.map(
          (error) => `[${error.location?.file}:${error.location?.line}:${error.location?.column}] ${error.text}`
        );
        const buildWarnings = (error as { warnings: esbuild.Message[] }).warnings.map(
          (warning) =>
            `[${warning.location?.file}:${warning.location?.line}:${warning.location?.column}] ${warning.text}`
        );
        buildErrors.forEach((error) => console.error(error));
        buildWarnings.forEach((warning) => console.warn(warning));

        errors.push(...buildErrors);
      } else if (error instanceof Error) {
        console.error(error.message);
        errors.push(error.message);
      } else {
        console.error("An unknown error occurred:", error);
        errors.push("An unknown error occurred");
      }
    }

    if (buildResult) {
      buildResult.errors.forEach((error) => console.error(error));
      buildResult.warnings.forEach((warning) => console.warn(warning));
    }

    this._context.errors = errors;
    this._context.buildResult = buildResult;

    return { buildResult, errors };
  }

  async generateHtml() {
    const buildResult = this._context.buildResult;

    if (buildResult) {
      const html = this._context.preset.generateHtml(this._context, buildResult);
      const hash = await BuilderUtils.hashString(html);

      return { html, hash };
    }

    return { html: "", hash: "" };
  }

  private getVFSPlugin(): esbuild.Plugin {
    const {
      cache: { packageManager },
      preset,
      files,
    } = this._context;
    const paths = new Set(Object.keys(files));
    let filesProcessed = 0;
    this._progress?.(filesProcessed);

    const onResolve = async (args: esbuild.OnResolveArgs): Promise<esbuild.OnResolveResult | undefined> => {
      if (args.path.startsWith("data:")) return;

      const basePath = BuilderUtils.getBasePath(
        BuilderUtils.resolve(args.importer, [paths, packageManager.paths]) ?? args.importer
      );

      let path = (await packageManager.processPath(preset.dependencies, args.path)) ?? args.path;

      if (args.path.startsWith("./") || args.path.startsWith("../")) {
        path = new URL(args.path, `file://${basePath}/`).pathname;
      } else if (path.startsWith("@/")) {
        path = BuilderUtils.stripStart("@", path);
      }

      path = BuilderUtils.resolve(path, [paths, packageManager.paths]) ?? path;

      filesProcessed += 1;
      this._progress?.(filesProcessed);

      return { path, pluginData: { ...args.pluginData } };
    };

    const onLoad = async (args: esbuild.OnLoadArgs): Promise<esbuild.OnLoadResult | undefined> => {
      const loader = BuilderUtils.getLoader(args.path);
      let retValue: esbuild.OnLoadResult | undefined;

      if (preset.hooks) {
        for (const hook of preset.hooks) {
          const hookResult = await hook.loadFile(this._context, args);
          if (hookResult) {
            retValue = hookResult;
            break;
          }
        }
      }

      if (typeof retValue === "undefined" && typeof files[args.path] !== "undefined") {
        const value = files[args.path];
        if (typeof value === "function") {
          retValue = { contents: value(this._context), loader };
        } else {
          retValue = { contents: value, loader };
        }
      }

      if (typeof retValue === "undefined" && args.path.startsWith("/node_modules/")) {
        const contents = await packageManager.loadFile(this._context, args.path);
        if (contents) {
          retValue = { contents, loader };
        }
      }

      if (typeof retValue !== "undefined") {
        for (const hook of preset.hooks ?? []) {
          await hook.fileLoaded(this._context, args, retValue);
        }

        filesProcessed += 1;
        this._progress?.(filesProcessed);

        return retValue;
      }

      return;
    };

    return {
      name: "virtual-file-system",
      setup(build) {
        build.onResolve({ filter: /.*/ }, onResolve);
        build.onLoad({ filter: /.*/ }, onLoad);
      },
    };
  }
}
