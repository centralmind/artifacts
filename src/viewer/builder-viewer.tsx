import { useEffect, useState } from "react";
import { Builder } from "../builder/builder";
import { BuilderPreset } from "../presets/types";
import { BuilderCache } from "../builder/builder-cache";

export interface BuilderViewerProps {
  files: Record<string, string>;
  options?: Record<string, string | number | boolean>;
  preset: BuilderPreset;
}

export default function BuilderViewer(props: BuilderViewerProps) {
  const [cache] = useState(() => new BuilderCache());
  const [errors, setErrors] = useState<string[]>([]);
  const [progress, setProgress] = useState<number>(0);
  const [html, setHtml] = useState<string>();
  const [htmlHash, setHtmlHash] = useState("");

  useEffect(() => {
    (async () => {
      setHtml(undefined);
      setErrors([]);

      const session = await Builder.createSession({
        cache,
        preset: props.preset,
        options: props.options,
        files: props.files,
        progress: setProgress,
      });

      const { errors } = await session.build();
      const { html, hash } = await session.generateHtml();

      setErrors(errors);
      setHtml(html);
      setHtmlHash(hash);
    })();
  }, [cache, props.files, props.options, props.preset]);

  if (errors.length > 0) {
    return (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: "0.2rem",
          padding: "1rem",
        }}
      >
        <div style={{ fontSize: "2.5rem" }}>Build Error</div>
        <div>
          {errors.map((error, index) => (
            <div key={index}>{error}</div>
          ))}
        </div>
      </div>
    );
  }

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
          <div style={{ fontSize: "2rem" }}>processed {progress} files</div>
        </div>
      ) : (
        <iframe
          key={htmlHash}
          style={{ width: "100%", height: "100%", border: "none", margin: 0, padding: 0 }}
          sandbox="allow-scripts allow-modals allow-forms allow-modals allow-popups"
          srcDoc={html}
        />
      )}
    </>
  );
}
