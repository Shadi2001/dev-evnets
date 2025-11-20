import { Schema, model, models, Document, Model, Types } from "mongoose";
import { Event } from "./event.model";

// Strongly typed shape of a Booking document (business fields only).
export interface BookingAttrs {
  eventId: Types.ObjectId;
  email: string;
}

// Booking document type including Mongoose's built-in document properties.
export interface BookingDocument extends BookingAttrs, Document {
  createdAt: Date;
  updatedAt: Date;
}

// Booking model type.
export type BookingModel = Model<BookingDocument>;

// Simple email validation regex for basic structural checks.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const BookingSchema = new Schema<BookingDocument, BookingModel>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
      index: true, // Index for faster lookups by event.
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (value: string): boolean => EMAIL_REGEX.test(value),
        message: "Invalid email format.",
      },
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt.
    strict: true,
  },
);

// Pre-save hook to ensure the referenced event exists and email is valid.
BookingSchema.pre("save", async function (next) {
  // Validate email again here to provide a consistent error path.
  if (!EMAIL_REGEX.test(this.email)) {
    return next(new Error("Invalid email format."));
  }

  // Only check the event reference when it's new or modified.
  if (this.isNew || this.isModified("eventId")) {
    const exists = await Event.exists({ _id: this.eventId }).lean();
    if (!exists) {
      return next(new Error("Referenced event does not exist."));
    }
  }

  next();
});

// Reuse existing model in development to avoid OverwriteModelError.
export const Booking: BookingModel =
  (models.Booking as BookingModel | undefined) ||
  model<BookingDocument, BookingModel>("Booking", BookingSchema);

export default Booking;
