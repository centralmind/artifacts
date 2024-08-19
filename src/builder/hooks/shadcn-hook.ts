import * as esbuild from "esbuild-wasm";
import { BuilderConstants } from "../builder-constants";
import { BuilderUtils } from "../builder-utils";
import { BuilderContext } from "../builder";
import { BuilderHookBase } from "../../presets/types";

export type ShadcnTheme = "default" | "new-york";
const STATE_SHADCN_ENABLED = "shadcn/enabled";
const STATE_SHADCN_THEME = "shadcn/theme";

export interface ShadcnHookOptions {
  theme?: ShadcnTheme;
  version?: string;
}

export class ShadcnHook extends BuilderHookBase {
  private _theme: ShadcnTheme;
  private _version: string;

  constructor(protected _options?: ShadcnHookOptions) {
    super();

    this._theme = _options?.theme ?? "default";

    let version = _options?.version ?? "latest";
    if (version === "latest") {
      version = "master";
    } else {
      version = `shadcn-ui@${version}`;
    }
    this._version = version;
  }

  override async beforeBuild(context: BuilderContext): Promise<void> {
    let enabled = false;

    const files = Object.entries(context.files).filter(([key]) => key.endsWith(".tsx") || key.endsWith(".jsx"));
    for (const [, value] of files) {
      if (typeof value === "function") {
        continue;
      }

      if (value.includes("/components/ui/")) {
        enabled = true;
        break;
      }
    }

    context.state[STATE_SHADCN_ENABLED] = enabled;
    if (enabled) {
      context.files["/globals.css"] = this.getStyles();
      context.includes.push("/globals.css");
    }
  }

  override async loadFile(
    context: BuilderContext,
    args: esbuild.OnLoadArgs
  ): Promise<esbuild.OnLoadResult | undefined> {
    const theme = context.state[STATE_SHADCN_THEME] ?? this._theme;
    let path = args.path;

    const componentsPrefix = "/components/ui/";
    const registryPrefix = `/registry/${theme}/ui/`;
    const libPrefix = "/lib/";

    if (path.startsWith(componentsPrefix) || path.startsWith(registryPrefix)) {
      path = BuilderUtils.stripStart(componentsPrefix, path);
      path = BuilderUtils.stripStart(registryPrefix, path);
      const componentsBase = `shadcn-ui/ui@${this._version}/apps/www/registry/${theme}/ui`;
      const url = `${BuilderConstants.CDN_BASE_GH}/${componentsBase}/${path}.tsx`;
      let data = context.cache.get(url);

      if (!data) {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch package: ${response.url}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        data = new Uint8Array(arrayBuffer);
        context.cache.set(url, data);
      }

      return { contents: data, loader: "tsx" };
    } else if (path.startsWith(libPrefix)) {
      path = BuilderUtils.stripStart(libPrefix, path);
      const componentsBase = `shadcn-ui/ui@${this._version}/apps/www/lib`;
      const url = `${BuilderConstants.CDN_BASE_GH}/${componentsBase}/${path}.ts`;

      let data = context.cache.get(url);

      if (!data) {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Failed to fetch package: ${response.url}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        data = new Uint8Array(arrayBuffer);
        context.cache.set(url, data);
      }

      return { contents: data, loader: "ts" };
    }

    return;
  }

  private getStyles() {
    return `
@layer base {
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 47.4% 11.2%;

  --muted: 210 40% 96.1%;
  --muted-foreground: 215.4 16.3% 46.9%;

  --popover: 0 0% 100%;
  --popover-foreground: 222.2 47.4% 11.2%;

  --border: 214.3 31.8% 91.4%;
  --input: 214.3 31.8% 91.4%;

  --card: 0 0% 100%;
  --card-foreground: 222.2 47.4% 11.2%;

  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;

  --secondary: 210 40% 96.1%;
  --secondary-foreground: 222.2 47.4% 11.2%;

  --accent: 210 40% 96.1%;
  --accent-foreground: 222.2 47.4% 11.2%;

  --destructive: 0 100% 50%;
  --destructive-foreground: 210 40% 98%;

  --ring: 215 20.2% 65.1%;

  --radius: 0.5rem;
}

.dark {
  --background: 224 71% 4%;
  --foreground: 213 31% 91%;

  --muted: 223 47% 11%;
  --muted-foreground: 215.4 16.3% 56.9%;

  --accent: 216 34% 17%;
  --accent-foreground: 210 40% 98%;

  --popover: 224 71% 4%;
  --popover-foreground: 215 20.2% 65.1%;

  --border: 216 34% 17%;
  --input: 216 34% 17%;

  --card: 224 71% 4%;
  --card-foreground: 213 31% 91%;

  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 1.2%;

  --secondary: 222.2 47.4% 11.2%;
  --secondary-foreground: 210 40% 98%;

  --destructive: 0 63% 31%;
  --destructive-foreground: 210 40% 98%;

  --ring: 216 34% 17%;

  --radius: 0.5rem;
}
}
 
@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}`;
  }
}
