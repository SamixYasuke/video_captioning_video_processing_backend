import { model, Schema, Document } from "mongoose";
import { DeepgramResponse } from "@/types/deepgram";

export const VIDEO_STATUSES = [
  "pending",
  "uploaded",
  "transcribed",
  "processing",
  "burned",
  "failed",
] as const;

export type VideoStatus = (typeof VIDEO_STATUSES)[number];

export interface IVideoMetaData {
  file_name: string;
  encoding: string;
  mime_type: string;
  size: number;
  duration: number;
}

export interface ICaptionData {
  _id?: Schema.Types.ObjectId | string;
  confidence: number;
  language_code: string;
  is_original: boolean;
  caption_response?: DeepgramResponse;
  edited_at?: Date;
}

export interface IVideoOutput {
  _id?: Schema.Types.ObjectId | string;
  language_code: string;
  video_key: string;
  status: string;
  error?: string;
  created_at?: Date | string;
}

export interface IVideoKey {
  uploaded: string;
  processed: string;
}

export interface IVideo extends Document {
  user_id: Schema.Types.ObjectId | string;
  video_key: IVideoKey;
  meta_data: IVideoMetaData;
  captions: ICaptionData[];
  outputs: IVideoOutput[];
  status: VideoStatus;
  credits_used: number;
  files_deleted_at?: Date | string | null;
  files_expire_at?: Date | string | null;
  created_at?: Date | string;
  updated_at?: Date | string;
}

const videoSchema = new Schema(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    video_key: {
      uploaded: {
        type: String,
        required: false,
      },
      processed: {
        type: String,
        required: false,
      },
    },
    meta_data: {
      file_name: {
        type: String,
      },
      encoding: {
        type: String,
      },
      mime_type: {
        type: String,
      },
      size: {
        type: Number,
      },
      duration: {
        type: Number,
      },
    },
    captions: [
      {
        confidence: {
          type: Number,
        },
        language_code: {
          type: String,
        },
        is_original: {
          type: Boolean,
          default: false,
        },
        caption_response: {
          type: Schema.Types.Mixed,
        },
        edited_at: {
          type: Date,
        },
      },
    ],
    outputs: [
      {
        language_code: {
          type: String,
        },
        video_key: {
          type: String,
        },
        status: {
          type: String,
        },
        error: {
          type: String,
        },
        created_at: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    status: {
      type: String,
      enum: VIDEO_STATUSES,
      default: "pending",
    },
    credits_used: {
      type: Number,
      default: 0,
    },
    files_deleted_at: {
      type: Date,
      default: null,
    },
    files_expire_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

const Video = model<IVideo>("Video", videoSchema);

export default Video;
