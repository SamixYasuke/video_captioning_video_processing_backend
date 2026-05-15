import { CustomSubStyle } from "@/types/ffmpeg";
import { norm } from "./helper";

const assHeader = (
  fontNameToUse: string,
  customStyles: CustomSubStyle,
  width: string | number,
  height: string | number,
) => {
  const primaryColor = norm(customStyles.primaryColor, "&H0000FFFF");
  const outlineColor = norm(customStyles.outlineColor, "&H00000000");
  const backColor = norm(customStyles.backColor, "&H00000000");
  const marginV = customStyles.marginV ?? 40;
  const marginL = customStyles.marginL ?? 0;
  const marginR = customStyles.marginR ?? 0;

  return `[Script Info]
ScriptType: v4.00+
Title: LingoFrame Generated Subtitles
PlayResX: ${width}
PlayResY: ${height}
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: Default, ${fontNameToUse || "Arial Black"}, ${customStyles.fontSize ?? 42}, ${primaryColor}, &H00FFFFFF, ${outlineColor}, ${backColor}, ${customStyles.bold ?? 0}, ${customStyles.italic ?? 0}, 0, 0, 100, 100, ${customStyles.spacing ?? 0}, 0, ${customStyles.borderStyle ?? 1}, ${customStyles.outline ?? 2}, ${customStyles.shadow ?? 0}, ${customStyles.alignment ?? 2}, ${marginL}, ${marginR}, ${marginV}, 1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
};

export default assHeader;
