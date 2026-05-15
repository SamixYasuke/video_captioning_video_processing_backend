import { CaptionAnimations } from "./animations";

export type TranscodeJobData = {
  userId?: string;
  video_id?: string;
  max_length?: number;
  style?: any;
  language?: string; // Target language for translation or selected language for burning
  animations?: CaptionAnimations;
};

export type VideoJobNames =
  | "transcribe"
  | "burn"
  | "translate"
  | "cleanup-expired-videos";

export interface DeepgramGenericError {
  err_code: string;
  err_msg: string;
  request_id: string;
}
