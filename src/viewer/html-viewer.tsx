import { useEffect, useState } from "react";
import { HtmlPreset } from "../presets/types";

const INDEX_FILES = ["/index.html", "/index.htm"];

export interface HtmlViewerProps {
  preset: HtmlPreset;
  options?: Record<string, string | number | boolean>;
  files: Record<string, string>;
}

export default function HtmlViewer(props: HtmlViewerProps) {
  const [html, setHtml] = useState<string>();

  useEffect(() => {
    (async () => {
      for (const indexFile of INDEX_FILES) {
        if (props.files[indexFile]) {
          setHtml(props.files[indexFile]);
          return;
        }
      }

      setHtml(
        `<html><body><h1>No index file found, showing all files</h1>
          <ul>${Object.keys(props.files)
            .sort()
            .map((v) => `<li>${v}</li>`)
            .join("\n")}
          </ul>
        </body></html>`
      );
    })();
  }, [props.files]);

  return (
    <>
      {!html ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            height: "100%",
            gap: "0.2rem",
            padding: "1rem",
          }}
        >
          <div style={{ fontSize: "2.5rem" }}>&lt;loading /&gt;</div>
        </div>
      ) : (
        <iframe
          style={{ width: "100%", height: "100%", border: "none", margin: 0, padding: 0 }}
          sandbox="allow-scripts allow-modals allow-forms allow-modals allow-popups"
          srcDoc={html}
        />
      )}
    </>
  );
}
