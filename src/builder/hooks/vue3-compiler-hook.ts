import * as esbuild from "esbuild-wasm";
import * as sfc from "@vue/compiler-sfc";
import { BuilderHookBase } from "../../presets/types";
import { BuilderContext } from "../builder";
import { BuilderUtils } from "../builder-utils";

export interface VuePluginData {
  id: string;
  descriptor: sfc.SFCDescriptor;
  script?: sfc.SFCScriptBlock;
}

export class Vue3CompilerHook extends BuilderHookBase {
  override async loadFile(
    _context: BuilderContext,
    args: esbuild.OnLoadArgs
  ): Promise<esbuild.OnLoadResult | undefined> {
    if (args.path.includes(".vue?")) {
      return await this.loadVueContent(args);
    }

    return;
  }

  override async fileLoaded(
    _context: BuilderContext,
    args: esbuild.OnLoadArgs,
    result: esbuild.OnLoadResult
  ): Promise<void> {
    if (!args.path.endsWith(".vue")) {
      return;
    }

    const contents = BuilderUtils.contentsToString(result.contents ?? "");
    const encPath = args.path.replace(/\\/g, "\\\\");
    const renderFuncName = "render";

    const { descriptor } = sfc.parse(contents, {
      filename: args.path,
    });

    const id = await BuilderUtils.hashString(args.path);
    const script = descriptor.script || descriptor.scriptSetup ? sfc.compileScript(descriptor, { id }) : undefined;

    let code = "";
    const dataId = "data-v-" + id;

    if (descriptor.script || descriptor.scriptSetup) {
      const src = (descriptor.script && !descriptor.scriptSetup && descriptor.script.src) || encPath;
      code += `import script from "${src}?type=script";`;
    } else {
      code += "const script = {};";
    }

    for (const style in descriptor.styles) {
      code += `import "${encPath}?type=style&index=${style}";`;
    }

    code += `import { ${renderFuncName} } from "${encPath}?type=template"; script.${renderFuncName} = ${renderFuncName};`;

    code += `script.__file = ${JSON.stringify(args.path)};`;
    if (descriptor.styles.some((o) => o.scoped)) {
      code += `script.__scopeId = ${JSON.stringify(dataId)};`;
    }

    code += "export default script;";
    const pluginData: VuePluginData = { id: dataId, descriptor, script };

    result.contents = code;
    result.pluginData = pluginData;
  }

  private async loadVueContent(args: esbuild.OnLoadArgs): Promise<esbuild.OnLoadResult | undefined> {
    const { descriptor, id, script } = args.pluginData as VuePluginData;
    const queryString = args.path.split("?")[1];
    const params = new URLSearchParams(queryString);
    const type = params.get("type");

    if (type === "script") {
      if (script) {
        const code = script.content;

        return {
          contents: code,
          loader: script.lang === "ts" ? "ts" : "js",
        };
      }
    } else if (type == "template") {
      if (!descriptor.template) {
        throw new Error("No template found");
      }

      const source = descriptor.template.content;

      const result = sfc.compileTemplate({
        id,
        source,
        filename: args.path,
        scoped: descriptor.styles.some((o) => o.scoped),
        slotted: descriptor.slotted,
        ssrCssVars: [],
        isProd: true,
        compilerOptions: {
          bindingMetadata: script?.bindings,
        },
      });

      if (result.errors.length > 0) {
        return {
          errors: result.errors.map<esbuild.PartialMessage>((o) =>
            typeof o === "string"
              ? { text: o }
              : {
                  text: o.message,
                  location: o.loc && {
                    column: o.loc.start.column,
                    file: descriptor.filename,
                    line: o.loc.start.line + descriptor.template!.loc.start.line + 1,
                    lineText: o.loc.source,
                  },
                }
          ),
        };
      }

      return {
        contents: result.code,
        warnings: result.tips.map((o) => ({ text: o })),
        loader: "ts",
      };
    } else if (type === "style") {
      const index = parseInt(params.get("index") ?? "0", 10);
      const style: sfc.SFCStyleBlock | undefined = descriptor.styles[index];

      if (!style) {
        throw new Error(`Style block ${index} not found`);
      }

      const result = await sfc.compileStyleAsync({
        filename: args.path,
        id,
        source: style.content,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        preprocessLang: style.lang as any,
        scoped: style.scoped,
      });

      if (result.errors.length > 0) {
        const errors = result.errors as (Error & { column: number; line: number; file: string })[];

        return {
          errors: errors.map((o) => ({
            text: o.message,
            location: {
              column: o.column,
              line: o.file === args.path ? style.loc.start.line + o.line - 1 : o.line,
              file: o.file.replace(/\?.*?$/, ""),
              namespace: "file",
            },
          })),
        };
      }

      return {
        contents: result.code,
        loader: "css",
      };
    }

    return;
  }
}
