import { Schema, model, models, Document, Model } from "mongoose";

// Strongly typed shape of an Event document (business fields only).
export interface EventAttrs {
  title: string;
  slug: string;
  description: string;
  overview: string;
  image: string;
  venue: string;
  location: string;
  date: string; // Stored as ISO date string (e.g. 2025-01-31)
  time: string; // Stored as 24h time string (e.g. 18:30)
  mode: string;
  audience: string;
  agenda: string[];
  organizer: string;
  tags: string[];
}

// Event document type including Mongoose's built-in document properties.
export interface EventDocument extends EventAttrs, Document {
  createdAt: Date;
  updatedAt: Date;
}

// Event model type.
export type EventModel = Model<EventDocument>;

// Helper to create URL-friendly slugs from titles.
const slugify = (value: string): string => {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

const EventSchema = new Schema<EventDocument, EventModel>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true },
    description: { type: String, required: true, trim: true },
    overview: { type: String, required: true, trim: true },
    image: { type: String, required: true, trim: true },
    venue: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    mode: { type: String, required: true, trim: true },
    audience: { type: String, required: true, trim: true },
    agenda: { type: [String], required: true },
    organizer: { type: String, required: true, trim: true },
    tags: { type: [String], required: true },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt.
    strict: true,
  },
);

// Ensure a unique index is created on slug for fast lookups and uniqueness.
EventSchema.index({ slug: 1 }, { unique: true });

// Normalize date to ISO (YYYY-MM-DD) and time to 24h HH:mm, generate slug,
// and perform additional validation before saving.
EventSchema.pre("save", function (next) {
  // Validate required string fields are non-empty after trimming.
  const requiredStringFields: Array<keyof EventAttrs> = [
    "title",
    "description",
    "overview",
    "image",
    "venue",
    "location",
    "date",
    "time",
    "mode",
    "audience",
    "organizer",
  ];

  for (const field of requiredStringFields) {
    const value = this[field];
    if (typeof value !== "string" || value.trim().length === 0) {
      return next(new Error(`Field "${field}" is required and cannot be empty.`));
    }
  }

  // Validate array fields contain at least one non-empty string.
  const arrayFields: Array<keyof EventAttrs> = ["agenda", "tags"];
  for (const field of arrayFields) {
    const value = this[field];
    if (!Array.isArray(value) || value.length === 0) {
      return next(new Error(`Field "${field}" must be a non-empty array.`));
    }
    const invalidItem = value.find(
      (item) => typeof item !== "string" || item.trim().length === 0,
    );
    if (invalidItem !== undefined) {
      return next(new Error(`Field "${field}" must contain only non-empty strings.`));
    }
  }

  // Generate or regenerate slug only when title changes.
  if (this.isNew || this.isModified("title")) {
    this.slug = slugify(this.title);
  }

  // Normalize date to ISO format (YYYY-MM-DD).
  if (this.isNew || this.isModified("date")) {
    const parsedDate = new Date(this.date);
    if (Number.isNaN(parsedDate.getTime())) {
      return next(new Error("Invalid date format. Expected a valid date string."));
    }
    const isoDate = parsedDate.toISOString().split("T")[0];
    this.date = isoDate;
  }

  // Normalize time to 24h HH:mm format.
  if (this.isNew || this.isModified("time")) {
    const time = this.time.trim();
    const timeMatch = time.match(/^([0-1]?\d|2[0-3]):([0-5]\d)(?:\s*(AM|PM))?$/i);

    if (!timeMatch) {
      return next(
        new Error(
          "Invalid time format. Expected HH:mm (24h) or HH:mm AM/PM.",
        ),
      );
    }

    let hours = parseInt(timeMatch[1], 10);
    const minutes = timeMatch[2];
    const meridiem = timeMatch[3]?.toUpperCase();

    // Convert 12h clock with AM/PM to 24h.
    if (meridiem) {
      if (meridiem === "PM" && hours < 12) {
        hours += 12;
      } else if (meridiem === "AM" && hours === 12) {
        hours = 0;
      }
    }

    const normalizedTime = `${hours.toString().padStart(2, "0")}:${minutes}`;
    this.time = normalizedTime;
  }

  next();
});

// Reuse existing model in development to avoid OverwriteModelError.
export const Event: EventModel =
  (models.Event as EventModel | undefined) || model<EventDocument, EventModel>("Event", EventSchema);

export default Event;
