import * as esbuild from "esbuild-wasm";
import { BuilderContext } from "../builder";

export interface BuilderHook {
  beforeBuild(context: BuilderContext): Promise<void>;
  loadFile(context: BuilderContext, args: esbuild.OnLoadArgs): Promise<esbuild.OnLoadResult | undefined>;
  fileLoaded(context: BuilderContext, args: esbuild.OnLoadArgs, result: esbuild.OnLoadResult): Promise<void>;
}

export abstract class BuilderHookBase implements BuilderHook {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async beforeBuild(_context: BuilderContext): Promise<void> {}
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async loadFile(_context: BuilderContext, _args: esbuild.OnLoadArgs): Promise<esbuild.OnLoadResult | undefined> {
    return;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fileLoaded(_context: BuilderContext, _args: esbuild.OnLoadArgs, _result: esbuild.OnLoadResult): Promise<void> {}
}

export type Preset = HtmlPreset | BuilderPreset;
export type Files = Record<string, string | ((context: BuilderContext) => string | Uint8Array)>;

export interface HtmlPreset {
  kind: "html";
}

export interface BuilderPreset {
  kind: "builder";
  inject?: string[];
  entryPoints: string[];
  dependencies: Record<string, string>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tailwindConfig?: any;
  hooks?: BuilderHook[];
  files: Files;
  generateHtml(context: BuilderContext, buildResult: esbuild.BuildResult): string;
}
