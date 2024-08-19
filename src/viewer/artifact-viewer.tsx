import { Preset } from "../presets/types";
import { Presets } from "../presets/presets";
import HtmlViewer from "./html-viewer";
import BuilderViewer from "./builder-viewer";

export interface ArtifactViewerProps {
  preset?: Preset;
  options?: Record<string, string | number | boolean>;
  files: Record<string, string>;
}

export function ArtifactViewer(props: ArtifactViewerProps) {
  const preset = props.preset ?? Presets.autoDetect(props.files);

  return (
    <div style={{ width: "100%", height: "100%", boxSizing: "border-box" }} className="artifact_container">
      {preset.kind === "html" && <HtmlViewer preset={preset} options={props.options} files={props.files} />}
      {preset.kind === "builder" && <BuilderViewer preset={preset} options={props.options} files={props.files} />}
    </div>
  );
}
