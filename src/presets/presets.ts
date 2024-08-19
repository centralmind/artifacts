import { Preset } from "./types";
import { htmlPreset } from "./html-preset";
import { reactPreset } from "./react-preset";
import { vuePreset } from "./vue-preset";

export abstract class Presets {
  static HTML = htmlPreset;
  static REACT = reactPreset;
  static VUE = vuePreset;

  static autoDetect(files: Record<string, string>): Preset {
    if (Object.keys(files).some((file) => file.endsWith(".jsx") || file.endsWith(".tsx"))) {
      return Presets.REACT;
    }

    if (Object.keys(files).some((file) => file.endsWith(".vue"))) {
      return Presets.VUE;
    }

    return Presets.HTML;
  }
}
