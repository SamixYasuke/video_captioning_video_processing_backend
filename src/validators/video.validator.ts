import { body } from "express-validator";
import translateLanguages from "@/utils/translate";
import detectLanguages from "@/utils/detect";

const allSupportedCodes = [
  ...translateLanguages.map((l) => l.code),
  ...Object.values(detectLanguages).flat(),
];

const mergeVideoAndCaptionValidator = [
  body("job_id").notEmpty().withMessage("Job ID is required"),

  body("video_id")
    .notEmpty()
    .withMessage("Video ID is required")
    .isMongoId()
    .withMessage("Invalid Video ID"),

  body("style").optional().isObject().withMessage("Style must be an object"),
  body("style.fontName")
    .optional()
    .isIn([
      "Comic Sans MS",
      "Open Sans",
      "Verdana",
      "Impact",
      "Poppins",
      "Arial",
      "Inter",
      "Roboto",
      "Montserrat",
      "Chiller",
      "Harrington",
      "Consolas",
    ])
    .withMessage("Please select a supported font name from the list."),

  body("style.fontSize")
    .optional()
    .isInt({ min: 1, max: 200 })
    .withMessage("Font size must be a number"),

  body("style.primaryColor")
    .optional()
    .trim()
    .matches(/^&H[0-9A-Fa-f]{6,8}$/)
    .withMessage("Primary color must be in BGR format (e.g., &H00FFFF)"),

  body("style.outlineColor")
    .optional()
    .trim()
    .matches(/^&H[0-9A-Fa-f]{6,8}$/)
    .withMessage("Outline color must be in BGR format"),

  body("style.backColor")
    .optional()
    .trim()
    .matches(/^&H[0-9A-Fa-f]{6,8}$/)
    .withMessage("Background color must be in BGR format"),

  body("style.outline")
    .optional()
    .isFloat({ min: 0, max: 20 })
    .withMessage("Outline must be between 0 and 20"),

  body("style.alignment")
    .optional()
    .isInt({ min: 1, max: 9 })
    .withMessage("Alignment must be a numpad value (1-9)"),

  body("style.borderStyle")
    .optional()
    .isIn([1, 3])
    .withMessage("Border style must be 1 (outline) or 3 (box)"),

  body("style.marginV")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Vertical margin must be a positive number"),

  body("style.spacing")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Spacing must be a number"),

  body("style.bold").optional().isIn([0, 1]).withMessage("Bold must be 0 or 1"),

  body("style.italic")
    .optional()
    .isIn([0, 1])
    .withMessage("Italic must be 0 or 1"),

  body("style.shadow")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Shadow must be a number"),

  body("language")
    .optional()
    .isString()
    .withMessage("Language must be a string")
    .isIn(allSupportedCodes)
    .withMessage(
      "Invalid language code. Please provide a valid source or translation language code.",
    ),

  body("animations")
    .optional()
    .isObject()
    .withMessage("Animations must be an object"),

  body("animations.mode")
    .optional()
    .isIn(["karaoke", "highlight"])
    .withMessage("Animation mode must be 'karaoke' or 'highlight'"),

  body("animations.entrance")
    .optional()
    .isIn([
      "fade-in",
      "pop-in",
      "slide-up",
      "slide-down",
      "slide-left",
      "slide-right",
      "zoom-in",
      "bounce-in",
    ])
    .withMessage("Entrance animation must be a supported type"),

  body("animations.exit")
    .optional()
    .isIn(["fade-out", "slide-out-down", "shrink-out"])
    .withMessage("Exit animation must be a supported type"),

  body("animations.highlightColor")
    .optional()
    .isString()
    .withMessage("Highlight color must be a string (e.g. '&H0000FF&')"),

  body("max_length")
    .default(7)
    .isInt({ min: 1, max: 7 })
    .withMessage("max_length must be an integer between 1 and 7"),
];

export { mergeVideoAndCaptionValidator };
