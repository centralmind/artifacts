import * as esbuild from "esbuild-wasm";
import { tailwindConfig } from "./tailwind-config";
import { BuilderPreset } from "./types";
import { ShadcnHook } from "../builder/hooks/shadcn-hook";
import { BuilderContext } from "../builder";

export const reactPreset: BuilderPreset = {
  kind: "builder",
  inject: ["/.misc/react-shim.ts"],
  entryPoints: ["/main.tsx"],
  tailwindConfig,
  hooks: [new ShadcnHook({ theme: "default", version: "0.8.0" })],
  dependencies: {
    react: "18.3.1",
    "react-dom": "18.3.1",
  },
  files: {
    "/.misc/react-shim.ts": `import * as React from "react"; export { React };`,
    "/main.css": "",
    "/app.tsx": `export default function App() { return (<div><h1>The application is empty.</h1><h2>File /app.tsx not found</h2></div>); }`,
    "/main.tsx": (context: BuilderContext) => {
      const includes = context.includes.map((path) => `import '${path}';`).join("\n");

      return `import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './app';
import './main.css';
${includes}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
`;
    },
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
            <div id="root"></div>
            ${scripts.join("\n")}
          </body>
        </html>
      `;
  },
};
