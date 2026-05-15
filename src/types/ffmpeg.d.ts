export interface CustomSubStyle {
  /**
   * FontName: System fonts visible in the provided image.
   *
   * 'Comic Sans' - The friendly, casual handwritten look.
   * 'Open Sans' - Neutral, reliable, and highly readable.
   * 'Verdana' - Wide letter spacing, ideal for small screens.
   * 'Impact' - High energy, condensed, classic "meme" font.
   * 'Poppins' - Warm, round, ideal for lifestyle/vlogs.
   * 'Arial' - A safe, universally compatible default.
   * 'Inter' - The clean tech look, optimized for screens.
   * 'Roboto' - The efficient YouTube standard.
   * 'Montserrat' - The modern influencer look, popular in 2026.
   * 'Chiller' - Edgier, spooky style for specific themes.
   * 'Harrington Regular' - A distinctive, decorative serif font.
   * 'Consolas' - Monospaced, ideal for code snippets, technical text or netflix type fonts
   */
  fontName?:
    | "Comic Sans MS"
    | "Open Sans"
    | "Verdana"
    | "Impact"
    | "Poppins"
    | "Helvetica"
    | "Arial"
    | "Inter"
    | "Roboto"
    | "Montserrat"
    | "Chiller"
    | "Harrington"
    | "Consolas"
    | (string & {});

  fontSize?: number;

  /** Primary text color in BGR format (e.g., &H00FFFF for Yellow) */
  primaryColor?: string;

  /** Outline/Border color in BGR format (e.g., &H000000 for Black) */
  outlineColor?: string;

  /** Background box color (e.g., &H80000000 for Semi-Transparent Black) */
  backColor?: string;

  /** The thickness of the outline (0 to 4) */
  outline?: number;

  /**
   * Alignment (Numpad layout):
   * 1 = Bottom Left
   * 2 = Bottom Center (Standard)
   * 3 = Bottom Right
   * 4 = Middle Left
   * 5 = Middle Center (Absolute Center)
   * 6 = Middle Right
   * 7 = Top Left
   * 8 = Top Center
   * 9 = Top Right
   */
  alignment?: number;

  /**
   * BorderStyle:
   * 1 = Outline + Drop Shadow (Standard)
   * 3 = Opaque Box (Text sits inside a background rectangle)
   */
  borderStyle?: 1 | 3;

  /**
   * Vertical Margin: Moves text up from the bottom (if Alignment is 2).
   * Range: 0-100+ pixels. Essential to avoid Instagram/TikTok UI buttons.
   */
  marginV?: number;

  /**
   * Horizontal Margin: Padding from the left/right edges.
   */
  marginL?: number;
  marginR?: number;

  /** Letter Spacing: Adds space between characters for a modern look. */
  spacing?: number;

  /** Bold: 1 = Bold, 0 = Normal */
  bold?: 0 | 1;

  /** Italic: 1 = Italic, 0 = Normal */
  italic?: 0 | 1;

  /**
   * Shadow: Distance of the drop shadow.
   * Set to 0 if you only want a clean outline.
   */
  shadow?: number;
}

interface VideoMetadata {
  width: number;
  height: number;
  duration: number;
  codecName: string;
  bitRate: string;
}

interface ConvertSrtToAssResponse {
  assPath: string;
  height: string | number;
  width: string | number;
  bitrate: string;
  codec_name: string;
  duration: number;
}

interface MergeVideoWithSrtResponse {
  video_path: string;
  width: string | number;
  height: string | number;
  bitrate: string;
  codec_name: string;
  duration: number;
}

interface MergeVideoWithSrtStreamResponse {
  tempOutputPath: string;
  video_buffer?: Buffer;
  width: string | number;
  height: string | number;
  bitrate: string;
  codec_name: string;
  duration: number;
}

interface SubTiming {
  word: string;
  start: number;
  end: number;
  confidence?: number;
  punctuated_word?: string;
}

type AllSubTiming = SubTiming[];

export {
  CustomSubStyle,
  VideoMetadata,
  ConvertSrtToAssResponse,
  MergeVideoWithSrtResponse,
  MergeVideoWithSrtStreamResponse,
  SubTiming,
  AllSubTiming,
};
