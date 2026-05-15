import { hashString } from "@/utils/helper";
import { model, Schema, Document } from "mongoose";

export type UserRole = "content_creator" | "educator" | "marketer" | "others";
export type UserUseCase =
  | "youtube"
  | "courses"
  | "marketing"
  | "podcast"
  | "subtitles";
export type Platform =
  | "youtube"
  | "tiktok"
  | "instagram"
  | "twitter"
  | "facebook";
export type MonthlyVideoVolume = "1_5" | "5_20" | "20_50" | "50_plus";
export type HeardFrom =
  | "google"
  | "youtube"
  | "twitter"
  | "tiktok"
  | "friend"
  | "product_hunt"
  | "others";
export type PreviousTool =
  | "capcut"
  | "veed"
  | "descript"
  | "premiere"
  | "none"
  | "others";

interface Onboarding {
  role: UserRole;
  other_role?: string;
  use_case: UserUseCase;
  platform: Platform[];
  monthly_video_volume: MonthlyVideoVolume;
  heard_from: HeardFrom;
  other_heard_from?: string;
  previous_tools: PreviousTool[];
  other_previous_tool?: string;
  is_completed: boolean;
}

export interface IUser extends Document {
  google_id: string;
  first_name: string;
  last_name: string;
  email: string;
  picture: string;
  password: string;
  credit: number;
  onboarding: Onboarding;
  created_at: Date;
  updated_at: Date;
}

const userSchema = new Schema<IUser>(
  {
    google_id: {
      type: String,
      unique: true,
      sparse: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    picture: {
      type: String,
    },
    first_name: {
      type: String,
      required: true,
    },
    last_name: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    credit: {
      type: Number,
      default: 25,
    },
    onboarding: {
      role: {
        type: String,
        enum: ["content_creator", "educator", "marketer", "others"],
      },
      other_role: {
        type: String,
      },
      use_case: {
        type: String,
        enum: ["youtube", "courses", "marketing", "podcast", "subtitles"],
      },
      platform: {
        type: [String],
        enum: ["youtube", "tiktok", "instagram", "twitter", "facebook"],
      },
      monthly_video_volume: {
        type: String,
        enum: ["1_5", "5_20", "20_50", "50_plus"],
      },
      heard_from: {
        type: String,
        enum: [
          "google",
          "youtube",
          "twitter",
          "tiktok",
          "friend",
          "product_hunt",
          "others",
        ],
      },
      other_heard_from: {
        type: String,
      },
      previous_tools: {
        type: [String],
        enum: ["capcut", "veed", "descript", "premiere", "none", "others"],
      },
      other_previous_tool: {
        type: String,
      },
      is_completed: {
        type: Boolean,
        default: false,
      },
    },
  },
  {
    timestamps: {
      createdAt: "created_at",
      updatedAt: "updated_at",
    },
  },
);

userSchema.pre("save", async function () {
  if (!this.isModified("password")) {
    return;
  }
  this.password = await hashString(this.password);
});

const User = model<IUser>("User", userSchema);

export default User;
