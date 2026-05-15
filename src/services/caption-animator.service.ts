import { DeepgramResponse } from "@/types/deepgram";
import {
  EntranceAnimation,
  ExitAnimation,
  AnimationMode,
} from "@/types/animations";

class CaptionAnimator {
  private hexToAss(hex: string): string {
    const clean = hex.replace("#", "");
    const r = clean.slice(0, 2);
    const g = clean.slice(2, 4);
    const b = clean.slice(4, 6);
    return `&H${b}${g}${r}`.toUpperCase();
  }

  private inlineColor(color?: string, def: string = "&HFFFFFF&"): string {
    if (!color) return def;
    const clean = color.replace("&H", "").replace("&", "");
    const bgr = clean.length === 8 ? clean.slice(2) : clean;
    return `&H${bgr.toUpperCase()}&`;
  }

  private toASS(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    const cs = Math.floor((seconds * 100) % 100);
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
  }

  private formatDialogue(start: number, end: number, text: string): string {
    return `Dialogue: 0,${this.toASS(start)},${this.toASS(end)},Default,,0,0,0,,${text}`;
  }

  private extractWords(deepgramResponse: DeepgramResponse) {
    // If we absolutely need an array, we'll build it, but generators are safer for processing.
    const words: any[] = [];
    const utterances = deepgramResponse.results.utterances || [];
    for (const utt of utterances) {
      words.push(...utt.words);
    }
    return words;
  }

  public *generate(
    deepgramResponse: DeepgramResponse,
    entrance: EntranceAnimation | undefined,
    exit: ExitAnimation | undefined,
    width: number,
    height: number,
    alignment: number = 2,
    marginV: number = 40,
    marginL: number = 0,
    marginR: number = 0,
    maxWordsPerLine: number = 0, // 0 means use default utterances
    animationMode: AnimationMode = "karaoke",
    highlightColor: string = "&H0000FF&",
    borderStyle: number = 1,
    primaryColor: string = "&H00FFFFFF&",
  ): IterableIterator<string> {
    if (maxWordsPerLine > 0) {
      const allWords = this.extractWords(deepgramResponse);
      for (let i = 0; i < allWords.length; i += maxWordsPerLine) {
        const chunk = allWords.slice(i, i + maxWordsPerLine);
        const startTime = chunk[0].start;
        const endTime = chunk[chunk.length - 1].end;

        const line = this.applyUtteranceAnimation(
          { start: startTime, end: endTime, words: chunk },
          entrance,
          exit,
          width,
          height,
          alignment,
          marginV,
          marginL,
          marginR,
          animationMode,
          highlightColor,
          borderStyle,
          primaryColor,
        );
        if (line) yield line;
      }
    } else {
      const utterances = deepgramResponse.results.utterances || [];
      for (const utt of utterances) {
        const line = this.applyUtteranceAnimation(
          utt,
          entrance,
          exit,
          width,
          height,
          alignment,
          marginV,
          marginL,
          marginR,
          animationMode,
          highlightColor,
          borderStyle,
          primaryColor,
        );
        if (line) yield line;
      }
    }
  }

  private applyUtteranceAnimation(
    utt: any,
    entrance: EntranceAnimation | undefined,
    exit: ExitAnimation | undefined,
    width: number,
    height: number,
    alignment: number,
    marginV: number,
    marginL: number,
    marginR: number,
    animationMode: AnimationMode,
    highlightColor: string,
    borderStyle: number,
    primaryColor: string,
  ): string {
    let centerX = Math.round(width / 2);
    let centerY = Math.round(height / 2);
    const align = Number(alignment);

    if (align >= 7) {
      centerY = marginV; // Top
    } else if (align <= 3) {
      centerY = height - marginV; // Bottom
    }

    if (align === 1 || align === 4 || align === 7) {
      centerX = marginL; // Left
    } else if (align === 3 || align === 6 || align === 9) {
      centerX = width - marginR; // Right
    }

    const entranceTag = entrance
      ? this.getEntranceTag(entrance, centerX, centerY)
      : "";
    const exitTag = exit
      ? this.getExitTag(exit, utt.start, utt.end, centerX, centerY)
      : "";

    const rawHColor = highlightColor?.startsWith("#")
      ? this.hexToAss(highlightColor)
      : highlightColor;
    const hColor = this.inlineColor(rawHColor, "&H00FFFF&");
    const pColor = this.inlineColor(primaryColor, "&HFFFFFF&");

    let karaokeText = "";
    const lineStartMs = utt.start * 1000;

    for (let i = 0; i < utt.words.length; i++) {
      const word = utt.words[i];
      const wordStartMs = word.start * 1000;
      const wordEndMs = word.end * 1000;

      // Duration in centiseconds for the \k tag
      const durationCs = Math.round((wordEndMs - wordStartMs) / 10);

      // Calculate delay from previous word or start of line
      const prevEndMs = i === 0 ? lineStartMs : utt.words[i - 1].end * 1000;
      const delayCs = Math.round((wordStartMs - prevEndMs) / 10);

      const text = word.punctuated_word ?? word.word;

      if (animationMode === "highlight") {
        const tStart = Math.max(0, Math.round(wordStartMs - lineStartMs));
        const tEnd = Math.max(0, Math.round(wordEndMs - lineStartMs));

        if (borderStyle === 3) {
          // For solid background box, \bord warps the box padding.
          // Instead, animate the fill color (\1c) from primary -> highlight -> primary.
          if (tStart === 0) {
            karaokeText += `{\\1c${hColor}\\t(${tEnd},${tEnd},\\1c${pColor})}${text}${i < utt.words.length - 1 ? " " : ""}`;
          } else {
            karaokeText += `{\\1c${pColor}\\t(${tStart},${tStart},\\1c${hColor})\\t(${tEnd},${tEnd},\\1c${pColor})}${text}${i < utt.words.length - 1 ? " " : ""}`;
          }
        } else {
          // Standard outline highlight (modifies outline color and thickness)
          const baseColor = "&H000000&";
          if (tStart === 0) {
            karaokeText += `{\\3c${hColor}\\bord6\\t(${tEnd},${tEnd},\\3c${baseColor}\\bord2)}${text}${i < utt.words.length - 1 ? " " : ""}`;
          } else {
            karaokeText += `{\\3c${baseColor}\\bord2\\t(${tStart},${tStart},\\3c${hColor}\\bord6)\\t(${tEnd},${tEnd},\\3c${baseColor}\\bord2)}${text}${i < utt.words.length - 1 ? " " : ""}`;
          }
        }
      } else if (animationMode === "karaoke") {
        // Add delay if there's a gap between words
        if (delayCs > 0) {
          karaokeText += `{\\k${delayCs}} `;
        }

        // Add the word with karaoke highlight tag
        // \1c sets the primary color (filled color) to the requested highlightColor.
        // \2c sets the secondary color (unfilled color) to the base primaryColor.
        // \kf animates the fill from secondary to primary.
        karaokeText += `{\\1c${hColor}\\2c${pColor}\\kf${durationCs}}${text}${i < utt.words.length - 1 ? " " : ""}`;
      } else {
        karaokeText += `${text}${i < utt.words.length - 1 ? " " : ""}`;
      }
    }

    const hasMove = entranceTag.includes("\\move") || exitTag.includes("\\move");
    const posTag = hasMove ? "" : `\\pos(${centerX},${centerY})`;

    return this.formatDialogue(
      utt.start,
      utt.end,
      `{\\an${alignment}${posTag}${entranceTag}${exitTag}}${karaokeText}`,
    );
  }

  private getEntranceTag(
    type: EntranceAnimation,
    centerX: number,
    centerY: number,
  ): string {
    const map: Record<string, string> = {
      "fade-in": "\\fad(300,0)",
      "pop-in": "\\fad(200,0)\\t(0,200,\\fscx100\\fscy100)\\fscx80\\fscy80",
      "slide-up": `\\move(${centerX},${centerY + 40},${centerX},${centerY},0,300)`,
      "slide-down": `\\move(${centerX},${centerY - 40},${centerX},${centerY},0,300)`,
      "slide-left": `\\move(${centerX - 60},${centerY},${centerX},${centerY},0,300)`,
      "slide-right": `\\move(${centerX + 60},${centerY},${centerX},${centerY},0,300)`,
      "zoom-in": "\\t(0,300,\\fscx100\\fscy100)\\fscx130\\fscy130",
      "bounce-in":
        "\\t(0,150,\\fscx110\\fscy110)\\t(150,300,\\fscx100\\fscy100)\\fscx80\\fscy80",
    };
    return map[type] ?? map["fade-in"];
  }

  private getExitTag(
    type: ExitAnimation,
    start: number,
    end: number,
    centerX: number,
    centerY: number,
  ): string {
    const duration = Math.round((end - start) * 1000);
    const animStart = Math.max(0, duration - 300);
    const map: Record<string, string> = {
      "fade-out": "\\fad(0,300)",
      "slide-out-down": `\\move(${centerX},${centerY},${centerX},${centerY + 40},${animStart},${duration})`,
      "shrink-out": `\\t(${animStart},${duration},\\fscx0\\fscy0)`,
    };
    return map[type] ?? map["fade-out"];
  }
}

export default CaptionAnimator;
