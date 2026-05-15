export type EntranceAnimation =
  | "fade-in"
  | "pop-in"
  | "slide-up"
  | "slide-down"
  | "slide-left"
  | "slide-right"
  | "zoom-in"
  | "bounce-in";

export type ExitAnimation = "fade-out" | "slide-out-down" | "shrink-out";

export type AnimationMode = "karaoke" | "highlight" | "none";

export interface CaptionAnimations {
  mode?: AnimationMode;
  entrance?: EntranceAnimation;
  exit?: ExitAnimation;
  highlightColor?: string;
}
