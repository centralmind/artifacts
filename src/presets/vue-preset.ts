import * as esbuild from "esbuild-wasm";
import { BuilderContext } from "../builder";
import { BuilderPreset } from "./types";
import { tailwindConfig } from "./tailwind-config";
import { Vue3CompilerHook } from "../builder/hooks/vue3-compiler-hook";

export const vuePreset: BuilderPreset = {
  kind: "builder",
  entryPoints: ["/main.ts"],
  tailwindConfig,
  hooks: [new Vue3CompilerHook()],
  dependencies: {
    vue: "3.4.38",
    entities: "4.5.0",
  },
  files: {
    "/style.css": "",
    "/App.vue": `<template><div><h1>The application is empty.</h1></div></template>`,
    "/main.ts": `import { createApp } from 'vue'
import './style.css'
import App from './App.vue'

createApp(App).mount('#app')
`,
  },
  generateHtml: (context: BuilderContext, buildResult: esbuild.BuildResult) => {
    const scripts: string[] = [];
    const styles: string[] = [];
    const tailwindConfigScript = context.preset.tailwindConfig
      ? `<script>tailwind.config = ${JSON.stringify(tailwindConfig)};</script>`
      : "";

    for (const file of buildResult.outputFiles ?? []) {
      if (file.path.endsWith(".js")) {
        scripts.push(`<script>${file.text}</script>`);
      } else if (file.path.endsWith(".css")) {
        styles.push(`<style>${file.text}</style>`);
      }
    }

    return `
        <html>
          <head>
            <title></title>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <script src="https://cdn.tailwindcss.com?plugins=forms,typography,aspect-ratio,container-queries"></script>
            ${tailwindConfigScript}
            <style>html,body,#root {height: 100%;}</style>
            ${styles.join("\n")}
          </head>
          <body>
            <div id="app"></div>
            ${scripts.join("\n")}
          </body>
        </html>
      `;
  },
};
